import OpenAI from 'openai';
import { OpenAIResponseHandler } from './OpenAIResponseHandler';
import type { AIAgent } from '../types';
import type { Channel, DefaultGenerics, Event, StreamChat } from 'stream-chat';

export class OpenAIAgent implements AIAgent {
  private openai?: OpenAI;
  private assistant?: OpenAI.Beta.Assistants.Assistant;
  private openAiThread?: OpenAI.Beta.Threads.Thread;
  private lastInteractionTs = Date.now();

  private handlers: OpenAIResponseHandler[] = [];

  constructor(
    readonly chatClient: StreamChat,
    readonly channel: Channel,
  ) {}

  dispose = async () => {
    this.chatClient.off('message.new', this.handleMessage);
    await this.chatClient.disconnectUser();

    this.handlers.forEach((handler) => handler.dispose());
    this.handlers = [];
  };

  getLastInteraction = (): number => this.lastInteractionTs;

  init = async () => {
    const apiKey = process.env.OPENAI_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({ apiKey });
    this.assistant = await this.openai.beta.assistants.create({
      name: 'Stream AI Assistant',
      instructions: `
        You are a helpful, professional AI assistant for GetStream.io, a company providing scalable APIs and SDKs for building in-app chat, video, and activity feeds. Assist users by answering their questions clearly and accurately.

        If users ask about any of the following, respond with the corresponding information:

        Support or contacting a human: Direct them to https://getstream.io/contact/support/

        Help Center or documentation lookup: Point them to https://support.getstream.io/hc/en-us

        Pricing details: Guide them to https://getstream.io/chat/pricing/

        Company/team info: Refer them to https://getstream.io/team/

        Documentation-specific queries:

        Chat API/docs: https://getstream.io/chat/docs/

        Video & audio docs: https://getstream.io/video/docs

        Activity Feed docs: https://getstream.io/activity-feeds/docs

        Moderation docs: https://getstream.io/moderation/docs

        For anything related to configuring Stream, accessing API keys, managing users, teams, or billing, direct users to https://dashboard.getstream.io/

        If you're unsure or the topic is not covered, say: "I'm not certain about that, but I recommend reaching out to our support team." Keep your responses friendly, accurate, and focused on helping users efficiently navigate GetStream.io's tools and resources.
    `,
      tools: [
        { type: 'code_interpreter' },
        {
          type: 'function',
          function: {
            name: 'getCurrentTemperature',
            description: 'Get the current temperature for a specific location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state, e.g., San Francisco, CA',
                },
                unit: {
                  type: 'string',
                  enum: ['Celsius', 'Fahrenheit'],
                  description:
                    "The temperature unit to use. Infer this from the user's location.",
                },
              },
              required: ['location', 'unit'],
            },
          },
        },
      ],
      model: 'gpt-4o',
    });
    this.openAiThread = await this.openai.beta.threads.create();

    this.chatClient.on('message.new', this.handleMessage);
  };

  private handleMessage = async (e: Event<DefaultGenerics>) => {
    if (!this.openai || !this.openAiThread || !this.assistant) {
      console.log('OpenAI not initialized');
      return;
    }

    if (!e.message || e.message.ai_generated) {
      console.log('Skip handling ai generated message');
      return;
    }

    const message = e.message.text;
    if (!message) return;

    this.lastInteractionTs = Date.now();

    await this.openai.beta.threads.messages.create(this.openAiThread.id, {
      role: 'user',
      content: message,
    });

    const { message: channelMessage } = await this.channel.sendMessage({
      text: '',
      ai_generated: true,
    });

    await this.channel.sendEvent({
      type: 'ai_indicator.update',
      ai_state: 'AI_STATE_THINKING',
      cid: channelMessage.cid,
      message_id: channelMessage.id,
    });

    const run = this.openai.beta.threads.runs.stream(this.openAiThread.id, {
      assistant_id: this.assistant.id,
    });

    const handler = new OpenAIResponseHandler(
      this.openai,
      this.openAiThread,
      run,
      this.chatClient,
      this.channel,
      channelMessage,
    );
    void handler.run();
    this.handlers.push(handler);
  };
}
