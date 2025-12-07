📊 SmartWinnr Admin Dashboard – MEAN Stack

A complete Admin Dashboard featuring Analytics, Reporting, User Management, and Role-Based Authentication, built using the MEAN stack.

🚀 Tech Stack & Versions

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Angular | 17+ |
| Backend | Node.js | 18+ |
| Backend Framework | Express.js | 4.18+ |
| Database ORM | Mongoose | 7+ |
| Database | MongoDB | 4.0+ / Atlas compatible |
| Authentication | jsonwebtoken (JWT) | 9+ |
| Password Hashing | bcryptjs | Latest |
| UI Framework | Bootstrap | 5+ |
| Logging | Morgan | Latest |
| HTTP Requests | Angular HttpClient | Built-in |
| Charts | Pure CSS (conic-gradient) | No external library |


🎯 Key Features
🔐 Authentication & Authorization

Secure Login & Registration

JWT-based authentication

Admin/User role-based access control

Admin-only dashboard, analytics & user management

📊 Admin Dashboard (Analytics & Reporting)

Total User Count

Active Users

New Signups (Past 7 Days)

Sales Summary

Sports Interest Pie Chart (User-submitted preferences)

Auto-refresh dashboard (30-second interval)

👨‍💼 Admin Management Tools

Create New Users (Admin-only)

Assign User Roles

Activate / Deactivate Users

View Complete User List

👤 User Dashboard (Normal Users)

Personal activity overview (sessions & points)

Submit Sports Interests

Clean and simple layout

📱 Responsive UI

Fully responsive using Bootstrap

Works on laptop, tablet, and mobile

📁 Project Structure
smartwinnr-admin-backend/
├── server.js
├── package.json
└── .env

smartwinnr-admin-frontend/
├── src/app
│   ├── auth/
│   ├── core/
│   ├── layout/
│   ├── pages/
│   ├── app.routes.ts
│   └── main.ts
├── package.json
└── angular.json

⚙️ Setup Instructions (Local Installation)

Follow these steps exactly to run the project locally.

🗄️ 1. Clone the Project
git clone https://github.com/Divakar0704/Admin-Panel-Role-Based

🛠️ 2. Backend Setup (Node.js + Express)
Navigate to backend folder
cd smartwinnr-admin-backend

Install dependencies
npm install

Start MongoDB locally
mongod


Or use MongoDB Atlas — update the .env accordingly.

Create an .env file (optional)
MONGO_URI=mongodb://127.0.0.1:27017/smartwinnr_dashboard
JWT_SECRET=secret123

Run the backend
npm run dev


Backend URL:

http://localhost:4000

🖥️ 3. Frontend Setup (Angular 17)
Navigate to frontend folder
cd smartwinnr-admin-frontend

Install dependencies
npm install

Start Angular app
ng serve --open


Frontend URL:

http://localhost:4200

🔑 Default Admin Credentials

Automatically created when the backend starts:

Email: admin@smartwinnr.com
Password: Admin@123


Admin can:

Access Analytics Dashboard

Manage Users

View Pie Chart (Sports Interest)

Access full reporting


📝 Notes

Dashboard chart uses pure CSS (conic-gradient) for 100% compatibility.

Data originates from MongoDB using REST API.

Role-based routing ensures security & real-world workflow.

✅ Assignment Compliance

This project meets all required guidelines:

✔ MEAN Stack
✔ Data Visualization
✔ Responsive UI
✔ Authentication
✔ Role-based Authorization
✔ Admin Controls
✔ Analytics & Reporting
✔ README file with setup + version details
✔ Screenshots (attach in email)