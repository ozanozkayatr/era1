
# Era1 - Event Planning Application

## Project Overview

Era1 is an event planning application designed to allow users to create, view, join events, and leave comments. This project is part of a technical evaluation, focusing on implementing best practices and following the 12-factor app principles.

## Features

- User Authentication: Users can register and log in using JWT-based authentication.
- Event Creation: Authenticated users can create new events.
- Event Management: Users can view and manage events they are part of.
- Commenting System: Users can leave comments on events and participate in discussions.
- Responsive Design: The application provides a user-friendly, responsive interface built with React.js.

## Tech Stack

### Frontend
- **React.js**: Used to build the user interface with a focus on responsiveness and interactivity.

### Backend
1. **User Authentication Service**
   - **Node.js & Express.js**: Used to handle user authentication and profile management.
   - **JWT (JSON Web Tokens)**: Secures user sessions and handles authentication.
   - **SQL Database**: Stores user information in a relational database.

2. **Event & Comment Management Service**
   - **Backend Technology**: Node.js (or your choice of backend technology).
   - **NoSQL Database (e.g., MongoDB)**: Stores event details and user comments for flexibility and scalability.

### Deployment Environment
- Prepared to run on **Debian-based distributions** such as Pardus, Debian, Ubuntu, etc.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/era1.git
   cd era1
   ```

2. Install dependencies for both the frontend and backend services:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory of both the frontend and backend.
   - For the authentication service, configure database credentials and JWT secret.
   - For the event/comment service, configure the connection to your NoSQL database.

4. Start the development servers:
   ```bash
   # Start frontend
   cd frontend
   npm start

   # Start backend services
   cd backend
   npm start
   ```

## Project Structure

```plaintext
era1/
│
├── frontend/               # Frontend code with React.js
│   ├── src/
│   └── public/
│
├── backend/                # Backend code for authentication and event management
│   ├── auth-service/       # Authentication service with Node.js and SQL
│   ├── event-service/      # Event and comment management service with NoSQL
│   └── shared/             # Shared utilities and configurations
│
├── README.md               # Project documentation
└── .gitignore              # Files and directories to be ignored by Git
```

## 12-Factor App Principles

This application follows the [12-factor app principles](https://12factor.net/) to ensure scalability, portability, and robustness. Key principles implemented include:

- **Configuration via environment variables**
- **Port binding**
- **Stateless processes**
- **Separation of build and run stages**

## Future Enhancements (Optional)

- Adding media attachments to events.
- Creating polls or surveys for event participants.
- Inviting friends to events.

## Author

- **Ozan Ozkaya** - Developer of Era1
- Contact: [ozancanozkaya@gmail.com](mailto:ozancanozkaya@gmail.com)


