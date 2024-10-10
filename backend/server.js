require("dotenv").config();
const express = require("express");
const cors = require("cors");
const MongoDB = require("@ozanozkaya/custom-mongodb");
const mysql = require("mysql2");
const bcrypt = require("bcrypt"); // Import bcrypt for password encryption

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const db = new MongoDB(process.env.MONGO_DB_URL);

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE, // Database from .env file
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Enable CORS for requests from your frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from the frontend
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

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
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash password

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
 * - Responds with success if login is valid, or error message if invalid
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

    const isMatch = await bcrypt.compare(password, user.password); // Compare hashed passwords
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user: user });
  });
});

/**
 * POST route to create a new event (MongoDB)
 * - Takes title, description, date, and time from the request body
 * - Saves a new event document in MongoDB
 */
app.post("/api/events", async (req, res) => {
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
 * PUT route for toggling the like count of an event (MongoDB)
 * - Takes the event ID and liked status (boolean) from the request body
 * - Updates the likes count in MongoDB based on the liked status
 */
app.put("/api/events/:id/like", async (req, res) => {
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

/**
 * POST route for adding comments to an event (MongoDB)
 * - Takes event ID, user, and text from the request body
 * - Adds the comment to the event document in MongoDB
 */
app.post("/api/events/:id/comments", async (req, res) => {
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
 * GET route to fetch all events (MongoDB)
 * - Retrieves all event documents from MongoDB
 */
app.get("/api/events", async (req, res) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
