// Find the elements in our HTML
const input = document.getElementById("new_line");
const submitButton = document.getElementById("set-button");
const latestLine = document.getElementById("latest-line");

const revealButton = document.getElementById("reveal-button");
const fullStory = document.getElementById("full-story");

//variable to store initial user count
let startingCount = null;

//variable to store reveal threshold of story incrementation during session - make it unique for each user within a range of 3-5
let revealThreshold = Math.floor(Math.random()*3)+ 3;

//variable to store user input story sentences 
let savedSentences = [];

//starting binary for whether or not the user has added a sentence in this session
let sessionSubmit = false; 

// Show the most recent sentence
function showLatestSentence(data) {
  const sentences = data.sentences;

  savedSentences = sentences;

  // Set startingCount once, the first time this page loads
  if (startingCount === null) {
    startingCount = sentences.length;
  }

  //show sentence count
  document.getElementById('sentence-count').textContent = sentences.length + 1;

  // Make reveal available after three sentences since the sentence count at session start & user has submitted 
  revealButton.hidden = !(sessionSubmit && sentences.length >= startingCount + revealThreshold);

// Hide the previous reveal when the story updates
fullStory.hidden = true;

  if (sentences.length === 0) {
    latestLine.textContent = "Be the first to begin the story.";
  } else {
    latestLine.textContent = sentences[sentences.length - 1];
  }
}


// Ask the server for the saved story
async function loadStory() {
  try {
    const response = await fetch("/story");

    if (!response.ok) {
      throw new Error("Could not load the story.");
    }

    const data = await response.json();
    showLatestSentence(data);
  } catch (error) {
    latestLine.textContent = "Could not load the story. Please refresh.";
    console.error(error);
  }
}

// Send a new sentence to the server
async function submitSentence() {
  const sentence = input.value.trim();

  if (sentence === "") {
    alert("Please write a sentence first.");
    return;
  }

  submitButton.disabled = true;

  try {
    const response = await fetch("/new-sentence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sentence: sentence })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not save your sentence.");
    }

    sessionSubmit = true;
    showLatestSentence(data);
    input.value = "";
  } catch (error) {
    alert(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

// Connect the button and load the story when the page opens
submitButton.addEventListener("click", submitSentence);
loadStory();

// Show every saved sentence in order
revealButton.addEventListener("click", () => {
  // Clear the previous display so repeated clicks don't duplicate it
  fullStory.replaceChildren();

  for (const sentence of savedSentences) {
    const paragraph = document.createElement("p");
    paragraph.textContent = sentence;
    fullStory.appendChild(paragraph);
  }

   fullStory.hidden = false;
});

// Connect this browser to our server
const socket = io();

// Update the story when the server announces a change
socket.on("story-updated", () => {
  loadStory();
});