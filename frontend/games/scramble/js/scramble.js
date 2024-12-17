const wordText = document.querySelector(".word"),
hintText = document.querySelector(".hint span"),
timeText = document.querySelector(".time b"),
inputField = document.querySelector("input"),
refreshBtn = document.querySelector(".refresh-word"),
checkBtn = document.querySelector(".check-word");
contentBox = document.querySelector(".container .content");
startArea = document.querySelector(".startArea");
scoreArea = document.querySelector(".score");
modalContent = document.querySelector(".modal-content");

// Get the modal
var modal = document.getElementById("myModal");
var modalText = document.getElementById("modalText");

let correctWord, timer;
let score = 0;
let questionCount = 0; // Track the number of questions
let usedWords = []; // To keep track of used words

const initTimer = (maxTime) => {
    clearInterval(timer);
    timer = setInterval(() => {
        if (maxTime > 0) {
            maxTime--;
            return timeText.innerText = maxTime;
        }
        modal.style.display = "block";
        modalContent.classList.add("modal-wrong");
        modalText.innerHTML = `<br>Time's Up! <b>${correctWord.toUpperCase()}</b> was the correct word`;

        // Add a delay of 3 seconds before hiding the modal
        setTimeout(() => {
            modal.style.display = "none"; // Hide the modal after 3 seconds
        }, 3000);  // Delay of 3 seconds

        endGame();
    }, 1000);
};


inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        // Check if modal is open, then close it
        if (modal.style.display === "block") {
            modal.style.display = "none";
        } else {
            checkWord();
        }
    }
});

const start = () => {
    contentBox.style.display = "block";
    startArea.style.display = "none";
    questionCount = 0; // Reset question count for a new game
    initGame();
};

const endGame = () => {
    clearInterval(timer);
    contentBox.style.display = "none";
    startArea.style.display = "block";
    modal.style.display = "block";
    modalContent.classList.remove("modal-correct");
    modalContent.classList.add("modal-wrong");
    modalText.innerHTML = `
    <center><br>Time's Up! <b>${correctWord.toUpperCase()}</b> was the correct word.
    <br>You Lost</center><br>
    </center>
    `;
    usedWords = []; // Reset used words for a new game
};

const winGame = () => {
    clearInterval(timer);
    contentBox.style.display = "none";
    startArea.style.display = "block";
    modal.style.display = "block";
    modalContent.classList.add("modal-correct");
    modalText.innerHTML = `<br><center>You Won!<br>Your Final Score: ${score} Points.<br>You answered all 10 questions!</center>`;
    usedWords = []; // Reset used words for a new game
};

const initGame = () => {
    if (questionCount === 10) { // End game after 10 questions
        winGame();
        return;
    }

    initTimer(30);
    questionCount++; // Increment question count

    let randomObj;
    do {
        randomObj = words[Math.floor(Math.random() * words.length)];
    } while (usedWords.includes(randomObj.word)); // Ensure word hasn't been used

    usedWords.push(randomObj.word); // Mark the word as used

    let wordArray = randomObj.word.split("");
    for (let i = wordArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }

    wordText.innerText = wordArray.join("");
    hintText.innerText = randomObj.hint;
    correctWord = randomObj.word.toLowerCase();
    inputField.value = "";
    inputField.setAttribute("maxlength", correctWord.length);
    scoreArea.innerHTML = score;
};

const checkWord = () => {
    let userWord = inputField.value.toLowerCase();
    let timeLeft = parseInt(timeText.innerText); // Get the remaining time from the timer

    modalContent.classList.remove("modal-correct", "modal-wrong");

    if (!userWord) {
        modal.style.display = "block";
        return modalText.innerHTML = `<br>Please enter the word to check!`;
    }

    if (userWord !== correctWord) {
        if (score >= 1) {
            score = score - 1;
            scoreArea.innerHTML = score;
        }
        modal.style.display = "block";
        modalContent.classList.add("modal-wrong"); // Set the wrong class
        return modalText.innerHTML = `<br><b>${userWord}</b> is incorrect (-1 Point)`;
    } else {
        modal.style.display = "block";
        modalContent.classList.add("modal-correct"); // Set the correct class

        // Award +2 if the word was guessed within 5 seconds, otherwise +1
        if (timeLeft >= 25) {
            score += 2;
            modalText.innerHTML = `<b>${correctWord.toUpperCase()}</b> is the correct word! You guessed it in less than 5 seconds! (+2 Points)`;
        } else {
            score++;
            modalText.innerHTML = `<b>${correctWord.toUpperCase()}</b> is the correct word! (+1 Point)`;
        }

        scoreArea.innerHTML = score;

        // Hide the modal after 2 seconds
        setTimeout(() => {
            modal.style.display = "none";
        }, 1500);  // Delay of 2 seconds
    }

    initGame(); // Move to the next word
};



refreshBtn.addEventListener("click", initGame);
checkBtn.addEventListener("click", checkWord);



/* When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
};

*/

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
