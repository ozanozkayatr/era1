const express = require("express");
const cors = require("cors");
const MongoDB = require("@ozanozkaya/custom-mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const db = new MongoDB(process.env.MONGO_DB_URL);

// Enable CORS for requests from your frontend
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * POST route to create a new event (removing the nested 'data' object)
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
 * PUT route for toggling the like count of an event
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
 * POST route for adding comments to an event
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
 * GET route to fetch all events
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
