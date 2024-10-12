require("dotenv").config();
const express = require("express");
const cors = require("cors");
const MongoDB = require("@ozanozkaya/custom-mongodb");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB connection
const db = new MongoDB(process.env.MONGO_DB_URL);

// Initialize MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Enable CORS for frontend requests
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * Middleware: Authenticate JWT Token
 * Verifies the token and attaches user data to the request object.
 */
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

/**
 * Route: User Signup
 * Creates a new user in the SQL database after hashing the password.
 */
app.post("/auth/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    pool.execute(query, [full_name, email, hashedPassword], (err) => {
      if (err)
        return res.status(500).json({ message: "Internal Server Error" });
      res.status(201).json({ message: "User created successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Route: User Login
 * Verifies user credentials and returns a JWT token if valid.
 */
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  pool.execute(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token, user });
  });
});

/**
 * Route: Fetch Events
 * Retrieves all events from MongoDB.
 */
app.get("/api/events", authenticateToken, async (req, res) => {
  try {
    const events = await db.getAllData(
      process.env.DB_NAME,
      process.env.COLLECTION_NAME
    );

    res.status(200).json(events.data || []);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Route: Create Event
 * Creates a new event in MongoDB.
 */
app.post("/api/events", authenticateToken, async (req, res) => {
  const { title, description, date, time } = req.body;

  try {
    const newEvent = {
      title,
      description,
      date,
      time,
      comments: [],
      likedBy: [],
      attendance: [],
    };

    const result = await db.addData(
      process.env.DB_NAME,
      process.env.COLLECTION_NAME,
      newEvent
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Route: Add Comment
 * Adds a comment to an event's comments array.
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
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Route: Toggle Like
 * Adds or removes a user from the event's likedBy array.
 */
app.put("/api/events/:id/like", authenticateToken, async (req, res) => {
  const eventId = req.params.id;
  const { email, liked } = req.body;

  try {
    const model = await db.getModel(
      process.env.COLLECTION_NAME,
      process.env.DB_NAME
    );
    const update = liked
      ? { $addToSet: { likedBy: email } }
      : { $pull: { likedBy: email } };

    const result = await model.updateOne({ _id: eventId }, update);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatedEvent = await model.findOne({ _id: eventId });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * Route: Update Attendance
 * Updates the user's attendance status for the event.
 */
app.put("/api/events/:id/attend", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email, status } = req.body;

  try {
    const model = await db.getModel(
      process.env.COLLECTION_NAME,
      process.env.DB_NAME
    );

    await model.updateOne({ _id: id }, { $pull: { attendance: { email } } });
    const result = await model.updateOne(
      { _id: id },
      { $push: { attendance: { email, status } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Attendance updated" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
