# 🚗 AutoSureAI — Real-Time Accident & Insurance Resolution System

> **An AI-powered full-stack platform for on-the-spot accident reporting, damage severity prediction, and insurance claim resolution — powered by DenseNet121, MERN, and real-time communication.**

---

## 📖 Overview

**AutoSureAI** is an innovative project that automates the insurance claim process through AI-powered damage assessment and real-time communication.  
Using **DenseNet121** for image-based damage severity prediction and **Socket.io** for live updates, this system ensures fast, transparent, and fair insurance resolutions.

---

## 🧠 Problem Statement

Every year, millions of dollars are wasted on fraudulent or exaggerated insurance claims.  
Manual claim validation is **slow**, **error-prone**, and **subjective**.

AutoSureAI solves this by:
- Automatically detecting the **severity of vehicle damage** using AI.
- Enabling **real-time agent-driver communication**.
- Streamlining **claim verification and dispute resolution** digitally.

---

## ⚙️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React + Vite + TailwindCSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Realtime Communication** | Socket.io |
| **Storage** | Supabase (for accident images and ML results) |
| **Email & OTP Service** | Brevo |
| **AI / ML Model** | DenseNet121 (PyTorch / TensorFlow) |
| **Map API** | Google Maps / Mapbox |
| **Authentication** | JWT + 2FA (Brevo OTP) |

---

## 🔐 User Roles

- 👨‍✈️ **Driver / Vehicle Owner**
- 🧑‍💼 **Insurance Agent / Representative**
- 👮 **Traffic Authority (Optional Verification)**
- 🧑‍💻 **Admin / System Moderator**

---

## 🌟 Core Features

### 🚘 Accident Reporting
- Real-time photo/video capture and upload.  
- Automatic location detection and timestamping.  
- AI-based damage severity prediction using **DenseNet121**.  
- PDF receipt generation via Brevo.  
- Offline-first uploads.

### 🧠 ML Damage Severity Prediction
- **DenseNet121 CNN** trained on a Car Damage Dataset.  
- Predicts: *Minor*, *Moderate*, *Severe*.  
- Generates confidence scores and heatmaps (Grad-CAM).  
- Auto-estimates repair cost based on severity.

### 💬 Real-Time Communication
- Live chat between driver and insurance agent.  
- Socket.io-based notifications and status updates.  
- “Typing…” indicators and message receipts.  
- Live feed of accident reports for agents.

### 💰 Insurance Claim Management
- Smart auto-generated claims.  
- Fraud detection via image hashing and NLP.  
- Dispute panel for driver–agent communication.  
- Auto-escalation of unresolved disputes.

### 🧭 Admin Dashboard
- Analytics and insights on claim statistics.  
- Heatmaps of high accident zones.  
- User management and CSV/PDF export.  
- Real-time system logs and activity tracking.

### 🗺️ Geolocation & Mapping
- Accident pins on Google Map / Mapbox.  
- Nearest agent alert based on location radius.  
- Reverse geocoding to readable address.  

### 🕵️ Fraud Detection (AI Add-on)
- Detect duplicate or reused images (hashing).  
- Analyze text for exaggeration or false claims.  
- Flag suspicious cases for admin review.

---

## ⚡ Realtime Workflow

1. 🚗 **Driver** captures image → uploads via React app.  
2. 📡 Image stored in **Supabase** → sent to **Python ML microservice**.  
3. 🧠 **DenseNet121** predicts severity (Minor / Moderate / Severe).  
4. 🗂️ Result returned to **Node.js backend** → saved in MongoDB Atlas.  
5. 🔔 **Socket.io** notifies nearest insurance agents in real-time.  
6. 💬 **Agent** and **Driver** chat via Socket.io for claim verification.  
7. 📧 **Brevo** sends email confirmations and status updates.  
8. 📊 **Admin** monitors all activities and disputes via dashboard.

---

## 🧠 ML Model — DenseNet121

| Property | Description |
|-----------|-------------|
| **Base Model** | DenseNet121 (Pretrained on ImageNet) |
| **Classes** | Minor, Moderate, Severe |
| **Input Shape** | 224×224×3 |
| **Optimizer** | Adam |
| **Loss** | Categorical Crossentropy |
| **Accuracy** | ~90% (after fine-tuning) |
| **Explainability** | Grad-CAM visualization for damage regions |

---

## 🧱 System Architecture

[React Frontend]
        ↓
  (Supabase Upload)
        ↓
[Node.js + Express Backend]
        ↓
 (Image URL + Metadata)
        ↓
[Python ML Microservice — DenseNet121]
        ↓
 (Predicted Severity + Confidence)
        ↓
[MongoDB Atlas Database]
        ↓
 (Socket.io Notifications)
        ↓
[Agent & Admin Dashboards]

💡 Future Enhancements
🧾 Blockchain-based claim verification.
🌧️ Weather-based context validation.
🎙️ Voice Assistant (“Report Accident” command).
🚨 SOS Mode for emergency alerts.
🔮 Predictive accident hotspot analytics.
💰 AI-driven insurance premium recommendations.

📊 Dataset UsedCar Damage Severity Dataset
A labeled dataset scraped from multiple sources consisting of damaged car images categorized into severity levels:
Minor
Moderate
Severe


🧑‍💻 Contributors
Name	Role
Hardik Kumar	
🪪 License

This project is licensed under the MIT License.

⭐ Acknowledgments
Special thanks to:
TensorFlow / PyTorch teams
Supabase & Brevo APIs
OpenAI for guidance
Car Damage Dataset creators
“AI can’t prevent accidents, but it can make recovery faster, fairer, and smarter.”
— AutoSureAI Team 🚀
