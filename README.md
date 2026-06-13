# 🍔 Fletto – Food Delivery Web App

Fletto is a full-stack food delivery web application that allows users to browse food items, place orders, and track deliveries. It also provides dashboards for restaurant owners and delivery partners.


## 🚀 Features

* 👤 User Authentication (Login / Signup)
* 🛒 Add to Cart & Place Orders
* 📦 Order Tracking System
* 🏪 Owner Dashboard (Manage Orders & Items)
* 🚴 Delivery Partner Module
* 🔔 Real-time Updates (Socket Integration)
* 📱 Fully Responsive UI
---

## 🛠️ Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other Tools

* Socket.IO (Real-time updates)
* JWT (Authentication)
* Axios


## 📁 Project Structure


Fletto/
│
├── frontend/       # React frontend
├── backend/        # Node.js backend
├── .gitignore
└── README.md

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository


git clone https://github.com/your-username/fletto.git
cd fletto


### 2️⃣ Setup Backend


cd backend
npm install


Create a `.env` file inside backend:


PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key


Run backend:

npm run dev

### 3️⃣ Setup Frontend


cd frontend
npm install
npm run dev


## 🔐 Environment Variables

Create a `.env` file in the backend folder:

| Variable   | Description            |
| ---------- | ---------------------- |
| PORT       | Server Port            |
| MONGO_URI  | MongoDB Connection URL |
| JWT_SECRET | Secret key for auth    |


## 🌐 Deployment

* Frontend → Vercel / Netlify
* Backend → Render / Railway
* Database → MongoDB Atlas

👉 Make sure to add environment variables in deployment settings.

## 📌 Important Notes

* `.env` and `node_modules/` are ignored using `.gitignore`
* Never upload sensitive data to GitHub
* Use `.env.example` for reference

## 👨‍💻 Author

**Pranav Yeole**



## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---
