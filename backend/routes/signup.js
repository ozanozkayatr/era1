const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../mysqlConnection");

router.post("/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
    const values = [full_name, email, hashedPassword];

    db.query(sql, values, (error, results) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
