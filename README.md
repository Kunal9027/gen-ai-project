# Full-Stack Generative AI Project

A full-stack Generative AI application using **Django** for the backend and **React Vite** for the frontend.

---

## Features

* AI-powered chat and question-answering
* PDF/document upload and processing
* Similarity search using embeddings
* Real-time AI responses
* Modern frontend with React + Vite
* REST API backend with Django + Django REST Framework

---

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS (optional)

**Backend:** Django, Django REST Framework, LangChain / LLM integration, FAISS / Embeddings

**Database:** SQLite (default) or PostgreSQL

---

## Prerequisites

* Python >= 3.11
* Node.js >= 18
* npm or yarn
* pip
* virtualenv (optional but recommended)

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/project-name.git
cd project-name
```

### 2. Backend Setup (Django)

```bash

python -m venv venv
# Activate virtual environment
# Linux/macOS
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
cd backend  # enter your backend folder
python manage.py makemigrations
python manage.py migrate

```

### 3. Environment Variables

Create a `.env` file in your backend folder:

```env
DJANGO_DEBUG=True
DJANGO_SECRET_KEY='django-insecure--@!$+9o4r0li329m8t562+xu^q1oewwgb=zea4ax5*#ake*1(&'
API_KEY='your key'
OPENAI_API_KEY='your key'
```

Make sure to install `python-dotenv` or `django-environ` and load `.env` in `settings.py`:

```python
from dotenv import load_dotenv
import os

load_dotenv()
DJANGO_DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'
DJANGO_SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
API_KEY = os.getenv('API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
```

### 4. Frontend Setup (React Vite)

```bash
cd frontend  # enter frontend folder
npm install    # or yarn install
npm run dev
```

Frontend typically runs at `http://localhost:5173`.

### 5. Run Backend Server

```bash
cd backend
source venv/bin/activate  # activate virtual environment
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

### 6. Connecting Frontend and Backend

* Make sure API requests in frontend point to `http://127.0.0.1:8000/api/...`
* If CORS issues appear, configure `django-cors-headers`:

```python
# settings.py
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware'] + MIDDLEWARE
CORS_ALLOW_ALL_ORIGINS = True  # development only
```

---

## Running Locally

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Open browser at `http://localhost:5173`
4. Interact with your AI application

---

## Folder Structure

```
project-name/
│
├─ backend/
│   ├─ manage.py
│   ├─ requirements.txt
│   ├─ .env
│   ├─ app/
│   │   ├─ models.py
│   │   ├─ views.py
│   │   └─ urls.py
│   └─ ...
│
├─ frontend/
│   ├─ package.json
│   ├─ vite.config.js
│   ├─ src/
│   │   ├─ App.jsx
│   │   ├─ components/
│   │   └─ ...
│
└─ README.md
```

