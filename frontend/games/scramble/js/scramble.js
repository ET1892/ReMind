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
let questionCount = 0;
let usedWords = [];

const initTimer = (maxTime) => {
    clearInterval(timer);
    timer = setInterval(() => {
        if (maxTime > 0) {
            maxTime--;
            timeText.innerText = maxTime;
        } else {
            modal.style.display = "block";
            modalContent.classList.add("modal-wrong");
            modalText.innerHTML = `<br>Time's Up! <b>${correctWord.toUpperCase()}</b> was the correct word`;

            setTimeout(() => {
                modal.style.display = "none";
            }, 3000);  

            endGame();
        }
    }, 1000);
};

inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
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
    questionCount = 0;
    score = 0;
    scoreArea.innerHTML = score;
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
    `;
    usedWords = [];
    score = 0;
};

const winGame = () => {
    clearInterval(timer);
    contentBox.style.display = "none";
    startArea.style.display = "block";
    modal.style.display = "block";
    modalContent.classList.add("modal-correct");
    modalText.innerHTML = `<br><center>You Won!<br>Your Final Score: ${score} Points.<br>You answered all 10 questions!</center>`;
    usedWords = [];
};

const initGame = (remainingTime = 45) => {
    if (questionCount === 10) { 
        winGame();
        return;
    }

    questionCount++;

    let randomObj;
    do {
        randomObj = words[Math.floor(Math.random() * words.length)];
    } while (usedWords.includes(randomObj.word));

    usedWords.push(randomObj.word);

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

    initTimer(remainingTime);
};

const checkWord = () => {
    let userWord = inputField.value.toLowerCase();
    let timeLeft = parseInt(timeText.innerText);

    modalContent.classList.remove("modal-correct", "modal-wrong");

    if (!userWord) {
        modal.style.display = "block";
        return modalText.innerHTML = `<br>Please enter the word to check!`;
    }

    if (userWord !== correctWord) {
        if (score >= 1) {
            score -= 1;
            scoreArea.innerHTML = score;
        }
        modal.style.display = "block";
        modalContent.classList.add("modal-wrong");
        return modalText.innerHTML = `<br><b>${userWord}</b> is incorrect (-1 Point)`;
    } else {
        modal.style.display = "block";
        modalContent.classList.add("modal-correct");

        if (timeLeft >= 25) {
            score += 2;
            modalText.innerHTML = `<b>${correctWord.toUpperCase()}</b> is the correct word! You guessed it in less than 5 seconds! (+2 Points)`;
        } else {
            score++;
            modalText.innerHTML = `<b>${correctWord.toUpperCase()}</b> is the correct word! (+1 Point)`;
        }

        scoreArea.innerHTML = score;

        setTimeout(() => {
            modal.style.display = "none";
        }, 1500);
    }

    initGame(timeLeft);
};

refreshBtn.addEventListener("click", () => {
    let timeLeft = parseInt(timeText.innerText);
    initGame(timeLeft);
});

checkBtn.addEventListener("click", checkWord);

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
