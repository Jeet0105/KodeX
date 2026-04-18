# KodeX

<p align="center">
  <strong>A comprehensive online coding and competitive programming platform.</strong>
</p>

## 🚀 Overview

KodeX is a robust, full-stack application designed to provide an interactive environment for users to write, execute, and evaluate their code. Leveraging the power of the MERN stack (MongoDB, Express, React, Node.js) and integrating the Judge0 execution engine, KodeX offers a seamless experience for coding enthusiasts, learners, and educators.

## ✨ Key Features

- **Integrated Code Editor**: Feature-rich, in-browser code editor powered by Monaco Editor (the core of VS Code).
- **Secure Code Execution**: Utilizes **Judge0** within the infrastructure for isolated and reliable code compilation and execution across multiple languages.
- **User Authentication**: Secure signup and login mechanisms using JWT and Firebase integration.
- **Interactive Dashboards**: Visual representation of user progress and statistics using Recharts.
- **Leaderboard System**: Real-time ranking of users based on their coding achievements and problem-solving metrics.
- **Responsive UI**: Beautiful and fluid user interface built with Vite, React, and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Core**: React 19, Vite
- **State Management**: Redux Toolkit, Redux Persist
- **Styling**: Tailwind CSS 4
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Routing**: React Router 7
- **Forms & Validation**: React Hook Form, Zod
- **Data Visualization**: Recharts
- **Utilities**: Firebase, Axios, React Icons, React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs
- **Security**: Helmet, Express Rate Limit, Express Mongo Sanitize, HPP (HTTP Parameter Pollution)
- **Mailing**: Nodemailer

### Infrastructure
- **Code Execution Engine**: [Judge0](https://judge0.com/) (Configurations provided in the `infrastructure/judge0` directory)

## 🏁 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js (v18 or higher recommended)
- MongoDB (local instance or MongoDB Atlas)
- Git
- Docker (for running local Judge0 instance)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/KodeX.git
   cd KodeX
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   ```
   *Create a `.env` file in the `server` directory and add your required environment variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`).*

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   ```
   *Create a `.env` file in the `client` directory for any frontend-specific environment variables.*

4. **Start the Application:**
   You will need to run the client and server concurrently. Open two terminal windows.
   
   *Terminal 1 (Backend):*
   ```bash
   cd server
   npm run dev
   ```
   
   *Terminal 2 (Frontend):*
   ```bash
   cd client
   npm run dev
   ```

### Setting up Code Execution (Judge0)
To establish the code execution environment naturally:
```bash
cd infrastructure/judge0
# Run the respective docker-compose commands based on Judge0's official documentation.
```

## 📂 Project Structure

```text
KodeX/
├── client/             # React frontend application
├── server/             # Express.js backend API
├── infrastructure/     # Services and infrastructure configs (e.g., Judge0)
├── documentation/      # Development documents (SRS, Project Proposals)
└── README.md           # Project configuration & overview
```

## 📄 License
This project is licensed under the ISC License.
