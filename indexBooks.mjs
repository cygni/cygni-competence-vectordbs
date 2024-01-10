import PDFParser from "pdf2json";
import decode from "urldecode"
import { ChromaClient } from 'chromadb'
import SentenceTransformer from './sentence-transformer.mjs'

const COLLECTION_NAME = 'devops-books';
const client = new ChromaClient();
const embedder = new SentenceTransformer('key_not_needed');


/* Use this if you need to start over. 
await client.deleteCollection({
    name: COLLECTION_NAME,
});
*/

const collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: embedder,
});

const books = [
    "1._The_History_of_Artificial_Intelligence_Author_Chris_Smith,Brian_McGuire,Ting_Huang.pdf",
    "10._Role_of_Artificial_Intelligence_in_Higher_Education_an_Empirical_Investigation_(Article)_Author_Suvrat_Jain,Dr_Roshita_Jain.pdf",
    "11._Implementation_of_Artificial_Intelligence_in_Imparting_Education_and_Evaluating_Student_Performance_(Article)_Author_Saravana_Kumar.pdf",
    "2._Advantages_of_Artificial_Intelligences_Uploads_and_Digital_Minds_Author_Kaj_Sotala.pdf",
    "3._Artificial_Intelligence_Author_Prakhar_Swarup.pdf",
    "4._Artificial_intelligence_and_Privacy_Author_Datatilsynet.pdf",
    "5._The_Future_of_Artificial_Intelligence_Author_Yeshiva_University.pdf",
    "51._The_Little_Book_of_Deep_Learning_Author_François_Fleuret.pdf",
    "52._Neural_Networks_and_Deep_Learning_Author_Michael_Nielsen.pdf",
    "53._Deep_learning_in_neural_networks_-_An_overview_Author_Jürgen_Schmidhuber.pdf",
    "6._Artificial_Intelligence_and_its_Role_in_Near_Future_Author_Jahanzaib_Shabbir,Tarique_Anwer.pdf",
    "7._The_Future_of_Higher_Education_in_the_Light_of_Artificial_Intelligence_Transformations_(Article)_Author_Share_Aiyed_M_Aldosar.pdf",
    "8._Possibilities_of_Artificial_Intelligence_in_Education_Author_Marta_Slepankova,Nuci_Krenare,Anita_Mirijamdotter.pdf",
    "9._Artificial_Intelligence_in_Education_The_Urgent_Need_to_Prepare_Teachers_for_Tomorrows_Schools_Author_Formation_et_profession.pdf",
];

async function parseAndIndexBook(book) {
    console.log(`Reading ${book}`)
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", async pdfData => {
            for (let pageNo = 0; pageNo < pdfData.Pages.length; pageNo++) {
                let pageContent = '';
                pdfData.Pages[pageNo].Texts.forEach(text => {
                    pageContent += decode(text.R[0].T) + ' ';
                });

                //console.log(pageContent)
                await indexPage(pageNo + 1, pageContent, book);
                console.log(`${book} page ${pageNo + 1}(${pdfData.Pages.length}) embedded`);
            }
            resolve();
        });

        pdfParser.loadPDF('./books/' + book);
    });
}

async function indexPage(pageNo, pageContent, currentBook) {
    const chunks = splitIntoChunks(pageContent);
    const ids = []
    const metadatas = []
    chunks.forEach((chunk, chunkIndex) => {
        ids.push(currentBook + '_p_' + pageNo + '_c_' + chunkIndex);
        metadatas.push({
            source: currentBook,
            page: pageNo,
            chunk: chunkIndex,
            totalNoofChunks: chunks.length,
        });
    });

    await collection.add({
        ids: ids,
        metadatas: metadatas,
        documents: chunks,
    });
}

function splitIntoChunks(text) {
    const words = text.split(/\s+/);
    const chunks = [];
    let chunk = [];

    words.forEach(word => {
        if (chunk.length < 256) {
            chunk.push(word);
        } else {
            chunks.push(chunk.join(' '));
            chunk = [word];
        }
    });

    // Add the last chunk if it's not empty
    if (chunk.length > 0) {
        chunks.push(chunk.join(' '));
    }

    return chunks;
}

for (const book of books) {
    await parseAndIndexBook(book).catch(error => {
        console.log("Something went wrong")
        console.error(error)
    });
}
