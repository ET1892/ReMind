const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config(); // Load environment variables


// Initialize Firebase Admin SDK
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



//Health Check API
app.get("/", (req, res) => res.send("Backend is working!"));



//User Signup API
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      games: {
        minesweeper: { highestScore: null, history: [] },
        scramble: { highestScore: null, history: [] },
        sudoku: { highestScore: null, history: [] },
        recall: { highestScore: null, history: [] },
        tetris: { highestScore: null, history: [] },
      },
    });

    res.status(201).json({ message: "User created", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



app.post("/update-score", async (req, res) => {
  console.log("Received Headers:", req.headers);
  console.log("Received Data Type:", typeof req.body);
  console.log("Received Data:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or not parsed correctly" });
  }

  const { uid, game, score, lowerIsBetter } = req.body;

  if (!uid || !game || typeof score !== "number" || typeof lowerIsBetter !== "boolean") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    let userData = userDoc.data();
    let gameData = userData.games?.[game] || { highestScore: null, history: [] };

    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " " + now.toLocaleDateString("en-GB");

    // Always update history
    const historyEntry = { score, timestamp };

    let newBestScore = gameData.highestScore;

    if (newBestScore === null) {
      newBestScore = score; // First valid score
    } else if (lowerIsBetter) {
      if (score > 0) { // Ensure score is greater than 0, makes sure no bug finders learn to cheat 👀
        newBestScore = Math.min(newBestScore, score);
      }
    } else {
      newBestScore = Math.max(newBestScore, score);
    }
    

    // Update Firestore
    await userRef.update({
      [`games.${game}.history`]: admin.firestore.FieldValue.arrayUnion(historyEntry),
      [`games.${game}.highestScore`]: newBestScore,
    });

    res.json({ message: "Score updated", newBestScore, historyEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




//Fetch User Data API
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



//Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
