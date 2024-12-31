import {toSinglePrompt} from '../utils/text.js';
import {getKey} from '../utils/keys.js';
import {HfInference} from "@huggingface/inference";

export class HuggingFace {
    constructor(model_name, url) {
        this.model_name = model_name.replace('huggingface/','');
        this.url = url;

        if (this.url) {
            console.warn("Hugging Face doesn't support custom urls!");
        }

        this.huggingface = new HfInference(getKey('HUGGINGFACE_API_KEY'));
    }

    async sendRequest(turns, systemMessage) {
        const stop_seq = '***';
        const prompt = toSinglePrompt(turns, null, stop_seq);
        let model_name = this.model_name || 'meta-llama/Meta-Llama-3-8B';

        const input = systemMessage + "\n" + prompt;
        let res = '';
        try {
            console.log('Awaiting Hugging Face API response...');
            for await (const chunk of this.huggingface.chatCompletionStream({
                model: model_name,
                messages: [{ role: "user", content: input }]
            })) {
                res += (chunk.choices[0]?.delta?.content || "");
            }
        } catch (err) {
            console.log(err);
            res = 'My brain disconnected, try again.';
        }
        console.log('Received.');
        console.log(res);
        return res;
    }

    async embed(text) {
        console.log('Generating Hugging Face embedding for:', text.substring(0, 50) + '...'); // Debugging line
        try {
            // Use the feature-extraction endpoint for embeddings
            const embedding = await this.huggingface.featureExtraction({
                model: this.model_name || 'BAAI/bge-large-en-v1.5', // Use the specified model or default
                inputs: text
            });
            console.log('Successfully generated embedding:', embedding.length, 'dimensions');
            return embedding;
        } catch (err) {
            console.error('Hugging Face embedding error:', err);
            throw new Error('Failed to get embedding from Hugging Face');
        }
    }
}
