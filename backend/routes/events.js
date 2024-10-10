const express = require("express");
const router = express.Router();
const MongoDB = require("@ozanozkaya/custom-mongodb");
require("dotenv").config();

const db = new MongoDB(process.env.MONGO_DB_URL);

router.post("/", async (req, res) => {
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

router.put("/:id/like", async (req, res) => {
  const eventId = req.params.id;

  try {
    const result = await db.findAndUpdateByQuery(
      process.env.DB_NAME,
      process.env.COLLECTION_NAME,
      { _id: eventId },
      { $inc: { likes: 1 } }
    );

    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Like updated", data: result });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/:id/comments", async (req, res) => {
  const eventId = req.params.id;
  const { user, text } = req.body;

  if (!user || !text) {
    return res
      .status(400)
      .json({ message: "User and comment text are required" });
  }

  try {
    const result = await db.findAndUpdateByQuery(
      process.env.DB_NAME,
      process.env.COLLECTION_NAME,
      { _id: eventId },
      { $push: { comments: { user, text } } }
    );

    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Comment added", data: result });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
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

module.exports = router;
