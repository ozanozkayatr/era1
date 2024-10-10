require("dotenv").config();
const express = require("express");
const cors = require("cors");
const MongoDB = require("@ozanozkaya/custom-mongodb");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const db = new MongoDB(process.env.MONGO_DB_URL);

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

/**
 * Function to authenticate JWT token
 * - This middleware checks for the JWT token in the Authorization header
 * - If token is valid, it allows the request to proceed
 * - Otherwise, it responds with 401 (Unauthorized) or 403 (Forbidden)
 */
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from Authorization header

  if (!token)
    return res.status(401).json({ message: "Access denied, token missing!" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

/**
 * POST route for user signup (SQL) with password hashing
 * - Takes full_name, email, and password from the request body
 * - Hashes the password using bcrypt and stores the user in the MySQL database
 */
app.post("/auth/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query =
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    pool.execute(query, [full_name, email, hashedPassword], (err, results) => {
      if (err) {
        console.error("Error during signup:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.status(201).json({ message: "User created successfully" });
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * POST route for user login (SQL) with password validation
 * - Takes email and password from the request body
 * - Checks if the user exists and compares the provided password with the stored hashed password
 * - If successful, generates and returns a JWT token along with user details
 */
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  pool.execute(query, [email], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token, user: user });
  });
});

/**
 * Protected route for fetching events (MongoDB) - Requires authentication
 * - Fetches all events from the MongoDB collection
 * - JWT token is required to access this route
 */
app.get("/api/events", authenticateToken, async (req, res) => {
  try {
    const events = await db.getAllData(
      process.env.DB_NAME,
      process.env.COLLECTION_NAME
    );

    if (!events.data || events.data.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(events.data);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * POST route to create a new event (MongoDB) - Requires authentication
 * - Takes title, description, date, and time from the request body
 * - Saves a new event document in MongoDB
 * - JWT token is required to access this route
 */
app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    const { title, description, date, time } = req.body;

    if (!title || !description || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEvent = {
      title,
      description,
      date,
      time,
      comments: [],
      likes: 0,
    };

    const result = await db.addData(
      process.env.DB_NAME,
      process.env.COLLECTION_NAME,
      newEvent
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * POST route for adding comments to an event (MongoDB) - Requires authentication
 * - Takes event ID, user, and text from the request body
 * - Adds the comment to the event document in MongoDB
 * - JWT token is required to access this route
 */
app.post("/api/events/:id/comments", authenticateToken, async (req, res) => {
  const eventId = req.params.id;
  const { user, text } = req.body;

  if (!user || !text) {
    return res
      .status(400)
      .json({ message: "User and comment text are required" });
  }

  try {
    const model = await db.getModel(
      process.env.COLLECTION_NAME,
      process.env.DB_NAME
    );

    const result = await model.updateOne(
      { _id: eventId },
      { $push: { comments: { user, text } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * PUT route for toggling the like count of an event (MongoDB) - Requires authentication
 * - Takes the event ID and liked status (boolean) from the request body
 * - Updates the likes count in MongoDB based on the liked status
 * - JWT token is required to access this route
 */
app.put("/api/events/:id/like", authenticateToken, async (req, res) => {
  const eventId = req.params.id;
  const { liked } = req.body;

  try {
    const model = await db.getModel(
      process.env.COLLECTION_NAME,
      process.env.DB_NAME
    );

    const incrementValue = liked ? 1 : -1;

    const result = await model.updateOne(
      { _id: eventId },
      { $inc: { likes: incrementValue } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: `Like ${liked ? "added" : "removed"}` });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
