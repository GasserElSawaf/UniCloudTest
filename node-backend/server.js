// server.js

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

// JWT secret key (hardcoded as requested)
const JWT_SECRET = "a8f3d4b6c9e7f10g2h5j8k7l9m0n3p6q4r2t1v5w8x7y9z0A1B3C6D8E9F7G5H4";

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// MongoDB Configuration
const uri = "mongodb://localhost:27017";
const dbName = "userDatabase";
const usersCollectionName = "users";
const registrationsCollectionName = "registrations";

const client = new MongoClient(uri, { useUnifiedTopology: true });

let db, usersCollection, registrationsCollection;
client.connect()
  .then(() => {
    db = client.db(dbName);
    usersCollection = db.collection(usersCollectionName);
    registrationsCollection = db.collection(registrationsCollectionName);
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// JWT middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).send({ message: "No token provided." });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).send({ message: "No token provided." });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Invalid token." });
    // Check if user is admin
    if (decoded.accountType !== 'Admin') {
      return res.status(403).send({ message: "Access denied. Admins only." });
    }
    req.user = decoded;
    next();
  });
}

// Register API
app.post("/register", async (req, res) => {
  try {
    const { username, password, accountType } = req.body;
    if (!username || !password || !accountType) {
      return res.status(400).send({ message: "All fields are required." });
    }
    const existingUser = await usersCollection.findOne({ username, accountType });
    if (existingUser) {
      return res.status(400).send({ 
        message: `Username already exists for account type: ${accountType}. Please choose a different username.` 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ username, password: hashedPassword, accountType });
    res.status(200).send({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send({ message: "Registration failed." });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { username, password, accountType } = req.body;
    if (!username || !password || !accountType) {
      return res.status(400).send({ message: "All fields are required." });
    }

    const user = await usersCollection.findOne({ username, accountType });
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign({ username: user.username, accountType: user.accountType }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).send({ 
      message: `Welcome, ${user.username} (${user.accountType})!`,
      accountType: user.accountType,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Login failed." });
  }
});

// Chatbot API
app.post('/api/chat', async (req, res) => {
  const { question, mode, session_id } = req.body;
  try {
    const response = await axios.post(`http://localhost:8000/chat`, {
      question,
      mode,
      session_id
    });
    res.json({ answer: response.data.answer });
  } catch (error) {
    console.error("Error communicating with Python backend:", error);
    res.status(500).json({ error: "Failed to fetch response from the bot" });
  }
});

// Get All Registrations (Protected)
app.get('/registrations', authMiddleware, async (req, res) => {
  try {
    const registrations = await registrationsCollection.find({}).toArray();
    res.status(200).json({ registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
});

const fs = require("fs");
const path = require("path");

// Serve the information.txt file (Protected)
app.get('/university-info', authMiddleware, (req, res) => {
  const filePath = path.join(__dirname, "../python-backend/information.txt");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ message: "Failed to load university info." });
    }
    res.status(200).json({ info: data });
  });
});

// Update a registration (Protected)
app.put('/registrations/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // Remove session_id if present, as it's not a user-editable field
  if (updatedData.session_id) {
    delete updatedData.session_id;
  }

  try {
    const result = await registrationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Registration not found." });
    }

    res.status(200).json({ message: "Registration updated successfully." });
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).json({ message: "Failed to update registration." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
