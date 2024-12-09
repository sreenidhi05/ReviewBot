import os
from flask import Flask, request, jsonify
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document
import ollama

app = Flask(__name__)

vector_db_cache = None  
PERSIST_DIR = "./vector_store"
MODEL_NAME = "nomic-embed-text"

def create_or_load_vector_store(scraped_data, model=MODEL_NAME):
    if os.path.exists(PERSIST_DIR):
        vector_db = Chroma(persist_directory=PERSIST_DIR, embedding_function=OllamaEmbeddings(model=model))
        print("Loaded vector store from disk.")
    else:
        print("Creating a new vector store...")
        knowledge_base = [{'text': review['review']} for review in scraped_data.get('reviews', [])]

        if isinstance(scraped_data.get('specifications', []), list):
            knowledge_base += [{'text': spec['spec']} for spec in scraped_data['specifications']]
        documents = [Document(page_content=doc['text']) for doc in knowledge_base]
        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(documents)
        embeddings = OllamaEmbeddings(model=model)
        vector_db = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=PERSIST_DIR)
        vector_db.persist()  
        print("Vector store created and persisted to disk.")
    
    return vector_db

def retrieve_relevant_documents(query, vector_db, top_n=5):

    relevant_docs = vector_db.similarity_search(query, k=top_n)
    return relevant_docs

def generate_answer(query, context, model="llama3"):
    context_text = "\n".join([doc.page_content for doc in context])
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": f"Context: {context_text}\nQuestion: {query} please answer the question based only on the context. If the answer is not in the context, say 'Sorry, I cannot answer the question.' Keep the answer concise."}
    ]
    output = ollama.chat(model=model, messages=messages)
    return output['message']['content']

@app.route('/load', methods=['POST'])
def load_database():
    global vector_db_cache
    scraped_data = request.get_json().get("scraped_data")  
    if not scraped_data:
        return jsonify({"error": "Scraped data is required."}), 400

    try:
        vector_db_cache = create_or_load_vector_store(scraped_data)
        return jsonify({"message": "Knowledge base loaded successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/query', methods=['POST'])
def query():
    """
    API endpoint to handle queries.
    """
    global vector_db_cache
    data = request.get_json()
    query_text = data.get("query")

    if not query_text:
        return jsonify({"error": "Query is required."}), 400

    if vector_db_cache is None:
        return jsonify({"error": "Knowledge base is not loaded. Please load it using /load_database."}), 400

    try:
        relevant_documents = retrieve_relevant_documents(query_text, vector_db_cache)
        answer = generate_answer(query_text, relevant_documents)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "_main_":
    app.run(debug=True)































# import json
# import numpy as np
# from langchain_community.embeddings import OllamaEmbeddings
# from langchain_community.vectorstores import Chroma
# from langchain_community.llms import Ollama
# from langchain.text_splitter import CharacterTextSplitter
# from langchain.docstore.document import Document
# import ollama
# from flask import Flask, request, jsonify

# app = Flask(_name_)
# def load_knowledge_base(data):
   
#     try:
            
#         if not isinstance(data.get('reviews', []), list):
#             raise ValueError("'reviews' key is missing or not a list in the JSON file.")
        
#         knowledge_base = [{'text': review['review']} for review in data['reviews']]
        
        
#         if not knowledge_base:
#             raise ValueError("No reviews found in the JSON file.")
        
#         if isinstance(data.get('specifications', []), list):
#             knowledge_base += [{'text': spec['spec']} for spec in data['specifications']]

#         return knowledge_base

#     except ValueError as e:
#             print(e)
#             return []

# def create_vector_store(knowledge_base, model="nomic-embed-text"):
#     documents = [Document(page_content=doc['text']) for doc in knowledge_base]

#     text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
#     chunks = text_splitter.split_documents(documents)

#     embeddings = OllamaEmbeddings(model=model)
#     vector_db = Chroma.from_documents(documents=chunks, embedding=embeddings)
    
#     return vector_db

# def retrieve_relevant_documents(query, vector_db, top_n=5):
#     relevant_docs = vector_db.similarity_search(query, k=top_n)
#     return relevant_docs

# def generate_answer(query, context, model="llama3"):
#     context_text = "\n".join([doc.page_content for doc in context])
    
#     messages = [{"role": "system", "content": "You are a helpful assistant."},
#                 {"role": "user", "content": f"Context: {context_text}\nQuestion: {query} please answer the question based only on the context if the answer is not in the context say sorryy!! I cannot answer the question keep answer consise. Do not add unnecessary information."}]

#     output = ollama.chat(model=model, messages=messages)
    
#     answer = output['message']['content']
#     return answer

# def rag(query, knowledge_base_file, top_n=5):
#     knowledge_base = load_knowledge_base(knowledge_base_file)
#     vector_db = create_vector_store(knowledge_base)
#     relevant_documents = retrieve_relevant_documents(query, vector_db, top_n)
#     answer = generate_answer(query, relevant_documents)
#     return answer


# @app.route('/query', methods=['POST'])
# def query():
#     data = request.get_json()
#     query_text = data.get("query")
#     jData = data.get("scraped_data")
    
#     if not query_text:
#         return jsonify({"error": "Query is required"}), 400
    
#     answer = rag(query_text, jData)
    
#     return jsonify({"answer": answer})

# if _name_ == "_main_":
#     app.run(debug=True)