// Function to automatically select the input field

document.addEventListener("keydown", function () {
  var myInput = document.getElementById("input");
  myInput.focus();
  if (myInput.value != "") {
    myInput.select();
  }
});




// Read the TSV file into an array
// Randomly select an essay from a TSV file
async function selectRandomEssay() {
  const response = await fetch('/static/longText.tsv');
  const text = await response.text();
  const lines = text.split('\n');
  lines.shift(); // Remove header row
  const essays = lines.map(line => line.split('\t')[1]);
  const randomIndex = Math.floor(Math.random() * essays.length);
  const randomEssay = essays[randomIndex];
  return randomEssay;
}

let greyText;

async function loadGreyText() {
  greyText = await selectRandomEssay();
}

loadGreyText().then(() => {
  // All the code that depends on the greyText value should be placed here or called from here

  let countText = greyText.length;
  console.log(countText);

  // ... rest of your code
});




// const greyText =
//   "The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the English alphabet. It is often used as a typing exercise to improve speed and accuracy. Try to type it without looking at the keyboard or making any mistakes."; // Define the text to be displayed in grey

// the amount of vars that are in the greyText zone

let countText = greyText.length;
console.log(countText);
let elapsedTime = 0; // Initialize the elapsed time to 0

function startTimer() {
  let startTime = Date.now();
  timerIntervalId = setInterval(function () {
    elapsedTime = Date.now() - startTime; // Update the elapsed time
    let minutes = Math.floor(elapsedTime / 60000);
    let seconds = Math.floor((elapsedTime % 60000) / 1000);
    document.getElementById("timer").textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, 1000);
}
// get seconds that have passed
function getElapsedTimeInSeconds() {
  return Math.floor(elapsedTime / 1000);
}
// stop timer
function stopTimer() {
  clearInterval(timerIntervalId);
}

// calculate accuracy
function getAccuracy(totalChars, errors) {
  return Math.round(((totalChars - errors) / totalChars) * 100);
}

let errorCount = 0; // Initialize the error count to 0

// Get the text container element
const textContainer = document.getElementById("text-container");

// Define a function to create an array of <span> elements, one for each character in a given string
function createGreyText(str) {
  const textArray = str.split(""); // Convert the string into an array of characters
  const textElements = textArray.map((char) => {
    const span = document.createElement("span"); // Create a new <span> element
    span.textContent = char; // Set the text content of the <span> to the current character
    span.classList.add("grey"); // Add the "grey" CSS class to the <span>
    return span; // Return the <span> element
  });
  return textElements; // Return an array of <span> elements
}
let timerOn = false;
document.addEventListener("keydown", function (event) {
  // Check if the key pressed is a letter or a number
  if (
    (event.keyCode >= 65 && event.keyCode <= 90 && timerOn === false) ||
    (event.keyCode >= 48 && event.keyCode <= 57 && timerOn === false)
  ) {
    startTimer();
    timerOn = true;
  }
});

//calculate WPM
function calculateTypingSpeed(charCount, seconds) {
  const wpm = Math.round(((charCount / seconds) * 60) / 5);
  if (wpm > 1000) {
    return 0;
  } else {
    return wpm;
  }
}
// Define a function to handle changes to the input field
function handleInputChange() {
  const input = document.getElementById("input");
  const greySpans = document.querySelectorAll(".grey"); // Get all the <span> elements with the "grey" CSS class
  let index = 0; // Keep track of the current index in the array of <span> elements
  let isDone = false;
  input.addEventListener("input", function () {
    const typedChar = input.value.charAt(input.value.length - 1); // Get the most recently typed character
    const currentSpan = greySpans[index]; // Get the <span> element corresponding to the current index
    const nextSpan = greySpans[index + 1];

    if (typedChar === currentSpan.textContent) {
      // If the typed character matches the text content of the current <span>
      if (index < countText - 1) {
        nextSpan.classList.add("current");
      }
      currentSpan.classList.remove("current");
      currentSpan.classList.remove("grey"); // Remove the "grey" CSS class from the current <span>
      currentSpan.classList.add("black"); // Add a "black" CSS class to the current <span>
      // currentSpan.nextElementSibling.style.setProperty("background-color", "#f2f2f2");
      index++; // Increment the current index
    } else {
      // If the typed character doesn't match the text content of the current <span>
      currentSpan.classList.add("incorrect"); // Add an "incorrect" CSS class to the current <span>
      if (currentSpan.textContent === " ") {
        currentSpan.classList.add("incorrect_spaces");
      }
      index++;
      nextSpan.classList.add("current");
      currentSpan.classList.remove("current");
      errorCount++;
      document.getElementById(
        "error-count"
      ).textContent = `Errors: ${errorCount}`;
    }
    let secondsPassed = getElapsedTimeInSeconds();
    let speed = calculateTypingSpeed(index, secondsPassed);
    document.getElementById("wpm").textContent = `wmp: ${speed}`;
    let accuracy = getAccuracy(index, errorCount);
    document.getElementById("accuracy-counter").textContent = `${accuracy}%`;

    // stop everything when input is done

    if (index === countText) {
      stopTimer();
      input.readOnly = true;
      isDone = true;
    }
  });
  // Be able to use backspace
  input.addEventListener("keydown", function (event) {
    if ((event.code === "Backspace" || event.code === "Delete") && isDone === false) {
      event.preventDefault();

      if (event.code === "Backspace" && index > 0) {
        index--;
      }

      const currentSpan = greySpans[index];
      const nextSpan = greySpans[index + 1];

      nextSpan.classList.remove("current");
      currentSpan.classList.add("current");

      currentSpan.classList.remove("black");
      currentSpan.classList.add("grey");

      if (errorCount > 0 && currentSpan.classList.contains("incorrect")) {
        // currentSpan.classList.remove("black", "incorrect");
        currentSpan.classList.remove("black", "incorrect_spaces", "incorrect");
        currentSpan.classList.add("grey");
        errorCount--;
      }
      document.getElementById(
        "error-count"
      ).textContent = `Errors: ${errorCount}`;

      input.value = input.value.slice(0, -1);
    }
  });
}

const textElements = createGreyText(greyText); // Create an array of <span> elements for the grey text
textElements.forEach((element) => {
  textContainer.appendChild(element); // Add each <span> element to the text container
});

handleInputChange(); // Start listening for input changes in the input field
