// Imports
import { openDatabase, addSound, getAllSounds } from "./scripts/storage.js";
import { debounce, showError, createHtmlElement } from "./scripts/utils.js";

// Constants

const TOOLTIP_OFFSET_X = 10;
const TOOLTIP_OFFSET_Y = 40;

// HTML Elements

const elements = {
  filter: document.querySelector('#filter'),
  errorText: document.querySelector('.error-text'),
  volume: document.querySelector('#volume'),
  buttonsContainer: document.querySelector('#buttonsContainer'),
  tooltip: document.querySelector('#tooltip'),
  removeButton: document.querySelector('#removeButton'),
  addButton: document.querySelector('#addButton'),
};

// Global State Variables

const globalState = {
  isSoundPlaying: false,
  currentAudio: null,
  isDeleteModeOn: false,
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
  elements.addButton.disabled = true;

  const modalBackdrop = createHtmlElement("div", {
    attributes: { class: "add-button-modal-backdrop" },
    eventListeners: {
      click: () => {
        closeAddButtonModal(modalContainer, modalBackdrop);
        elements.addButton.disabled = false;
      },
    },
  });

  const modalCloseButton = createHtmlElement("button", {
    attributes: { class: "add-button-modal-close-btn" },
    children: ["X"],
    eventListeners: {
      click: () => {
        closeAddButtonModal(modalContainer, modalBackdrop);
        elements.addButton.disabled = false;
      },
    },
  });

  const soundNameInput = createHtmlElement("input", {
    attributes: {
      class: "add-button-sound-name-input",
      type: "text",
      placeholder: "Sound Name",
    },
  });

  const soundFileLabel = createHtmlElement("label", {
    attributes: {
      class: "add-button-sound-file-label",
      type: "file",
      for: "sound-file-input"
    },
    children: ["Choose a file"],
  });

  const soundFileInput = createHtmlElement("input", {
    attributes: {
      class: "add-button-sound-file-input",
      type: "file",
      id: "sound-file-input"
    },
  });

  const messageContainer = createHtmlElement("div", {
    attributes: { class: "add-button-message-container" },
  });

  const formSubmitBtn = createHtmlElement("button", {
    attributes: {
      class: "add-button-submit-btn",
      type: "button",
    },
    children: ["Add Sound"],
    eventListeners: {
      click: (event) => {
        event.preventDefault();

        const soundName = soundNameInput.value.trim();
        const soundFile = soundFileInput.files[0]; // Access the first file

        // Reset message container
        messageContainer.textContent = "";
        messageContainer.classList.remove("success", "error");

        // Validate the sound name
        if (!soundName || (soundName.length < 2 && soundName.length > 15)) {
          messageContainer.textContent = "The sound name must be between 2 and 15 characters long.";
          messageContainer.classList.add("error");
          return;
        }

        // Validate the file input
        if (!soundFile) {
          messageContainer.textContent = "Please select a sound file.";
          messageContainer.classList.add("error");
          return;
        }

        // Check file type
        const validFileTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
        if (!validFileTypes.includes(soundFile.type)) {
          messageContainer.textContent = "Unsupported file type. Please upload an MP3, WAV, or OGG file.";
          messageContainer.classList.add("error");
          return;
        }

        // Use FileReader to read the file data
        const reader = new FileReader();
        reader.onload = (fileEvent) => {
          const fileData = fileEvent.target.result; // Base64 encoded file data

          // Save the sound to IndexedDB
          addSound({ name: soundName, soundPath: fileData })
            .then(() => {
              messageContainer.textContent = "Sound added successfully!";
              messageContainer.classList.add("success");
            })
            .catch((error) => {
              console.error("Error adding sound:", error);
              messageContainer.textContent = "Failed to add sound. Please try again.";
              messageContainer.classList.add("error");
            });
        };

        reader.readAsDataURL(soundFile); // Convert the file to a Base64 string
      },
    },
  });

  const form = createHtmlElement("form", {
    attributes: { class: "add-button-form" },
    children: [
      soundNameInput, 
      soundFileLabel, 
      soundFileInput, 
      formSubmitBtn, 
      messageContainer
    ],
  });

  const modal = createHtmlElement("div", {
    attributes: { class: "add-button-modal" },
    children: [modalCloseButton, form],
  });

  const modalContainer = createHtmlElement("div", {
    attributes: { class: "add-button-modal-container" },
    children: [modal],
  });

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

  elements.removeButton.textContent = globalState.isDeleteModeOn ? "Cancel" : "Remove Button"

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
  const currentVolume = elements.volume.value;
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
  const button = createHtmlElement("button", {
    attributes: {
      name: buttonObj.name.replace(" ", ""),
      "data-name": buttonObj.name,
      "aria-label": `Play Sound for "${buttonObj.name}" button`,
      class: "button",
    },
    children: [buttonObj.name],
    eventListeners: {
      click: () => {
        if (globalState.isSoundPlaying) return;

        globalState.isSoundPlaying = true;
        button.disabled = true;

        const sound = new Audio(buttonObj.soundPath);
        setVolume(globalState.currentAudio);
        sound.play();
        globalState.currentAudio = sound;

        sound.addEventListener("ended", () => {
          globalState.isSoundPlaying = false;
          button.disabled = false;
          globalState.currentAudio = null;
        });
      },
    },
  });

  // const deleteBtnText = createHtmlElement("span", {
  //   children: ["X"],
  // });

  const deleteBtn = createHtmlElement("button", {
    attributes: {
      class: "delete-btn",
      "data-name": buttonObj.name,
      "aria-label": `Delete "${buttonObj.name}" button`,
    },
    children: [createHtmlElement("span", { children: ["X"] })], // deleteBtnText
    eventListeners: {
      click: () => handleDeleteButtonClick,
    },
  });

  const buttonContainer = createHtmlElement("div", {
    attributes: {
      "data-name": buttonObj.name,
      class: "button-container",
    },
    children: [button, deleteBtn],
  });

  elements.buttonsContainer.appendChild(buttonContainer);
}

/**
 * Filters the button containers based on the input value from the filter.
 * Only shows button containers that include the filter value in their name.
 */
function filterButtons() {
  const filterValue = elements.filter.value.toLowerCase();
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
  const value = elements.volume.value;
  const min = elements.volume.min || 0;
  const max = elements.volume.max || 100;

  // Calculate the percentage of the slider's current value
  const percentage = ((value - min) / (max - min)) * 100;

  // keep the dark blue at 5 percent to prevent color changing to the left of slider ball
  const adjustedPercentage = percentage <= 5 ? 5 : percentage;

  // Apply the background using a linear gradient to show the filled part and unfilled part
  elements.volume.style.background = `linear-gradient(to right, #062E6F ${adjustedPercentage}%, #A8C7FA ${adjustedPercentage}%)`;
}

// Event Listeners

// Add an input event listener to the filter, debounced to reduce unnecessary calls
elements.filter.addEventListener('input', debounce(filterButtons, 300));

// Add an input event listener to the volume slider to update the volume background
// and set the current audio volume when the slider value changes
elements.volume.addEventListener('input', () => {
  updateVolumeBackground();
  setVolume(globalState.currentAudio);
});

// Add a mousemove event listener to the volume slider to display the tooltip
// showing the current volume percentage, positioning it based on mouse cursor location
elements.volume.addEventListener('mousemove', (e) => {
  elements.tooltip.classList.add("display-tooltip");
  elements.tooltip.textContent = `Volume: ${elements.volume.value}%`;

  // Get the width of the volume slider and the midpoint
  const volumeRect = elements.volume.getBoundingClientRect();
  const volumeMidpoint = volumeRect.left + volumeRect.width / 2;

  if (e.clientX > volumeMidpoint) {
    // If mouse is on the right half of the slider, position tooltip on the left of the cursor
    elements.tooltip.style.left = `${e.pageX - elements.tooltip.offsetWidth - TOOLTIP_OFFSET_X }px`; // Offset to the left of the cursor
  } else {
    // If mouse is on the left half of the slider, position tooltip on the right of the cursor
    elements.tooltip.style.left = `${e.pageX + TOOLTIP_OFFSET_X }px`; // Offset to the right of the cursor
  }

  elements.tooltip.style.top = `${e.pageY - TOOLTIP_OFFSET_Y }px`; // Offset above cursor
});

// Hide the tooltip when the mouse leaves the slider
elements.volume.addEventListener('mouseleave', () => {
  elements.tooltip.classList.remove("display-tooltip");
});

// Add a click event listener to the remove button to toggle delete mode
elements.removeButton.addEventListener('click', toggleButtonDelete);

// Add a click event listener to the add button to open the modal for adding a new button
elements.addButton.addEventListener('click', openAddButtonModal);

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
  showError("Could not load default buttons", elements.errorText);
});
