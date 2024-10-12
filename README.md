
# Era1 - Event Planning Application

## Project Overview

This repository contains the ERA1 project, a web-based event planning application built using **React.js** for the frontend and **Node.js** (with Express) for the backend. It enables users to create events, attend them, add comments, and like events. The project follows **12-factor app principles** and leverages **JWT-based authentication** for secure access.

### Key Features Implemented

#### 1. **Authentication & Authorization**

- Implemented JWT-based authentication for secure login.
- Users can log in using their email and password.
- Session management ensures users stay logged in across page refreshes.

#### 2. **Event Management**

- Users can create events with a **title, description, date, and time**.
- **Descriptions are limited to 10 words**, with a "See More" option to display the entire content using smooth animations.
- **Form validation** ensures all required fields are filled out during event creation.

#### 3. **Attending Events**

- Users can mark their status as:
  - Attending
  - Maybe
  - Not attending
- **Attending status is stored in the backend** and reflects accurately upon page reload.
- **Optimistic UI updates** ensure the selected status reflects immediately.
- Forced **page refresh** resolves inconsistencies with real-time state updates.

#### 4. **Liking Events**

- Users can like and unlike events.
- Implemented **real-time UI updates** for the like button, ensuring state synchronization with the backend.
- **Fixed issues with like state management** to avoid reverting to the previous state.

#### 5. **Comments System**

- Users can add comments on events.
- **Scroll-to-bottom functionality** ensures the latest comments are visible.
- The comments are **stored in the backend** and retrieved on page load.
- Implemented smooth animations and styling for comments.

#### 6. **Frontend Enhancements**

- Created a **responsive user interface** using CSS.
- Buttons change appearance based on user interaction to indicate the current state (e.g., attending status).
- Added **hover effects** and **active states** for better user experience.
- Used **CSS-based sliding containers** to show or hide content (e.g., event descriptions).

#### 7. **Backend Integration**

- Developed API endpoints to:
  - Create events (`POST /api/events`)
  - Update attendance status (`PUT /api/events/:id/attend`)
  - Add comments (`POST /api/events/:id/comments`)
  - Manage likes (`PUT /api/events/:id/like`)
- **Handled optimistic UI updates** for better responsiveness.

#### 8. **Project Management**

- Followed **12-factor app principles**.
- Frequent commits pushed to a **test branch**.
- Created a **production branch** and merged the test branch after completing tests.

### Tech Stack

- **Frontend:** React.js, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, MySQL
- **Authentication:** JWT
- **Version Control:** Git & GitHub

### Setup Instructions

1. Clone the repository:

   ```bash
   git clone git@github.com:ozanozkayatr/era1.git
   cd era1
   ```

2. Install dependencies:

   ```bash
   cd frontend
   npm install
   cd ..
   cd backend
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Backend:

   - Set up the backend with the required MongoDB and MySQL configurations.
   - Run the backend server.

5. Create a `.env` file with the following content:

   ```
   MONGO_DB_URL='mongodb-connection-string'
   DB_NAME="db-name"
   COLLECTION_NAME="collection-name"

   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD="your-password"
   MYSQL_DATABASE="your-database"

   JWT_SECRET="your-jwt-secret"
   ```

6. Run the backend:
   ```bash
   node server.js
   ```




## Author

- **Ozan Ozkaya** - Developer of Era1
- Contact: [ozancanozkaya@gmail.com](mailto:ozancanozkaya@gmail.com)


