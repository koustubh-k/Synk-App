# SYNK-APP Advanced Chat Application

This is a full-stack, real-time chat application featuring AI integration and multi-language support. The project is built with a modern MERN stack, separating the backend API from the frontend client for a modular and scalable architecture.

---

### Project Structure

The repository is organized into two main directories:

-   `server/`: A Node.js and Express.js backend that provides a RESTful API and manages WebSocket connections.
-   `reactClient/`: A Vite + React-based frontend application.

---

### Features

-   **Real-Time Messaging:** Instantaneous message delivery using **Socket.IO**.
-   **User Authentication:** Secure user registration and login using **JSON Web Tokens (JWT)**.
-   **AI Chat Integration:** An AI-powered chat companion for interaction (powered by `aiService`).
-   **RESTful API:** A complete API for managing users, chats, and messages.
-   **Modern UI:** A clean and responsive user interface built with **React**, **Tailwind CSS**, and **Shadcn/UI**.
-   **Scalable Architecture:** Designed to support **1000+ concurrent users** through an event-driven architecture and optimized data synchronization.
-   **Message Persistence:** Messages are stored in a database for easy retrieval and history.

---

### Tech Stack

#### Backend (`server/`)

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** MongoDB with Mongoose ODM
-   **Real-Time Communication:** Socket.IO
-   **Authentication:** JSON Web Tokens (JWT)

#### Frontend (`reactClient/`)

-   **Framework:** React with Vite
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS, Shadcn/UI
-   **API Communication:** Axios (or Fetch API)
-   **State Management:** Zustand (inferred from `store/`)

---

### Setup and Installation

#### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   A running MongoDB instance (local or cloud-based like MongoDB Atlas)

#### 1. Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `server` directory and add the following variables. Replace the placeholder values with your own.

    ```env
    # Port for the server to run on
    PORT=5000

    # Your MongoDB connection string
    MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>

    # A strong secret for signing JWTs
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The API server should now be running on `http://localhost:5000`.

#### 2. Frontend Setup

1.  **Navigate to the reactClient directory:**
    ```bash
    cd reactClient
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a local environment file:**
    Create a `.env.local` file in the `reactClient` directory and add the backend API URL:
    ```env
    VITE_API_URL=http://localhost:5000
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should be accessible at `http://localhost:5173` (or another port if 5173 is in use).
