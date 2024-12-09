// server.js

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const axios = require("axios"); // For communicating with Python backend
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For JWT authentication
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;

// JWT Secret Key (Do NOT expose this in production code)
const JWT_SECRET = "a8f3d4b6c9e7f10g2h5j8k7l9m0n3p6q4r2t1v5w8x7y9z0A1B3C6D8E9F7G5H4";

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if your frontend is hosted elsewhere
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// MongoDB Configuration
const uri = "mongodb://localhost:27017";
const dbName = "userDatabase";
const usersCollectionName = "users";
const registrationsCollectionName = "registrations"; // New collection for registrations

const client = new MongoClient(uri, { useUnifiedTopology: true });

// Connect to MongoDB once at startup
let db, usersCollection, registrationsCollection;
client.connect()
  .then(() => {
    db = client.db(dbName);
    usersCollection = db.collection(usersCollectionName);
    registrationsCollection = db.collection(registrationsCollectionName); // Initialize registrations collection
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// JWT Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
      const token = tokenParts[1];
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          console.error("JWT verification failed:", err);
          return res.status(403).send({ message: "Forbidden: Invalid token." });
        }
        req.user = user; // Attach user info to request
        next();
      });
    } else {
      return res.status(401).send({ message: "Unauthorized: Malformed token." });
    }
  } else {
    return res.status(401).send({ message: "Unauthorized: No token provided." });
  }
};

// Register API
app.post("/register", async (req, res) => {
  try {
    const { username, password, accountType } = req.body;

    // Validate input
    if (!username || !password || !accountType) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Check if the username already exists for the same account type
    const existingUser = await usersCollection.findOne({ username, accountType });
    if (existingUser) {
      return res.status(400).send({ 
        message: `Username already exists for account type: ${accountType}. Please choose a different username.` 
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
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

    // Validate input
    if (!username || !password || !accountType) {
      return res.status(400).send({ message: "All fields are required." });
    }

    // Find the user
    const user = await usersCollection.findOne({ username, accountType });
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Generate JWT for Admin users
    if (user.accountType === "Admin") {
      const tokenPayload = { username: user.username, accountType: user.accountType };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' }); // Token valid for 2 hours
      res.status(200).send({ 
        message: `Welcome, ${user.username} (${user.accountType})!`,
        accountType: user.accountType, // Include accountType in the response
        token // Send JWT to the client
      });
    } else {
      // For non-admin users, no token is generated
      res.status(200).send({ 
        message: `Welcome, ${user.username} (${user.accountType})!`,
        accountType: user.accountType // Include accountType in the response
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Login failed." });
  }
});

// Chatbot API
app.post('/api/chat', async (req, res) => {
  const { question, mode, session_id } = req.body;

  try {
    // Forward the request to the Python backend
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

// **New Endpoint: Get All Registrations (Protected)**
app.get('/registrations', authenticateJWT, async (req, res) => {
  try {
    // Only Admins can access this route
    if (req.user.accountType !== 'Admin') {
      return res.status(403).send({ message: "Forbidden: Admins only." });
    }

    // Fetch all documents from the registrations collection
    const registrations = await registrationsCollection.find({}).toArray();
    res.status(200).json({ registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
});

// **New Endpoint: Update a Registration (Protected)**
app.put('/registrations/:id', authenticateJWT, async (req, res) => {
  try {
    // Only Admins can access this route
    if (req.user.accountType !== 'Admin') {
      return res.status(403).send({ message: "Forbidden: Admins only." });
    }

    const registrationId = req.params.id;
    const updatedData = req.body;

    // Validate registrationId
    if (!ObjectId.isValid(registrationId)) {
      return res.status(400).send({ message: "Invalid registration ID." });
    }

    // Update the registration
    const result = await registrationsCollection.updateOne(
      { _id: new ObjectId(registrationId) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Registration not found." });
    }

    res.status(200).send({ message: "Registration updated successfully." });
  } catch (error) {
    console.error("Error updating registration:", error);
    res.status(500).send({ message: "Failed to update registration." });
  }
});

// Endpoint to serve the information.txt file
app.get('/university-info', (req, res) => {
  const filePath = path.join(__dirname, "../python-backend/information.txt");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ message: "Failed to load university info." });
    }
    res.status(200).json({ info: data });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
