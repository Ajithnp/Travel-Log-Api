import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { GeminiProvider } from './gemini-ai';

async function test() {
    const gemini = new GeminiProvider();
    const llm = gemini.getChatModel();
    const embeddings = gemini.getEmbeddingModel();

    console.log('Testing LLM...');
    const llmResponse = await llm.invoke('Say hello in one sentence');
    console.log('LLM Response:', llmResponse.content);

    console.log('\nTesting Embeddings...');
    const vector = await embeddings.embedQuery('Munnar weekend trip');
    console.log('Embedding vector length:', vector.length);
   
}

test().catch(console.error);