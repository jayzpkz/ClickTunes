// Constants

const TOOLTIP_OFFSET_X = 10;
const TOOLTIP_OFFSET_Y = 40;

// HTML Elements

const filter = document.querySelector('#filter');
const errorText = document.querySelector('.error-text');
const volume = document.querySelector('#volume');
const buttonsContainer = document.querySelector('#buttonsContainer');
const tooltip = document.querySelector('#tooltip');
const removeButton = document.querySelector('#removeButton');
const addButton = document.querySelector('#addButton');

// Global State Variables

const globalState = {
  isSoundPlaying: false,
  currentAudio: null,
  isDeleteModeOn: false,
}

// Utility Functions

/**
 * Delays function execution to reduce unnecessary function executions.
 * 
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The time in milliseconds to wait before executing the function.
 * @returns {Function} A debounced version of the input function.
 */
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Displays an error message in the error text element.
 * 
 * @param {string} errorMsg - The error message to display.
 */
function showError(errorMsg) {
  errorText.style.display = "block";
  errorText.textContent = errorMsg;
}

// Modal Functions

/**
 * Closes the add button modal and removes its elements from the DOM.
 * 
 * @param {HTMLElement} modalContainer - The modal container to close.
 * @param {HTMLElement} modalBackdrop - The modal backdrop to remove.
 */
function closeAddButtonModal(modalContainer, modalBackdrop) {
  document.body.removeChild(modalContainer);
  document.body.removeChild(modalBackdrop);
}

/**
 * Opens the add button modal and disables the add button.
 */
function openAddButtonModal() {
  addButton.disabled = true;
  
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('add-button-modal-container');

  const modalBackdrop = document.createElement('div');
  modalBackdrop.classList.add('add-button-modal-backdrop');
  modalBackdrop.addEventListener('click', () => {
    closeAddButtonModal(modalContainer, modalBackdrop);
    addButton.disabled = false;
  });

  const modal = document.createElement('div');
  modal.classList.add('add-button-modal');
  
  const modalCloseButton = document.createElement('button');
  modalCloseButton.classList.add('add-button-modal-close-btn');
  modalCloseButton.addEventListener('click', () => {
    closeAddButtonModal(modalContainer, modalBackdrop);
    addButton.disabled = false;
  });
  const modalCloseButtonText = document.createElement("span");
  modalCloseButtonText.textContent = "X";

  modalCloseButton.appendChild(modalCloseButtonText);
  modal.appendChild(modalCloseButton);
  modalContainer.appendChild(modal);
  document.body.appendChild(modalBackdrop);
  document.body.appendChild(modalContainer);
}

/**
 * Deletes selected button
 */
function handleDeleteButtonClick() {

}

/**
 * Toggles between delete mode state for buttons
 */
function toggleButtonDelete() {
  globalState.isDeleteModeOn = !globalState.isDeleteModeOn;

  removeButton.textContent = globalState.isDeleteModeOn ? "Cancel" : "Remove Button"

  const deleteButtonContainers = document.querySelectorAll('.button-container');
  deleteButtonContainers.forEach(container => {
    const button = container.querySelector('.button');
    button.classList.toggle('tremble-in-fear');

    const deleteButton = container.querySelector('.delete-btn');
    deleteButton.classList.toggle("delete-mode-on");
  });
}

/**
 * Updates volume value with value between 0 to 1
 *  * @param {HTMLElement} audio - The audio element that gets updated
 */
function setVolume(audio) {
  if (!audio) return; // Guard clause to handle null audio
  const currentVolume = volume.value;
  audio.volume = currentVolume > 0 ? currentVolume / 100 : 0;
}

/**
 * Creates a button element and its associated delete button,
 * appending them to the buttons container. The button plays a sound
 * when clicked, and the delete button allows for its removal.
 *
 * @param {Object} buttonObj - An object containing the properties
 *                             of the button, including name and sound path.
 * @param {string} buttonObj.name - The name of the button.
 * @param {string} buttonObj.soundPath - The path to the sound file.
 */
function createButton(buttonObj) {
  const buttonContainer = document.createElement("div");
  buttonContainer.dataset.name = buttonObj.name;
  buttonContainer.classList.add("button-container");
  const button = document.createElement("button");
  button.name = buttonObj.name.replace(" ", "");
  button.dataset.name = buttonObj.name;
  button.textContent = buttonObj.name;
  button.ariaLabel = `Play Sound for "${buttonObj.name}" button`;
  button.classList.add("button");
  button.addEventListener("click", () => {
    if (globalState.isSoundPlaying) return; // Prevent action if a sound is currently playing

    globalState.isSoundPlaying = true;
    button.disabled = true; // Disable the button when sound starts playing

    const sound = new Audio(buttonObj.soundPath);
    setVolume(globalState.currentAudio);
    sound.play();
    globalState.currentAudio = sound;

    sound.addEventListener('ended', () => {
      globalState.isSoundPlaying = false;
      button.disabled = false; // Re-enable the button when sound ends
      globalState.currentAudio = null; // Clear the reference when audio ends
    });
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add('delete-btn');
  deleteBtn.dataset.name = buttonObj.name;
  deleteBtn.ariaLabel = `Delete "${buttonObj.name}" button`;
  deleteBtn.addEventListener('click', handleDeleteButtonClick);
  const deleteBtnText = document.createElement("span");
  deleteBtnText.textContent = "X";

  deleteBtn.appendChild(deleteBtnText);
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(deleteBtn);

  buttonsContainer.appendChild(buttonContainer);
}

/**
 * Filters the button containers based on the input value from the filter.
 * Only shows button containers that include the filter value in their name.
 */
function filterButtons() {
  const filterValue = filter.value.toLowerCase();
  const buttonContainers = document.querySelectorAll('.button-container');

  buttonContainers.forEach(buttonContainer => {
    const buttonContainerName = buttonContainer.dataset.name.toLowerCase();
    if (buttonContainerName.includes(filterValue)) {
      buttonContainer.style.display = ''; // Show buttonContainer
    } else {
      buttonContainer.style.display = 'none'; // Hide buttonContainer
    }
  });
}

/**
 * Updates the background style of the volume slider to reflect the current
 * volume level using a linear gradient. The filled part represents the
 * volume level, while the unfilled part shows the remaining range.
 */
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

// Event Listeners

// Add an input event listener to the filter, debounced to reduce unnecessary calls
filter.addEventListener('input', debounce(filterButtons, 300));

// Add an input event listener to the volume slider to update the volume background
// and set the current audio volume when the slider value changes
volume.addEventListener('input', () => {
  updateVolumeBackground();
  setVolume(globalState.currentAudio);
});

// Add a mousemove event listener to the volume slider to display the tooltip
// showing the current volume percentage, positioning it based on mouse cursor location
volume.addEventListener('mousemove', (e) => {
  tooltip.classList.add("display-tooltip");
  tooltip.textContent = `Volume: ${volume.value}%`;

  // Get the width of the volume slider and the midpoint
  const volumeRect = volume.getBoundingClientRect();
  const volumeMidpoint = volumeRect.left + volumeRect.width / 2;

  if (e.clientX > volumeMidpoint) {
    // If mouse is on the right half of the slider, position tooltip on the left of the cursor
    tooltip.style.left = `${e.pageX - tooltip.offsetWidth - TOOLTIP_OFFSET_X }px`; // Offset to the left of the cursor
  } else {
    // If mouse is on the left half of the slider, position tooltip on the right of the cursor
    tooltip.style.left = `${e.pageX + TOOLTIP_OFFSET_X }px`; // Offset to the right of the cursor
  }

  tooltip.style.top = `${e.pageY - TOOLTIP_OFFSET_Y }px`; // Offset above cursor
});

// Hide the tooltip when the mouse leaves the slider
volume.addEventListener('mouseleave', () => {
  tooltip.classList.remove("display-tooltip");
});

// Add a click event listener to the remove button to toggle delete mode
removeButton.addEventListener('click', toggleButtonDelete);

// Add a click event listener to the add button to open the modal for adding a new button
addButton.addEventListener('click', openAddButtonModal);

// Initial execution

// Update the volume background to match the current volume slider value
updateVolumeBackground();

// Fetch the button data from a JSON file and create buttons based on the retrieved data
fetch('/buttons.json')
.then(result => result.json())
.then(buttons => {
  if(buttons.length > 0) {
    buttons.forEach(buttonObj => createButton(buttonObj));
  }
})
.catch(err => {
  console.log(err);
  showError("Could not load default buttons");
});
