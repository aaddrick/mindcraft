import OpenAIApi from 'openai';
import { getKey } from '../utils/keys.js';
import { strictFormat } from '../utils/text.js';

export class DeepSeek {
    constructor(model_name, url) {
        this.model_name = model_name || "deepseek-chat"; // Default to DeepSeek model

        let config = {};
        if (url)
            config.baseURL = url;
        else
            config.baseURL = 'https://api.deepseek.com'; // Default DeepSeek API URL

        config.apiKey = getKey('DEEPSEEK_API_KEY'); // Use DeepSeek API key

        this.openai = new OpenAIApi(config);
    }

    async sendRequest(turns, systemMessage, stop_seq='***') {
        let messages = [{'role': 'system', 'content': systemMessage}].concat(turns);

        const pack = {
            model: this.model_name,
            messages,
            stop: stop_seq,
        };

        let res = null;
        try {
            console.log('Awaiting DeepSeek API response...');
            let completion = await this.openai.chat.completions.create(pack);
            if (completion.choices[0].finish_reason == 'length')
                throw new Error('Context length exceeded'); 
            console.log('Received.');
            res = completion.choices[0].message.content;
        }
        catch (err) {
            if ((err.message == 'Context length exceeded' || err.code == 'context_length_exceeded') && turns.length > 1) {
                console.log('Context length exceeded, trying again with shorter context.');
                return await this.sendRequest(turns.slice(1), systemMessage, stop_seq);
            } else {
                console.log(err);
                res = 'My brain disconnected, try again.';
            }
        }
        return res;
    }

    async embed(text) {
        // DeepSeek does not provide embeddings, so this method is unused
        throw new Error('DeepSeek does not support embeddings. Use Hugging Face embeddings instead.');
    }
}