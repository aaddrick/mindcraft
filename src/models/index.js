import HuggingFace from './huggingface.js';

export { HuggingFace };

export function createEmbeddingModel(config) {
    if (config.api === 'huggingface') {
        return new HuggingFace(config.model);
    }
    throw new Error(`Unknown embedding: ${config.api}`);
}
