

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
import os, dotenv

dotenv.load_dotenv()
embedding_model = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))


global_vector_dbs = {}


def setup_vector_db(pdf_text, session_id, chunk_size=700, chunk_overlap=200):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    docs = [Document(page_content=chunk) for chunk in splitter.split_text(pdf_text)]
    db = FAISS.from_documents(docs, embedding_model)
    # Clear all old DBs whenever a new session starts
    global_vector_dbs.clear()
    global_vector_dbs[session_id] = db
    return db


def get_vector_db(session_id):
    return global_vector_dbs.get(session_id)


def reset_vector_db(session_id):
    """Completely remove a session's vector DB (start fresh)."""
    if session_id in global_vector_dbs:
        del global_vector_dbs[session_id]
    return None
