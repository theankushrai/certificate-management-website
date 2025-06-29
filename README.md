# 📜 Certificate Manager – Your SSL/TLS Certificate Management Solution

Tired of losing track of expiring SSL/TLS certificates across your infrastructure? This full-stack application helps you manage, monitor, and renew your digital certificates with ease, all from a beautiful, intuitive interface. Never face certificate-related downtime again! 🔒

## 💡 Why I Built This

As a developer managing multiple websites and services, I constantly struggled with:

- Tracking certificate expiration dates across different providers
- Getting timely alerts before certificates expire
- Managing certificate renewals efficiently
- Maintaining a centralized view of all certificates

This project is my solution — a comprehensive certificate management system that brings order to certificate chaos.

## 🚀 Key Features

- **Centralized Dashboard** - View all certificates in one place
- **Dark/Light Mode** - Work comfortably in any lighting condition
- **Responsive Design** - Manage certificates from any device
- **Easy Certificate Creation** - Add new certificates in just a few clicks
- **Detailed Certificate Views** - See all certificate details at a glance

## 🧰 Tech Stack

- **Frontend**: React.js, React Bootstrap, Vite
- **Backend**: Python, Flask , AWS Lambda, AWS API Gateway
- **Deployment**: AWS AMPLIFY
- **CI/CD**: AWS AMPLIFY

## 🛠️ Installation

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/certificate-manager.git
   cd certificate-manager
   ```

2. **Set up the backend**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 🖥️ Live Demo

→ [https://main.d3drx75fmqk840.amplifyapp.com/](https://main.d3drx75fmqk840.amplifyapp.com/)

## 🎥 Video Tutorial

Watch our demo video to see the Certificate Manager in action:

[![Certificate Manager Demo](https://img.youtube.com/vi/BCzoHyFQ-Gg/0.jpg)](https://www.youtube.com/watch?v=BCzoHyFQ-Gg)

[Watch on YouTube](https://www.youtube.com/watch?v=BCzoHyFQ-Gg)

## 🖼️ Screenshots

<div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
  <div style="flex: 1; min-width: 300px;">
    <h4>Dashboard (Dark Mode)</h4>
    <img src="documentation/screenshots/dashboard page dark.jpeg" alt="Dashboard in Dark Mode" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  </div>
  <div style="flex: 1; min-width: 300px;">
    <h4>Create Certificate (Dark Mode)</h4>
    <img src="documentation/screenshots/create cert dark.jpeg" alt="Create Certificate in Dark Mode" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
  <div style="flex: 1; min-width: 300px;">
    <h4>Dashboard (Light Mode)</h4>
    <img src="documentation/screenshots/dashboard page light.jpeg" alt="Dashboard in Light Mode" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  </div>
  <div style="flex: 1; min-width: 300px;">
    <h4>Create Certificate (Light Mode)</h4>
    <img src="documentation/screenshots/create cert lght.jpeg" alt="Create Certificate in Light Mode" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
  <div style="flex: 1; min-width: 300px;">
    <h4>View Certificate (Dark Mode)</h4>
    <img src="documentation/screenshots/view cert dark.jpeg" alt="View Certificate in Dark Mode" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  </div>
  <div style="flex: 1; min-width: 300px;">
    <h4>View Certificate (Light Mode)</h4>
    <img src="documentation/screenshots/view cert light.jpeg" alt="View Certificate in Light Mode" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  </div>
</div>

## 🔗 Find Me Online

For more of my projects, tutorials, and social links, visit my Linktree:

→ [https://linktr.ee/theankushrai](https://linktr.ee/theankushrai)

Linktree contains

- GitHub
- LinkedIn
- Leetcode
