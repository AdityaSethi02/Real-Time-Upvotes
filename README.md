# ChatBoard

A real-time chat application built with **Node.js**, **WebSockets**, and **TypeScript**, enabling users to engage in dynamic conversations, send messages, and upvote those they find valuable. The app includes room management for admins and special handling for highly-upvoted messages.

## Features

- **Admin Room Management**: 
  - Admins can create and manage chat rooms with properties like:
    - Room name
    - Start time
    - `is_open` status (controls room availability)
    - Cool down time (to manage message flow)
  
- **User Engagement**:
  - Users can:
    - Join chat rooms
    - Send messages
    - Upvote messages
  - Messages with 3 or more upvotes are moved to a highlighted section for better visibility.
  - Messages with 10 or more upvotes trigger an alert to the admin for special attention.

- **Real-time Communication**:
  - Built using raw **WebSockets** for efficient and fast real-time messaging between users and admins.

## Tech Stack

- **Backend**: 
  - Node.js
  - WebSockets
  - TypeScript

- **Frontend**: 
  - React
  - Tailwind CSS

## Installation & Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/AdityaSethi02/Real-Time-Upvotes.git
    cd Real-Time-Upvotes
    ```

2. **Install backend dependencies**:
    ```bash
    cd chat-backend
    npm install
    ```

3. **Install frontend dependencies**:
    ```bash
    cd chat-frontend
    npm install
    ```

4. **Run the backend server**:
    ```bash
    cd chat-backend
    npm start
    ```

5. **Run the frontend**:
    ```bash
    cd chat-frontend
    npm start
    ```

## Usage

1. Navigate to `http://localhost:3000` to access the chat application.
2. Admins can create and manage chat rooms.
3. Users can join rooms, send messages, and upvote.


Project Deployed: https://chatboard-upvotes.vercel.app/
