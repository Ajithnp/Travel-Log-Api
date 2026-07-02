import { config } from "./env";
import { MongoClient } from 'mongodb';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import type { Collection, Document as MongoDoc } from '@langchain/mongodb/node_modules/mongodb';
import { Embeddings } from "@langchain/core/embeddings";


let nativeClient: MongoClient | null = null;

async function getNativeClient(): Promise<MongoClient> {
  if (!nativeClient) {
    nativeClient = new MongoClient(config.database.DB_URL);
    await nativeClient.connect();
  }
  return nativeClient;
}

export async function getVectorStore(embeddings: Embeddings) {
  const client = await getNativeClient();
  
  const collection: Collection<MongoDoc> = client
    .db(config.database.DB_NAME)
    .collection(config.database.VECTOR_COLLECTION_NAME) as unknown as Collection<MongoDoc>;

  return new MongoDBAtlasVectorSearch(embeddings, {
    collection,
    indexName: config.database.VECTOR_INDEX,
    textKey: 'combinedText',
    embeddingKey: 'embedding',
  });
}

// Retriever — top 5 matching trips (active, future, seats available)
export async function getRetriever(embeddings: Embeddings) {
  const vectorStore = await getVectorStore(embeddings);

  return vectorStore.asRetriever({
    k: 5, // top 5 results
    filter: {
      preFilter: {
        isActive: { $eq: true },
        // startDate: { $gte: new Date() },
        seatsAvailable: { $gt: 0 },
      },
    },
  });
}