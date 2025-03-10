const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config(); // Load environment variables


// Initialize Firebase Admin SDK from env
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

//use cors and expressJS for middleware routing  
const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());



//Health Check
app.get("/", (req, res) => res.send("Backend is working!"));



//User Signup API
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ //Ensures email and password in request
      email,
      password,
    });


    //creates object of games 
    await db.collection("users").doc(userRecord.uid).set({
      email,
      games: {
        minesweeper: { bestScore: null, history: [] }, //changed from 0 to null, as nothing was lower than 0 so just leave it empty on a new account
        scramble: { bestScore: null, history: [] },
        sudoku: { bestScore: null, history: [] },
        recall: { bestScore: null, history: [] },
        tetris: { bestScore: null, history: [] },
      },
    });

    res.status(201).json({ message: "User created", uid: userRecord.uid }); //success feedback 201
  } catch (error) {
    res.status(400).json({ error: error.message }); //error message if didnt work
  }
});


//Update Score API
app.post("/update-score", async (req, res) => 
  {
  console.log("Received Headers:", req.headers);
  console.log("Received Data Type:", typeof req.body);
  console.log("Received Data:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) { //if empty give 400 error
    return res.status(400).json({ error: "Request body is empty or not parsed correctly" });
  }

  const { uid, game, score, lowerIsBetter } = req.body; //Looking for these param, lowerIsBetter for timed games where the lower score is better

  if (!uid || !game || typeof score !== "number" || typeof lowerIsBetter !== "boolean") {
    return res.status(400).json({ error: "Invalid input" }); //if not as on left will feedabck invalid input
  }

  try {
    const userRef = db.collection("users").doc(uid); //try the user for the UID in local storage, if not there will give user not found error
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    let userData = userDoc.data();
    let gameData = userData.games?.[game] || { bestScore: null, history: [] };

    //posts the local time in the game history array also
    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " " + now.toLocaleDateString("en-GB");

    // Always update history even if score worse, update to history but not high score
    const historyEntry = { score, timestamp };

    let newBestScore = gameData.bestScore;

    if (newBestScore === null) {
      newBestScore = score; // First valid score
    } else if (lowerIsBetter) {
      if (score > 0) { // Ensure score is greater than 0, makes sure no bug finders learn to cheat 👀
        newBestScore = Math.min(newBestScore, score);
      }
    } else {
      newBestScore = Math.max(newBestScore, score);
    }
    

    // Update db
    await userRef.update({
      [`games.${game}.history`]: admin.firestore.FieldValue.arrayUnion(historyEntry),
      [`games.${game}.bestScore`]: newBestScore,
    });

    res.json({ message: "Score updated", newBestScore, historyEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




//Fetch User Data API when signing in
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
