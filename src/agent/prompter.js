import { readFileSync, mkdirSync, writeFileSync} from 'fs';
import { Examples } from '../utils/examples.js';
import { getCommandDocs } from './commands/index.js';
import { getSkillDocs } from './library/index.js';
import { stringifyTurns } from '../utils/text.js';
import { getCommand } from './commands/index.js';

import { Gemini } from '../models/gemini.js';
import { GPT } from '../models/gpt.js';
import { Claude } from '../models/claude.js';
import { ReplicateAPI } from '../models/replicate.js';
import { Local } from '../models/local.js';
import { Novita } from '../models/novita.js';
import { GroqCloudAPI } from '../models/groq.js';
import { HuggingFace } from '../models/huggingface.js';
import { Qwen } from "../models/qwen.js";
import { Grok } from "../models/grok.js";
import { DeepSeek } from "../models/deepseek.js";

export class Prompter {
    constructor(agent, fp) {
        this.agent = agent;
        this.profile = JSON.parse(readFileSync(fp, 'utf8'));
        this.default_profile = JSON.parse(readFileSync('./profiles/_default.json', 'utf8'));

        for (let key in this.default_profile) {
            if (this.profile[key] === undefined)
                this.profile[key] = this.default_profile[key];
        }

        this.convo_examples = null;
        this.coding_examples = null;
        
        let name = this.profile.name;
        let chat = this.profile.model;
        this.cooldown = this.profile.cooldown ? this.profile.cooldown : 0;
        this.last_prompt_time = 0;
        this.awaiting_coding = false;

        // try to get "max_tokens" parameter, else null
        let max_tokens = null;
        if (this.profile.max_tokens)
            max_tokens = this.profile.max_tokens;
        if (typeof chat === 'string' || chat instanceof String) {
            chat = {model: chat};
            if (chat.model.includes('gemini'))
                chat.api = 'google';
            else if (chat.model.includes('gpt') || chat.model.includes('o1'))
                chat.api = 'openai';
            else if (chat.model.includes('claude'))
                chat.api = 'anthropic';
            else if (chat.model.includes('huggingface/'))
                chat.api = "huggingface";
            else if (chat.model.includes('meta/') || chat.model.includes('mistralai/') || chat.model.includes('replicate/'))
                chat.api = 'replicate';
            else if (chat.model.includes("groq/") || chat.model.includes("groqcloud/"))
                chat.api = 'groq';
            else if (chat.model.includes('novita/'))
                chat.api = 'novita';
            else if (chat.model.includes('qwen'))
                chat.api = 'qwen';
            else if (chat.model.includes('grok'))
                chat.api = 'xai';
            else if (chat.model.includes('deepseek'))
                chat.api = 'deepseek';
            else
                chat.api = 'ollama';
        }

        console.log('Using chat settings:', chat);

        if (chat.api === 'google')
            this.chat_model = new Gemini(chat.model, chat.url);
        else if (chat.api === 'openai')
            this.chat_model = new GPT(chat.model, chat.url);
        else if (chat.api === 'anthropic')
            this.chat_model = new Claude(chat.model, chat.url);
        else if (chat.api === 'replicate')
            this.chat_model = new ReplicateAPI(chat.model, chat.url);
        else if (chat.api === 'ollama')
            this.chat_model = new Local(chat.model, chat.url);
        else if (chat.api === 'groq') {
            this.chat_model = new GroqCloudAPI(chat.model.replace('groq/', '').replace('groqcloud/', ''), chat.url, max_tokens ? max_tokens : 8192);
        }
        else if (chat.api === 'huggingface')
            this.chat_model = new HuggingFace(chat.model, chat.url);
        else if (chat.api === 'novita')
            this.chat_model = new Novita(chat.model.replace('novita/', ''), chat.url);
        else if (chat.api === 'qwen')
            this.chat_model = new Qwen(chat.model, chat.url);
        else if (chat.api === 'xai')
            this.chat_model = new Grok(chat.model, chat.url);
        else if (chat.api === 'deepseek')
            this.chat_model = new DeepSeek(chat.model, chat.url);
        else
            throw new Error('Unknown API:', api);

        let embedding = this.profile.embedding;
        if (embedding === undefined) {
            if (chat.api !== 'ollama' && chat.api !== 'deepseek')
                embedding = {api: chat.api};
            else if (chat.api === 'deepseek')
                embedding = {api: 'openai', model: 'text-embedding-ada-002'}; // Default to OpenAI embeddings for DeepSeek
            else
                embedding = {api: 'none'};
        }
        else if (typeof embedding === 'string' || embedding instanceof String)
            embedding = {api: embedding};

        console.log('Using embedding settings:', embedding);

        try {
            if (embedding.api === 'google')
                this.embedding_model = new Gemini(embedding.model, embedding.url);
            else if (embedding.api === 'openai')
                this.embedding_model = new GPT(embedding.model, embedding.url);
            else if (embedding.api === 'replicate')
                this.embedding_model = new ReplicateAPI(embedding.model, embedding.url);
            else if (embedding.api === 'ollama')
                this.embedding_model = new Local(embedding.model, embedding.url);
            else if (embedding.api === 'qwen')
                this.embedding_model = new Qwen(embedding.model, embedding.url);
            else {
                this.embedding_model = null;
                console.log('Unknown embedding: ', embedding ? embedding.api : '[NOT SPECIFIED]', '. Using word overlap.');
            }
        }
        catch (err) {
            console.log('Warning: Failed to initialize embedding model:', err.message);
            console.log('Continuing anyway, using word overlap instead.');
            this.embedding_model = null;
        }

        mkdirSync(`./bots/${name}`, { recursive: true });
        writeFileSync(`./bots/${name}/last_profile.json`, JSON.stringify(this.profile, null, 4), (err) => {
            if (err) {
                throw new Error('Failed to save profile:', err);
            }
            console.log("Copy profile saved.");
        });
    }

    // ... rest of the file remains unchanged ...
}
