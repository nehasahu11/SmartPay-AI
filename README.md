# SmartPay AI – Intelligent Recharge and Bill Payment Platform

A smart recharge and bill payment platform developed using HTML, CSS, JavaScript,
and Bootstrap for a responsive, modern, user-friendly interface across web and
mobile devices. The platform includes secure User Authentication features such as
Sign Up, Login, Forgot Password, Profile Management, and Logout using JWT-based
authentication. MySQL is used as the database, while Node.js and Express.js are
used for backend development, API integration, and transaction management.

The platform enables users to perform Mobile, DTH, and Fastag Recharges, as well
as pay Electricity, Water, Gas, and Broadband Bills. Bootstrap components and
responsive layouts are used to design an interactive dashboard displaying total
spending, transaction history, upcoming bills, and predicted bill amounts through
line graphs, pie charts, and bar charts. The dashboard provides monthly spending
analysis with graphical representations, allowing users to track expenditure
trends, compare spending across categories, and monitor financial habits over time.

AI-powered Spending Insights analyze user transaction patterns, categorize
expenses, and provide personalized financial recommendations. Smart Bill
Prediction is implemented using Machine Learning algorithms to forecast future
bill amounts based on historical payment data. A Voice-Enabled Assistant allows
users to perform recharges, access spending analytics, and obtain bill
predictions through voice commands, enhancing user convenience and accessibility.

RESTful APIs are developed to ensure secure and smooth communication between the
database, web platform, AI modules, voice assistant, and analytics dashboard.

**Tech Stack:** HTML, CSS, JavaScript, Bootstrap, MySQL, Node.js, Express.js,
Python, Pandas, Scikit-learn, Chart.js, Web Speech API, JWT Authentication, REST APIs

---

## Folder Structure
SmartPay-AI/

├── frontend/      → HTML, CSS, JS (Bootstrap, Chart.js, Voice Assistant)

├── backend/       → Node.js + Express REST API, JWT auth, MySQL models

├── database/      → smartpay.sql (schema + seed data)

├── ml/            → Python ML scripts (bill prediction, spending insights)

└── docs/          → Diagrams and project report


---

## Prerequisites

- Node.js (v18+)
- MySQL Server (running locally)
- Python 3.9+
- A Chromium-based browser (Chrome/Edge) for the voice assistant feature

---

## Setup & Installation

**1. Database**
```bash
mysql -u root -p
source database/smartpay.sql;
```

**2. Backend**
```bash
cd backend
npm install
```
Configure `backend/.env` with your local MySQL credentials.

**3. Machine Learning Setup (one-time)**
```bash
cd ml/datasets
python generate_dataset.py

cd ../bill_prediction
pip install -r requirements.txt
python train_model.py
```

**4. Run the Backend**
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:5000`.

**5. Run the Frontend**
Open `frontend/html/index.html` using VS Code's "Live Server" extension, or open
it directly in a browser.

---

## Author

Neha Sahu