// html elements
const filter = document.querySelector('#filter');
const volume = document.querySelector('#volume');
const buttonsContainer = document.querySelector('#buttonsContainer');
const tooltip = document.querySelector('#tooltip');
const removeButton = document.querySelector('#removeButton');
// const canvas = document.querySelector('#visualizer');
// const canvasCtx = canvas.getContext('2d');

// variables
let isSoundPlaying = false;
let currentAudio = null;
let isDeleteModeOn = false;

// functions
function handleDeleteButton() {

}

function toggleButtonDelete() {
  isDeleteModeOn = !isDeleteModeOn;

  removeButton.textContent = isDeleteModeOn ? "Cancel" : "Remove Button"

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.style.display = isDeleteModeOn ? "block" : "none";
  });
}

function createButton(buttonObj) {
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");
  const button = document.createElement("button");
  button.name = buttonObj.name.replace(" ", "");
  button.dataset.name = buttonObj.name;
  button.textContent = buttonObj.name;
  button.classList.add("button");
  button.addEventListener("click", () => {
    if (isSoundPlaying) return; // Prevent action if a sound is currently playing

    isSoundPlaying = true;
    button.disabled = true; // Disable the button when sound starts playing

    const sound = new Audio(buttonObj.soundPath);
    const currentVolume = volume.value;
    if(currentVolume > 0) {
      sound.volume = volume.value / 100;
    } else {
      sound.volume = 0;
    }
    sound.play();
    currentAudio = sound;

    sound.addEventListener('ended', () => {
      isSoundPlaying = false;
      button.disabled = false; // Re-enable the button when sound ends
      currentAudio = null; // Clear the reference when audio ends
    });
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add('delete-btn');
  deleteBtn.dataset.name = buttonObj;
  deleteBtn.addEventListener('click', handleDeleteButton);
  const deleteBtnText = document.createElement("span");
  deleteBtnText.textContent = "X";

  deleteBtn.appendChild(deleteBtnText);
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(deleteBtn);

  buttonsContainer.appendChild(buttonContainer);
}

function filterButtons() {
  const filterValue = filter.value.toLowerCase();
  const buttons = document.querySelectorAll('.button');

  buttons.forEach(button => {
    const buttonName = button.dataset.name.toLowerCase();
    if (buttonName.includes(filterValue)) {
      button.style.display = ''; // Show button
    } else {
      button.style.display = 'none'; // Hide button
    }
  });
}

function updateVolumeBackground() {
  const value = volume.value;
  const min = volume.min || 0;
  const max = volume.max || 100;

  // Calculate the percentage of the slider's current value
  const percentage = ((value - min) / (max - min)) * 100;

  // keep the dark blue at 5 percent to prevent color changing to the left of slider ball
  const adjustedPercentage = percentage <= 5 ? 5 : percentage;

  // Apply the background using a linear gradient to show the filled part and unfilled part
  volume.style.background = `linear-gradient(to right, #062E6F ${adjustedPercentage}%, #A8C7FA ${adjustedPercentage}%)`;
}

// event listeners
filter.addEventListener('input', filterButtons);

volume.addEventListener('input', () => {
  updateVolumeBackground();
  if (currentAudio) {
    const currentVolume = volume.value;
    if(currentVolume > 0) {
      currentAudio.volume = volume.value / 100;
    } else {
      currentAudio.volume = 0;
    }
  }
});

volume.addEventListener('mousemove', (e) => {
  tooltip.style.display = 'block';
  tooltip.textContent = `Volume: ${volume.value}%`;

  // Get the width of the volume slider and the midpoint
  const volumeRect = volume.getBoundingClientRect();
  const volumeMidpoint = volumeRect.left + volumeRect.width / 2;

  if (e.clientX > volumeMidpoint) {
    // If mouse is on the right half of the slider, position tooltip on the left of the cursor
    tooltip.style.left = `${e.pageX - tooltip.offsetWidth - 10}px`; // Offset to the left of the cursor
  } else {
    // If mouse is on the left half of the slider, position tooltip on the right of the cursor
    tooltip.style.left = `${e.pageX + 10}px`; // Offset to the right of the cursor
  }

  tooltip.style.top = `${e.pageY - 40}px`; // Offset above cursor
});

// Hide the tooltip when the mouse leaves the slider
volume.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

removeButton.addEventListener('click', toggleButtonDelete);

// execution
updateVolumeBackground();

fetch('/buttons.json')
.then(result => result.json())
.then(buttons => {
  if(buttons.length > 0) {
    for(let i = 0; i < buttons.length; i++) {
      createButton(buttons[i]);
    }
  }
})
.catch(err => console.log(err));
