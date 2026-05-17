import { config } from './config';
import { createBot } from './bot';

createBot(config.token, config.channelId, config.anthropicKey);
