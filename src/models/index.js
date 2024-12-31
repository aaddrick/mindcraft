import HuggingFace from './huggingface.js';

export { HuggingFace };

export function createEmbeddingModel(config) {
    if (!config || !config.api) {
        throw new Error('Invalid embedding configuration');
    }

    if (config.api === 'huggingface') {
        return new HuggingFace(config.model || 'BAAI/bge-large-en-v1.5');
    }
    throw new Error(`Unknown embedding: ${config.api}`);
}
