document.addEventListener("keydown", function () {
  var myInput = document.getElementById("input");
  myInput.focus();
  if (myInput.value != "") {
    myInput.select();
  }
});

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const variable = urlParams.get('variable');
console.log(variable)
async function selectRandomEssay() {
  let response;
  if (variable === 'mid') {
    response = await fetch("/static/longText.tsv");
  }
  if (variable === 'short') {
    response = await fetch("/static/shortText.tsv");
  }
  if (variable === 'long') {
    response = await fetch("/static/slongText.tsv");
  }
  const text = await response.text();
  const lines = text.split("\n");
  lines.shift();
  const essays = lines.map((line) => line.split("\t")[1]);
  const randomIndex = Math.floor(Math.random() * essays.length);
  const randomEssay = essays[randomIndex];
  return randomEssay;
}

async function loadGreyText() {
  return await selectRandomEssay();
}

async function init() {
  const loadedGreyText = await loadGreyText();

  let countText = loadedGreyText.length;
  console.log(countText);

  let elapsedTime = 0;

  function startTimer() {
    let startTime = Date.now();
    timerIntervalId = setInterval(function () {
      elapsedTime = Date.now() - startTime;
      let minutes = Math.floor(elapsedTime / 60000);
      let seconds = Math.floor((elapsedTime % 60000) / 1000);
      document.getElementById("timer").textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }, 1000);
    selectRandomEssay();
  }

  function getElapsedTimeInSeconds() {
    return Math.floor(elapsedTime / 1000);
  }

  function stopTimer() {
    clearInterval(timerIntervalId);
  }

  function getAccuracy(totalChars, errors) {
    return Math.round(((totalChars - errors) / totalChars) * 100);
  }

  let errorCount = 0;
  const textContainer = document.getElementById("text-container");

  function createGreyText(str) {
    const textArray = str.split("");
    const textElements = textArray.map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.classList.add("grey");
      return span;
    });
    return textElements;
  }

  let timerOn = false;
  document.addEventListener("keydown", function (event) {
    if (
      (event.keyCode >= 65 && event.keyCode <= 90 && timerOn === false) ||
      (event.keyCode >= 48 && event.keyCode <= 57 && timerOn === false)
    ) {
      startTimer();
      timerOn = true;
    }
  });

  function calculateTypingSpeed(charCount, seconds) {
    const wpm = Math.round(((charCount / seconds) * 60) / 5);
    if (wpm > 1000) {
      return 0;
    } else {
      return wpm;
    }
  }

  function handleInputChange() {
    const input = document.getElementById("input");
    const greySpans = document.querySelectorAll(".grey");
    let index = 0;
    let isDone = false;
    input.addEventListener("input", function () {
      const typedChar = input.value.charAt(input.value.length - 1);
      const currentSpan = greySpans[index];
      const nextSpan = greySpans[index + 1];

      if (typedChar === currentSpan.textContent) {
        if (index < countText - 1) {
          nextSpan.classList.add("current");
        }
        currentSpan.classList.remove("current");
        currentSpan.classList.remove("grey");
        currentSpan.classList.add("black");
        index++;
      } else {
        currentSpan.classList.add("incorrect");
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
      document.getElementById("wpm").textContent = `wpm: ${speed}`;
      let accuracy = getAccuracy(index, errorCount);
      document.getElementById("accuracy-counter").textContent = `${accuracy}%`;

      if (index === countText) {
        stopTimer();
        input.readOnly = true;
        isDone = true;
      }
    });

    input.addEventListener("keydown", function (event) {
      if (
        (event.code === "Backspace" || event.code === "Delete") &&
        isDone === false
      ) {
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
          currentSpan.classList.remove(
            "black",
            "incorrect_spaces",
            "incorrect"
          );
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

  const textElements = createGreyText(loadedGreyText);
  textElements.forEach((element) => {
    textContainer.appendChild(element);
  });

  handleInputChange();
}

init();
