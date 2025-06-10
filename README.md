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

→ `https://main.d3drx75fmqk840.amplifyapp.com/`

## 📱 Intuitive UI with Dark/Light Mode

Experience a seamless user interface that automatically adapts to your preferred theme. The application features:

- 🌓 Automatic theme detection based on system preferences
- 🌞 Light mode for comfortable daytime use
- 🌙 Dark mode for reduced eye strain in low-light conditions
- 🎨 Consistent theming across all components

## 🎥 Video Tutorial

🚧 Coming Soon - Video tutorial will be available shortly!

## 🖼️ Screenshots

🚧 Coming Soon - Screenshots will be added soon!

## 🛠️ Usage

### Certificate Management
1. **Add Certificates**
   - Click "Create New" to add a new certificate
   - Fill in the certificate details (domain, issuer, expiration date, etc.)
   - Save to add to your dashboard

2. **View & Monitor**
   - View all certificates in the intuitive dashboard
   - See expiration status with color-coded indicators
   - Click on certificate view button to view detailed information

3. **Rotate Certificates**
   - Select the certificate you want to rotate
   - Click the "Rotate" button
   - Confirm the rotation in the dialog
   - View the new certificate details in the dashboard

4. **Delete Certificates**
   - Locate the certificate you want to remove
   - Click the delete icon
   - Confirm deletion in the dialog
   - The certificate will be removed from your dashboard

## 🔗 Find Me Online

For more of my projects, tutorials, and social links, visit my Linktree:

→ [https://linktr.ee/theankushrai](https://linktr.ee/theankushrai)

Linktree contains
- GitHub
- Twitter
- LinkedIn
- Portfolio
