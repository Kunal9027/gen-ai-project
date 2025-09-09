       
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_groq import ChatGroq
from .vector_db_openai1 import setup_vector_db ,get_vector_db
import os
import dotenv

dotenv.load_dotenv()
API_KEY = os.getenv('API_KEY')

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.0,
    max_retries=1,
    api_key=API_KEY
)


history_store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in history_store:
        history_store[session_id] = ChatMessageHistory()
    return history_store[session_id]

def chat_with_user(user_input, session_id="user-1"):
    vector_db = get_vector_db(session_id)
    if not vector_db:
        return "No PDF uploaded yet. Please upload a PDF before chatting."

    results = vector_db.similarity_search(user_input, k=3)
    if not results:
        return "No relevant text found in the document."

    retrieved_text = results[0].page_content
    faq_context = retrieved_text or "No relevant FAQ found."

    prompt = ChatPromptTemplate.from_messages([
        ("system", """
            You are a support AI agent. Use only the PDF data to answer.
            If the answer is not in the PDF, say so.
            Format responses in Markdown.
        """),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
        ("system", "FAQ Context:\n{faq_context}")
    ])

    chain = prompt | llm

    chain_with_memory = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
    )

    response = chain_with_memory.invoke(
        {"input": user_input, "faq_context": faq_context},
        config={"configurable": {"session_id": session_id}}
    )

    return response.content


if __name__ == "__main__":
    print("📩 Ask me your Rakuten support question:")
    while True:
        query = input("You: ")

        if query.lower() in ["exit", "quit", "bye", "q"]:
            print(" Goodbye!")
            break

        reply = chat_with_user(query, session_id="test-user")
        print("Bot:\n", reply)
