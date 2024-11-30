from flask import Flask, request, jsonify
from pyngrok import ngrok
from tqdm.notebook import tqdm
from datasets import Dataset
from sentence_transformers import SentenceTransformer
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document as langchainDocument
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain.text_splitter import RecursiveCharacterTextSplitter
from transformers import AutoTokenizer
from langchain.llms import CTransformers
import matplotlib.pyplot as plt
import pandas as pd

file_path = "cleaned_reviews.csv"  
from langchain_community.document_loaders.csv_loader import CSVLoader
loader = CSVLoader(file_path, encoding="latin-1")
ds = loader.load_and_split()

RAW_KNOWLEDGE_BASE = [
    langchainDocument(page_content=doc.page_content) for doc in tqdm(ds)
]

MARKDOWN_SEPARATORS = [
    "\n#{1,6}", "```\n", "\n\\\\\\*+\n", "\n---+\n", "\n___+\n", "\n\n", "\n", " ", ""
]

def split_documents(chunk_size, knowledge_base, tokenizer_name):
    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
        AutoTokenizer.from_pretrained(tokenizer_name),
        chunk_size=chunk_size,
        chunk_overlap=int(chunk_size / 10),
        add_start_index=True,
        strip_whitespace=True,
        separators=MARKDOWN_SEPARATORS,
    )
    docs_processed = []
    for doc in knowledge_base:
        docs_processed += text_splitter.split_documents([doc])

    unique_texts = {}
    docs_processed_unique = []
    for doc in docs_processed:
        if doc.page_content not in unique_texts:
            unique_texts[doc.page_content] = True
            docs_processed_unique.append(doc)
    return docs_processed_unique

EMBEDDING_MODEL_NAME = "thenlper/gte-small"
docs_processed = split_documents(512, RAW_KNOWLEDGE_BASE, EMBEDDING_MODEL_NAME)

embedding_model = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL_NAME,
    multi_process=True,
    model_kwargs={"device": "cuda"},  
    encode_kwargs={"normalize_embeddings": True},
)

KNOWLEDGE_VECTOR_DATABASE = FAISS.from_documents(
    docs_processed, embedding_model, distance_strategy=DistanceStrategy.COSINE
)

READER_MODEL_NAME = "TheBloke/Llama-2-7B-Chat-GGML"
READER_LLM = CTransformers(
    model=READER_MODEL_NAME,
    model_type="llama",
    task="text-generation",
    max_new_tokens=512,
    repetition_penalty=1.1,
    temperature=0.1,
    quantize=True,
)

app = Flask(__name__)

@app.route("/query", methods=["POST"])
def query():
    try:
        user_query = request.json.get("question", "")

        retrieval_docs = KNOWLEDGE_VECTOR_DATABASE.similarity_search(query=user_query, k=2)
        retrieved_docs_text = [doc.page_content for doc in retrieval_docs]

        context = "\n".join(retrieved_docs_text)
        prompt = f"""
        Using the information contained in the context, give a comprehensive answer to the question.
        Respond only to the question asked, and keep the response concise and relevant.
        Context:
        {context}

        Question:
        {user_query}
        """

        answer = READER_LLM(prompt)
        return jsonify({"answer": answer.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "_main_":
    public_url = ngrok.connect(5000)
    print(f"Public URL: {public_url}")
    app.run()