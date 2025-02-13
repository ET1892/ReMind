const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config(); // Load environment variables


// Initialize Firebase Admin SDK
require("dotenv").config();
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});


const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Health Check API
app.get("/", (req, res) => res.send("Backend is working!"));

// ✅ User Signup API (Create user & store initial game data)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Create user in Firebase Authentication using Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Initialize game data in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      games: {
        minesweeper: { highestScore: 0, history: [] },
        scramble: { highestScore: 0, history: [] },
        sudoku: { highestScore: 0, history: [] },
        recall: { highestScore: 0, history: [] },
        tetris: { highestScore: 0, history: [] },
      },
    });

    res.status(201).json({ message: "User created", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Remove the User Login API (Client-side now handles login)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Sign in with email and password using Firebase Admin SDK
//     const user = await admin.auth().getUserByEmail(email);

//     if (user) {
//       res.json({ message: "Login successful", user: user });
//     } else {
//       res.status(401).json({ error: "Invalid credentials" });
//     }
//   } catch (error) {
//     res.status(401).json({ error: "Invalid credentials or user not found" });
//   }
// });

// ✅ Remove the Forgot Password API (Client-side now handles password reset)
// app.post("/forgot-password", async (req, res) => {
//     const { email } = req.body;
  
//     if (!email) {
//       return res.status(400).json({ error: "Please provide a valid email address." });
//     }
  
//     try {
//       // Generate password reset link using Firebase Admin SDK
//       const resetLink = await admin.auth().generatePasswordResetLink(email);
  
//       // Firebase automatically sends the reset link to the user's email
//       // (no need for manual email sending)
  
//       // Respond with a success message
//       res.json({ message: "Password reset email sent. Please check your inbox." });
//     } catch (error) {
//       // Log the error details for debugging
//       console.error("Error sending password reset email:", error);
  
//       // Respond with a detailed error message
//       res.status(400).json({ error: error.message || "Failed to send password reset email." });
//     }
//   });

// ✅ Save Game Score API
app.post("/update-score", async (req, res) => {
  const { uid, game, score } = req.body;

  if (!uid || !game || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    let userData = userDoc.data();
    let gameData = userData.games[game] || { highestScore: 0, history: [] };

    gameData.history.push(score);
    if (score > gameData.highestScore) {
      gameData.highestScore = score;
    }

    await userRef.update({ [`games.${game}`]: gameData });

    res.json({ message: "Score updated", gameData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Fetch User Data API
app.get("/get-user-data", async (req, res) => {
    const { uid } = req.query;
  
    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    try {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
  
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ userData: userDoc.data() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

// ✅ Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
