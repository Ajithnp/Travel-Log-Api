import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { GeminiAi } from './gemini-ai';

async function test() {
    const gemini = new GeminiAi();
    const llm = gemini.getChatModel();
    const embeddings = gemini.getEmbeddingModel();

    console.log('Testing LLM...');
    const llmResponse = await llm.invoke('Say hello in one sentence');
    console.log('LLM Response:', llmResponse.content);

    console.log('\nTesting Embeddings...');
    const vector = await embeddings.embedQuery('Munnar weekend trip');
    console.log('Embedding vector length:', vector.length);
    // 768 print ആകണം — Gemini embedding dimension
}

test().catch(console.error);