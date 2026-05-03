# MediPedia 💊 — Smart Medicine Aggregator

> Stop overpaying for your medicines. Compare prices across India's top online pharmacies in seconds.

MediPedia is a full-stack e-commerce Minimum Viable Product (MVP) designed to help users find, compare, and securely purchase medicines at the best possible prices. Built as a rapid 10-day development sprint by a two-person engineering team, this platform features real-time price comparisons, generic alternative suggestions, and a fully integrated checkout flow.

---

## ✨ Core Features

*   **Secure Authentication:** Robust JWT-based login and registration system.
*   **Search & Compare Engine:** Instantly search for medicines, view generic alternatives by salt composition, and compare prices across 5+ major pharmacies.
*   **Smart Cart & Address Book:** Dynamic cart calculations, delivery fee thresholds, and a full CRUD address manager that auto-fills cities using government API pincode data.
*   **Unified Checkout:** Secure payment gateway integration supporting UPI, Credit/Debit Cards, and Cash on Delivery (COD).
*   **Personalized Dashboard:** A centralized user hub to track active orders, cancel pending deliveries, manage saved addresses, and monitor price drop alerts.
*   **Premium UI/UX:** Fully responsive, modern interface with seamless Light/Dark mode, teal-blue gradient accents, and flowing animations.

---

## 🛠️ Tech Stack

**Frontend Architecture (Client)**
*   React 18 + TypeScript
*   Vite (Build Tool)
*   Tailwind CSS (Styling)
*   Shadcn UI & Lucide React (Component Library & Icons)

**Backend Architecture (Server)**
*   Python + Django
*   Django REST Framework (DRF)
*   PostgreSQL (Database)
*   Simple JWT (Authentication)
*   Razorpay API (Payment Processing)
*   Indian Post Office API (for pincode-to-city/state autofill)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   PostgreSQL

### 1. Backend Setup
\`\`\`bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and start the server
python manage.py migrate
python manage.py runserver
\`\`\`

### 2. Frontend Setup
\`\`\`bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

The application will be running at `http://localhost:5173`.

---

## 👥 Development Team
Built by a two-person full-stack engineering team:
*   **Backend Developer:** Focused on Django architecture, DRF API endpoints, and database schema.
*   **Frontend Developer:** Focused on React UI/UX, state management, and API integration.
