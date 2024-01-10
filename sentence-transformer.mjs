
class SentenceTransformer {

    constructor(api_key) {
        this.api_key = api_key;
    }

    async generate(texts) {
        // do things to turn texts into embeddings with an api_key perhaps
        const embeddings = await this.postApiData("http://0.0.0.0:8080/v1/embeddings", texts);

        // console.log(embeddings)

        const vectorEmbeddings = [];
        embeddings.data.forEach(element => {
            vectorEmbeddings.push(element.embedding);
        });
        return vectorEmbeddings;
    }


    async postApiData(url, sentences) {
        const data = {
            "input": sentences,
            "model": "all-MiniLM-L6-v2",
            "user": "unknown"
        }
        try {
            const options = {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(data)
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            return responseData;
        } catch (error) {
            console.error('Fetch error:', error.message);
        }
    }
}

export default SentenceTransformer;
