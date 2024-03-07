import { ChromaClient } from 'chromadb'
import SentenceTransformer from './sentence-transformer.mjs'

const COLLECTION_RECIPES = 'recipes';
//[WINDOWS] const client = new ChromaClient({path: 'http://localhost:<ANOTHER_PORT>'});
const client = new ChromaClient({path: 'http://localhost:8000'});
const embedder = new SentenceTransformer('key-not-needed');


// Prepare the collection
const collection = await client.getCollection({
  name: COLLECTION_RECIPES,
  embeddingFunction: embedder
});

const results = await collection.query({
  nResults: 10,
  includeMetadata: true,
  queryTexts: ["I would like to cook something with short ribs. What are some recipes?"]
});

for (let i = results.ids[0].length-1; i >= 0 ; i--) {
  console.log(`${results.metadatas[0][i].name} - distance: ${results.distances[0][i]}`);
  console.log(results.metadatas[0][i].ingredients);
  console.log(results.metadatas[0][i].url);
  console.log('\n')
}
