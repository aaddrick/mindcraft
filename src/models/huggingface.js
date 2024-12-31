import { SentenceTransformer } from 'sentence-transformers';
import { getKey } from '../utils/keys.js';

export class HuggingFace {
    constructor(model_name, url) {
        this.model_name = model_name.replace('huggingface/', '');
        this.url = url;

        // Load the local model
        this.model = new SentenceTransformer(this.model_name || 'BAAI/bge-large-en-v1.5');
    }

    async sendRequest(turns, systemMessage) {
        // Not used for embeddings, but required for interface compatibility
        return 'Local model does not support chat requests';
    }

    async embed(text) {
        console.log('Generating local embedding for:', text.substring(0, 50) + '...');
        try {
            const embeddings = await this.model.encode(text);
            console.log('Successfully generated embedding:', embeddings.length, 'dimensions');
            return embeddings;
        } catch (err) {
            console.error('Local embedding generation error:', err);
            throw new Error('Failed to generate embedding locally');
        }
    }
}
