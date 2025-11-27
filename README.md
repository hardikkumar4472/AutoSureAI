# 🚗 AutoSureAI — Intelligent Accident Analysis & Insurance Resolution Platform

**On-the-spot accident analysis, real‑time accident information & AI‑powered insurance dispute resolution**

AutoSureAI is an end‑to‑end intelligent motor‑insurance lifecycle platform.  
It uses **AI-assisted damage assessment**, **real-time communication**, and **role-based claim workflows** to automate everything—from accident capture to settlement.

---

# 📖 Overview  

AutoSureAI simplifies the entire motor insurance workflow through:  
- AI-powered accident severity prediction  
- Real-time agent–driver communication  
- Transparent claim dispute resolution  
- Complete admin monitoring & analytics  
- Secure multi-role access  
- Exportable reports & audit logs  

The platform ensures **faster**, **fairer**, and **fraud-resistant** claim resolutions.

---

# 🧠 Problem Statement  

Traditional insurance claims face:  
❌ Manual and slow verification  
❌ Human interpretation errors  
❌ High risk of fraud & inflated estimates  
❌ Lack of real-time communication  
❌ No standardized damage evaluation  

**AutoSureAI solves this** with:  
✔ AI-driven damage severity estimation  
✔ Automated & consistent cost predictions  
✔ Real-time notifications  
✔ Instant claim routing  
✔ Role-specific dashboards  

---

# ⚙️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Realtime Engine** | Socket.io |
| **Storage** | Supabase Buckets |
| **Email/OTP** | Brevo |
| **Machine Learning** | DenseNet121 (PyTorch / TensorFlow) |
| **Maps & Geolocation** | Google Maps / Mapbox |
| **Authentication** | JWT + 2FA |

---

# 🏗️ System Architecture

```
[System Architecture Diagram]

## System Architecture
┌────────────┐      multipart/JSON      ┌──────────────┐
│  Frontend  │  <────────────────────>  │  Express API │
│ React/Vite │          HTTPS           │  Node.js     │
└────┬───────┘                          └────┬─────────┘
     │  REST / Socket.io                     │
     │                                        │
     │                             ┌──────────▼──────────┐
     │                             │ MongoDB (Atlas/local)│
     │                             └──────────┬──────────┘
     │                                        │
     │       AI inference (image upload)       │
     │────────────────────────────────────────>│
     │                             ┌──────────▼──────────┐
     └────────────────────────────►│  ML Service (Flask) │
                                   └─────────────────────┘



```

---

# 👥 User Roles

### 👨‍✈️ Driver / Vehicle Owner
- Submit accident reports  
- Upload vehicle images  
- Get instant AI damage assessment  
- Track claim progress  

### 🧑‍💼 Insurance Agent / Representative  
- Verify driver‑submitted data  
- Communicate live with drivers  
- Approve / reject / escalate claims  

### 👮 Traffic Authority (Optional)
- Validate accident authenticity  
- Approve police verification  

### 🧑‍💻 Admin / System Moderator  
- Global stats and dashboard  
- Full system audit logs  
- Manage disputes, exports, role access  

---

# 🌟 Core Features

## 🚘 1. Accident Reporting  
- Instant on‑site accident data capture  
- Auto-location detection (GPS + Map API)  
- AI-based damage severity estimation  
- Upload multiple images + videos  
- Auto-generated incident report  

## 🤖 2. AI Damage Assessment  
- DenseNet121 predicts:  
  - Minor / Moderate / Severe damage  
  - Estimated repair cost  
- Stores inference results in Supabase + MongoDB  

## 🔁 3. Real-Time Communication (Socket.io)  
- Live driver ↔ agent chat  
- Notifications  
- Typing indicators  

## 📝 4. Claim Verification Workflow  
- Agent reviews  
- Fraud pattern checks  
- Approval / rejection / escalation  

## 📊 5. Admin Dashboard  
- Global analytics  
- Claim heatmaps  
- ML accuracy stats  
- CSV/PDF export  
- Audit logs  

---

# 🧪 Machine Learning Model (DenseNet121)

- Pretrained model fine-tuned on accident dataset  
- Outputs severity + cost estimation  
- Runs on Flask inference API  
- Deployed using Docker  

---

# 🗺️ Future Enhancements  
- Geo-fencing fraud detection  
- Multi-vehicle reconstruction  
- Premium-adjustment engine  
- GenAI-based explanation system  

---

# 📂 Folder Structure

```
AutoSureAI/
├── client/            # React frontend
├── server/            # Express backend
├── ml-service/        # DenseNet121 inference API
└── README.md
```

---

# 📎 License  
MIT License  

---

# 🙌 Contributors  
Hardik Kumar (Lead Developer — MERN + ML)
