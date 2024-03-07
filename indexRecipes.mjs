import { ChromaClient } from 'chromadb'
import SentenceTransformer from './sentence-transformer.mjs'
import fs  from 'fs';
import readline from 'readline';

const COLLECTION_NAME = 'recipes';
//[WINDOWS] const client = new ChromaClient({path: 'http://localhost:<ANOTHER_PORT>'});
const client = new ChromaClient()
const embedder = new SentenceTransformer('key-not-needed');


// Prepare the collection
await client.deleteCollection({ name: COLLECTION_NAME });
const collection = await client.getOrCreateCollection({
  name: COLLECTION_NAME,
  embeddingFunction: embedder,
});

await addDataInBatch('./recipes/20170107-061401-recipeitems.json', 100); 

async function addDataInBatch(filePath, batchSize) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let ids = [];
  let metadatas = [];
  let documents = [];
  let index = 0;

  for await (const line of rl) {
    const recipe = JSON.parse(line);
    const ingredients = recipe.ingredients.replace(/\\n/g, ' ');
    ids.push(recipe._id.$oid);
    documents.push(recipe.name + '\n' + ingredients);
    metadatas.push({
      name: recipe.name,
      ingredients: ingredients,
      url: recipe.url,
      image: recipe.image,
      cookTime: recipe.cookTime,
      recipeYield: recipe.recipeYield,
      source: recipe.source,
    });
    index++;


    if (index % batchSize === 0) {
      await collection.upsert({
        ids: ids,
        metadatas: metadatas,
        documents: documents
      });
      ids = [];
      metadatas = [];
      documents = [];
      console.log(`Added ${index} documents`);
    }
  }

  // Add the remaining documents
  await collection.upsert({
    ids: ids,
    metadatas: metadatas,
    documents: documents
  });
  console.log(`Added ${index} documents`);
}

