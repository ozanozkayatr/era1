const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const connection = require("../database");

router.post("/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    connection.query(
      query,
      [full_name, email, hashedPassword],
      (error, results) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          console.error("Error inserting user into database:", error);
          return res.status(500).json({ message: "Server error" });
        }
        res.status(201).json({ message: "User registered successfully!" });
      }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
