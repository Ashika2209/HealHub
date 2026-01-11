# Hospital Management System - Setup & Run Guide

Follow these steps to run the project from scratch.

## Prerequisites
- Python 3.8+
- Node.js & npm

## 1. Backend Setup (Django)

Open a terminal (Terminal A) and navigate to the backend folder:

```bash
cd hospital-dev/backend/healthcare_pro
```

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

**Setup Database:**
```bash
python manage.py migrate
```

**Seed Initial Data (Hospitals & Doctors):**
```bash
python manage.py seed_hospitals
```

**Create Test Users (Optional):**
```bash
python create_test_users.py
```

**Run Server:**
```bash
python manage.py runserver
```
The backend will start at: `http://127.0.0.1:8000/`

---

## 2. Frontend Setup (React)

Open a **NEW** terminal (Terminal B) and navigate to the frontend folder:

```bash
cd hospital-dev/frontend/react_app
```

**Install Dependencies:**
```bash
npm install
```

**Run Server:**
```bash
npm run dev
```
The frontend will start at: `http://localhost:5173/` (or similar)

---

## 3. Accessing the App

1.  Open your browser to [http://localhost:5173](http://localhost:5173).
2.  **Log in** with one of the test accounts:
    - **Patient:** `patient@test.com` / `patient123`
    - **Doctor:** `doctor@test.com` / `doctor123`
    - **Admin:** `admin@admin.com` / `admin123`

## 4. Using the Chatbot
1.  Log in as a **Patient**.
2.  Click the **"Find Doctor"** or **Chat** icon at the bottom right.
3.  Type a query like "Cardiology" or "DoctorA".
