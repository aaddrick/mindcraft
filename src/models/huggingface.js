import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export default class HuggingFace {
    constructor(model_name) {
        this.model_name = model_name.replace('huggingface/', '') || 'BAAI/bge-large-en-v1.5';
    }

    async embed(text) {
        console.log('Generating local embedding for:', text.substring(0, 50) + '...');
        try {
            // Call the Python script to generate embeddings
            const { stdout } = await execAsync(
                `python3 -c "from sentence_transformers import SentenceTransformer; import sys; model = SentenceTransformer('${this.model_name}'); print(model.encode(sys.argv[1]).tolist())" "${text}"`,
                { env: { PATH: `/app/venv/bin:${process.env.PATH}` } }
            );
            const embeddings = JSON.parse(stdout);
            console.log('Successfully generated embedding:', embeddings.length, 'dimensions');
            return embeddings;
        } catch (err) {
            console.error('Local embedding generation error:', err);
            throw new Error('Failed to generate embedding locally');
        }
    }
}

export function createEmbeddingModel(config) {
    if (!config || !config.api) {
        throw new Error('Invalid embedding configuration');
    }

    if (config.api === 'huggingface') {
        return new HuggingFace(config.model || 'BAAI/bge-large-en-v1.5');
    }
    throw new Error(`Unknown embedding: ${config.api}`);
}
