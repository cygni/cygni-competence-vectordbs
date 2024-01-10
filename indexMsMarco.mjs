import { ChromaClient } from 'chromadb'
import SentenceTransformer from './sentence-transformer.mjs'
import fs  from 'fs';
import readline from 'readline';

const COLLECTION_NAME = 'msmarco';
const client = new ChromaClient();
const embedder = new SentenceTransformer('key-not-needed');


// Prepare the collection
const collection = await client.getOrCreateCollection({
  name: COLLECTION_NAME,
  embeddingFunction: embedder,
});

await addDataInBatch('./msmarco/msmarco-subset.tsv', 20); 

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
    // Process the line: qid, pid, query, passage
    const lineItems = line.split('\t');
    ids.push(lineItems[0] + '_' + lineItems[1]);
    metadatas.push({ 
      source: "msmarco",
      query: lineItems[2],
      passage: '' //lineItems[3]
     });
    documents.push(lineItems[3]);
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

