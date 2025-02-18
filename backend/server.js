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
app.use(bodyParser.json());

// ✅ Health Check API
app.get("/", (req, res) => res.send("Backend is working!"));

// ✅ User Signup API
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

    const now = new Date();
    const timestamp =
      now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      now.toLocaleDateString("en-GB");

    gameData.history.push({ score, timestamp });

    if (gameData.history.length > 50) {
      gameData.history.shift();
    }

    if (score > gameData.highestScore) {
      gameData.highestScore = score;
    }

    await userRef.update({ [`games.${game}`]: gameData });

    res.json({ message: "Score updated", gameData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Save Game Result API (NEW)
app.post("/saveGameResult", async (req, res) => {
  try {
    const { uid, game, score, timeTaken, level } = req.body;

    if (!uid || !game || score === undefined || !timeTaken || !level) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.collection("gameResults").add({
      uid,
      game,
      score,
      timeTaken,
      level,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Game result saved successfully!" });
  } catch (error) {
    console.error("Error saving game result:", error);
    res.status(500).json({ error: "Internal server error" });
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
