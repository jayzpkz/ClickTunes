// html elements
const filter = document.querySelector('#filter');
const volume = document.querySelector('#volume');
const buttonsContainer = document.querySelector('#buttonsContainer');
const tooltip = document.querySelector('#tooltip');

// variables
let isSoundPlaying = false;
let currentAudio = null;

// functions
function createButton(buttonObj) {
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
    sound.volume = volume.value; // Set the volume to the current slider value
    sound.play();
    currentAudio = sound;

    sound.addEventListener('ended', () => {
      isSoundPlaying = false;
      button.disabled = false; // Re-enable the button when sound ends
      currentAudio = null; // Clear the reference when audio ends
    });
  });
  buttonsContainer.appendChild(button);
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

// event listeners
filter.addEventListener('input', filterButtons);

volume.addEventListener('input', () => {
  if (currentAudio) {
    currentAudio.volume = volume.value;
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

// execution
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