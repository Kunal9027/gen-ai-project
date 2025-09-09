# pdfapi/urls.py
from django.urls import path
from .views import PDFUploadView, ChatAPIView , ping

urlpatterns = [
    path('upload/', PDFUploadView.as_view(), name='pdf-upload'),
    path('chatapi/', ChatAPIView.as_view(), name='chatapi'),
    path("ping/", ping),
]
