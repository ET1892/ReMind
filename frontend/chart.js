

//Populates user data client side, by using the locally stored UID and their email, this makes it that theres no sign in etc, when the page is refreshed it will also add the resutls of games they have played
//and new scores, since signing in



// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration for client side retrieval
const firebaseConfig = {
    apiKey: "AIzaSyA4XFhK_ZPpJFBz8XuYlPmH3DZDMSRYilE",
    authDomain: "remind-75124.firebaseapp.com",
    projectId: "remind-75124",
    storageBucket: "remind-75124.firebasestorage.app",
    messagingSenderId: "358342790086",
    appId: "1:358342790086:web:7d64b01f8f74d86c21c0c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// FUNCTION TO LOAD USER'S GAME DATA FROM FIREBASE 
async function loadUserGameData() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is logged in:", user.uid);
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const games = userDoc.data().games || {};
                    console.log("Fetched game data:", games);
                    populateGameTable(games);
                } else {
                    console.log("No game data found for this user.");
                }
            } catch (error) {
                console.error("Error fetching game data:", error);
            }
        } else {
            console.log("User not logged in.");
        }
    });
}

// FUNCTION TO POPULATE THE TABLE WITH GAME DATA
function populateGameTable(games) {
    const tableBody = document.querySelector("#gameTable tbody");
    const headerRow = document.querySelector("#headerRow");
    tableBody.innerHTML = ""; // Clear existing content

    let maxScores = 0;
    let gameDataArray = [];

    // Process game data from Firebase
    for (const game in games) {
        const gameData = games[game] || {}; // Ensure gameData exists
        const gameScores = gameData.history || []; // Extract history array
        const scores = gameScores.map(entry => entry.score); // Get scores only

        if (scores.length === 0) {
            console.log(`No history found for ${game}, skipping...`);
            continue; // Skip empty games
        }

        maxScores = Math.max(maxScores, scores.length);
        gameDataArray.push({ game, scores });
    }

    if (gameDataArray.length === 0) {
        console.log("No game history data available.");
        return;
    }

    // Update table headers based on max number of scores available
    headerRow.innerHTML = "<th>Game</th>"; // Reset headers
    for (let i = 1; i <= maxScores; i++) {
        headerRow.innerHTML += `<th>Score ${i}</th>`;
    }

    // Populate table rows
    gameDataArray.forEach(({ game, scores }) => {
        let rowHtml = `<tr><td>${game}</td>`;

        for (let i = 0; i < maxScores; i++) {
            rowHtml += `<td>${scores[i] !== undefined ? scores[i] : ""}</td>`;
        }
        rowHtml += "</tr>";

        tableBody.innerHTML += rowHtml;
    });
}

// LOAD REAL USER GAME DATA WHEN THE PAGE LOADS 
window.onload = loadUserGameData;
