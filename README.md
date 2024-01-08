# cygni-competence-vectordbs

For this session we'll be using a vector database called [Chroma](https://docs.trychroma.com/) and a SentenceTransformer for creating embeddings called [Infinity](https://github.com/michaelfeil/infinity).

This setup could be used as the Retrieval step in a [RAG](https://www.promptingguide.ai/techniques/rag). 

Here is a diagram for what we will be building in this lab:
![Here is an overall system design.](/images/system-design.png)

First, let's get all the parts running. 

1. Infinity
    - To generate the vector embeddings we need a language model and an application that can extract the vector. A very common library for this is called [SentenceTransformer](https://www.sbert.net/) which is implemented in Python. Another way is to use an online service to get the embeddings, for example (OpenAI's API)[https://platform.openai.com/docs/guides/embeddings/what-are-embeddings]. In this lab we'll use a self-hosted API called (Infinity)[https://github.com/michaelfeil/infinity].
    - Start the Infinity API: 
    - ```docker run -it -p 8080:8080 michaelf34/infinity:latest --model-name-or-path sentence-transformers/all-MiniLM-L6-v2 --port 8080```
    - Let's generate a vector embedding, go to the (Swagger docs for the API)[http://0.0.0.0:8080/docs#/default/_embeddings_v1_embeddings_post], click on "Try it out".
    - [](/images/infinity-swagger.png)