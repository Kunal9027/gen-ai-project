# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from PyPDF2 import PdfReader
from .agent import chat_with_user
from .vector_db_openai1 import setup_vector_db
from django.http import JsonResponse

def ping(request):
    print("ping is ok")
    return JsonResponse({"status": "ok"})

class PDFUploadView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        session_id = request.data.get("session_id", "default-session")

        if not file:
            return Response({"error": "No file provided"}, status=400)

        try:
            text = ""
            reader = PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            setup_vector_db(text, session_id)
            return Response({"message": "PDF uploaded and vector DB created."}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ChatAPIView(APIView):
    def post(self, request):
        user_input = request.data.get("message")
        session_id = request.data.get("session_id", "default-session")

        if not user_input:
            return Response({"error": "No message provided."}, status=400)

        try:
            bot_response = chat_with_user(user_input, session_id=session_id)
            return Response({"response": bot_response}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

