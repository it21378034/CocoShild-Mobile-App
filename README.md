# CocoShield: Coconut Disease Detection & Management Platform

CocoShield is a comprehensive platform for coconut disease detection, reporting, and management. It combines a React Native mobile app, a FastAPI backend, and Firebase integration to help farmers, officers, and admins diagnose coconut diseases, report new cases, and manage disease data efficiently.

---

## 📸 Screenshots

### Dashboard
![Dashboard](assets/screenshots/dashboard.png)

### Report New Case
![Report New Case](assets/screenshots/report-new-case.png)

### Admin Panel
![Admin Panel](assets/screenshots/admin-panel.png)

---

## 🚀 Features
- **Mobile App (React Native/Expo):**
  - Scan coconut leaves for disease diagnosis using AI
  - Submit new disease reports (with NLP and bilingual support)
  - View support resources and officer contacts
  - Role-based access: users can report, admins can manage all reports
  - Google & Facebook authentication (via Firebase)
  - Responsive, modern UI
- **Admin Panel:**
  - View and manage all user reports
  - Reply to reports, update status, and send email notifications
- **Backend (FastAPI):**
  - API endpoints for disease validation, history, reporting, and NLP
  - Connects to ML model for inference
- **Firebase Integration:**
  - Firestore for storing reports and user data
  - Auth for user management
  - Cloud Functions for email notifications

---

## 📁 Folder Structure

```
Cocunt_Diseases/
├── backend/                # FastAPI backend
│   ├── main.py
│   └── requirements.txt
├── ml/                     # Machine learning model & scripts
│   ├── model_inference.py
│   ├── model.h5
│   ├── requirements.txt
│   └── train_model.py
├── mobile/                 # React Native (Expo) mobile app
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   └── README.md
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── assets/
│   └── screenshots/        # Project screenshots for README
├── README.md               # Main project README
└── ...                     # Other docs and assets
```

---

## 🛠️ Installation & Setup

### 1. **Clone the Repository**
```sh
git clone https://github.com/yourusername/cocoshield.git
cd cocoshield
```

### 2. **Backend (FastAPI)**
```sh
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### 3. **Machine Learning (Optional)**
```sh
cd ml
pip install -r requirements.txt
# Train or run inference as needed
```

### 4. **Mobile App (React Native/Expo)**
```sh
cd mobile
npm install
npx expo start
```
- Configure Firebase in `mobile/config/firebase.ts` with your project credentials.
- For social login, follow the instructions in `mobile/SOCIAL_AUTH_SETUP.md`.

### 5. **Firebase Functions (for email notifications)**
```sh
cd functions
npm install
npm run build
firebase deploy --only functions
```
- Set up Firebase project, Firestore, and Auth as described in `FIREBASE_REPORT_SETUP.md`.

---

## 📱 Usage
- **Users:**
  - Open the mobile app, sign up or log in
  - Scan leaves, submit reports, or get help
- **Admins:**
  - Log in with admin credentials
  - Access the admin panel to view and manage all reports
  - Admin Credentials:- Email:-admin@gmail.com
  -                     password:-admin@123

---

## 🤝 Contributing
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Create a pull request

---

## 📄 License
This project is licensed under the MIT License.

---

## 🙏 Acknowledgements
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Python](https://www.python.org/)
- [TypeScript](https://www.typescriptlang.org/)

---

For more details, see the individual README files in each subfolder and the setup guides included in the project. 
