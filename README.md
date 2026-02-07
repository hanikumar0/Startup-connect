# 🚀 Startup Connect

**Startup Connect** is an AI-powered end-to-end marketplace designed to bridge the gap between ambitious startups and strategic investors. Leveraging the MERN stack and specialized AI services, it streamlines the fundraising process from discovery to due diligence.

---

## 🏗 Project Architecture

The platform is divided into four main services:

*   **`/backend`**: Node.js & Express API with Socket.io for real-time features.
*   **`/web`**: Next.js 15+ frontend with Tailwind CSS and Shadcn UI.
*   **`/mobile`**: React Native (Expo) application for on-the-go access.
*   **`/ai-service`**: Python FastAPI service for matching algorithms and pitch analysis.

---

## ✨ Key Features

### 🔐 Trust & Verification
- **Aadhaar e-KYC**: Secure identity verification for all users.
- **Business Vetting**: Automated verification for PAN, GSTIN, Udyam, and DPIIT.
- **AES-256 Encryption**: High-grade encryption for sensitive messages and documents.

### 🤖 AI Intelligence
- **Smart Matching**: AI-driven discovery based on investor preferences and startup profiles.
- **Pitch Analysis**: Automated insights into startup pitch decks.
- **AI Coach**: Personalized guidance for founders.

### 💬 Communication & Collaboration
- **Real-time Chat**: Secure messaging with encrypted data.
- **Video Meetings**: Built-in WebRTC video conferencing.
- **Virtual Data Room (VDR)**: Controlled repository for due diligence documents.

---

## 🛠 Tech Stack

| Module | Technologies |
| :--- | :--- |
| **Frontend** | Next.js, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Redis, Passport.js |
| **Mobile** | React Native, Expo, React Navigation, Socket.io-client |
| **AI Layer** | Python, FastAPI, OpenAI, Sentence-Transformers, NumPy |
| **Infrastructure** | AWS (S3), Socket.io, JWT, LocalTunnel |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: A running instance (Local or Atlas)
- **Redis**: Required for OTP and Session management
- **Python**: 3.9+ for AI Matching logic

### 2. Installation & Execution

Open four separate terminal windows to run the full suite:

#### **Terminal 1: Backend (Core API)**
Responsible for Auth, Database, and Real-time Sockets.
```bash
cd backend
npm install        # Link dependencies
npm run dev        # Starts server with nodemon on port 5000
```
*Health Check: `http://localhost:5000/`*

#### **Terminal 2: Web (Frontend)**
Next.js dashboard for Startups and Investors.
```bash
cd web
npm install        # Link dependencies
npm run dev        # Starts Next.js on port 3000
```
*Access: `http://localhost:3000`*

#### **Terminal 3: AI Service (Python)**
FastAPI service handling vector embeddings and matching.
```bash
cd ai-service
# Recommended: create a virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py             # Starts FastAPI on port 8000
```

#### **Terminal 4: Mobile App (Expo)**
React Native application for iOS and Android.
```bash
cd mobile
npm install
npx expo start
```
*Commands:*
- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Scan QR code with Expo Go app for physical devices

---

## 🛠 Useful Development Commands

### Database & Embeddings
To regenerate AI embeddings for all profiles in the database:
```bash
cd backend
npm run embeddings
```

### Local Development Tunnel
If you need to test the mobile app on a physical device, use LocalTunnel to expose your backend:
```bash
# Requires localtunnel installed globally: npm install -g localtunnel
lt --port 5000 --subdomain startup-connect-api
```

### Production Build
To prepare the system for production:
```bash
# Web
cd web && npm run build

# Backend
cd backend && npm start
```

---

## 📁 Project Structure

```text
startup-connect/
├── backend/            # Express API & Sockets
├── web/                # Next.js Frontend
├── mobile/             # React Native App
├── ai-service/         # Python FastAPI Logic
├── .env                # Master Config
└── README.md           # This file
```

---

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ by the Startup Connect Team**
