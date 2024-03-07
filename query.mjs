import { ChromaClient } from 'chromadb'
import SentenceTransformer from './sentence-transformer.mjs'

const COLLECTION_BOOKS = 'devops-books';
const COLLECTION_MSMARCO = 'msmarco';
//[WINDOWS] const client = new ChromaClient({path: 'http://localhost:<ANOTHER_PORT>'});
const client = new ChromaClient({path: 'http://localhost:8000'});
const embedder = new SentenceTransformer('key-not-needed');


// Prepare the collection
const collection = await client.getCollection({
  name: COLLECTION_MSMARCO,
  embeddingFunction: embedder
});

const results = await collection.query({
  nResults: 10,
  includeMetadata: true,
  queryTexts: ["What is the weather like in Jamaica?"],
});

console.log(results); 
