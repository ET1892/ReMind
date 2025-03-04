// Import Firebase functions, all boilerplate from firebase themselves
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration for client-side retrieval
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
        const bestScore = gameData.bestScore || "N/A"; // Get bestScore or NA if not there
        
        // Store both score and timestamp in an array
        const scoresWithTimestamp = gameScores.map(entry => ({
            score: entry.score,
            timestamp: entry.timestamp
        }));

        if (scoresWithTimestamp.length === 0) {
            console.log(`No history found for ${game}, skipping...`);
            continue; // Skip empty games 
        }

        // Calculate Average Score
        const averageScore = (scoresWithTimestamp.reduce((sum, entry) => sum + entry.score, 0) / scoresWithTimestamp.length).toFixed(2);

        maxScores = Math.max(maxScores, scoresWithTimestamp.length);
        gameDataArray.push({ game, scoresWithTimestamp, bestScore, averageScore });
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
    headerRow.innerHTML += `<th>Best Score</th>`; // Add Best Score column
    headerRow.innerHTML += `<th>Average Score</th>`; // Add Average Score column

    // Populate table rows on data received
    gameDataArray.forEach(({ game, scoresWithTimestamp, bestScore, averageScore }) => {
        let rowHtml = `<tr><td>${game}</td>`;

        for (let i = 0; i < maxScores; i++) {
            const score = scoresWithTimestamp[i];
            const scoreValue = score ? score.score : "";
            const timestamp = score ? score.timestamp : "";

            // Add the timestamp to the hover using a tooltip: https://www.geeksforgeeks.org/how-to-add-a-tooltip-to-a-div-using-javascript/
            rowHtml += `<td data-timestamp="${timestamp}" class="score-cell">${scoreValue}</td>`;
        }

        rowHtml += `<td><strong>${bestScore}</strong></td>`;
        rowHtml += `<td><strong>${averageScore}</strong></td>`;
        rowHtml += "</tr>";

        tableBody.innerHTML += rowHtml;
    });




    // Tooltip element learned from: https://www.geeksforgeeks.org/how-to-add-a-tooltip-to-a-div-using-javascript/
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.padding = "6px 10px";
    tooltip.style.background = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "white";
    tooltip.style.borderRadius = "5px";
    tooltip.style.fontSize = "18px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.2s ease-in-out";
    document.body.appendChild(tooltip);

    const scoreCells = document.querySelectorAll(".score-cell");

    scoreCells.forEach(cell => {
        cell.addEventListener("mouseenter", function (event) {
            const timestamp = cell.getAttribute("data-timestamp");

             //Because of my silliness of storing timestamp as string it has to be parsed first before displaying
            if (timestamp) {
                // Regex from StackOverflow
                const timestampRegex = /^(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/;
                const match = timestamp.match(timestampRegex);

                if (match) {
                    const [, hours, minutes, day, month, year] = match.map(num => parseInt(num));
                    const date = new Date(year, month - 1, day, hours, minutes);

                    // Format without seconds
                    const formattedTimestamp = date.toLocaleString(undefined, { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        day: "2-digit", 
                        month: "2-digit", 
                        year: "numeric" 
                    });

                    // Display tooltip on hover
                    tooltip.textContent = `Timestamp: ${formattedTimestamp}`;
                    tooltip.style.opacity = "1";
                    tooltip.style.left = `${event.pageX + 10}px`; // Position near cursor so its visible and not under mouse
                    tooltip.style.top = `${event.pageY + 10}px`;
                } else {
                    console.warn("Invalid timestamp format:", timestamp);
                }
            }
        });

        cell.addEventListener("mousemove", function (event) {
            // Update tooltip position dynamically as the mouse moves
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        });

        cell.addEventListener("mouseleave", function () {
            tooltip.style.opacity = "0"; // Hide tooltip when not in hover mode
        });
    });



}

// LOAD REAL USER GAME DATA WHEN THE PAGE LOADS 
window.onload = loadUserGameData;
