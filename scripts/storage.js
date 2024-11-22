// indexDb functions

/**
 * Open or create the IndexedDB.
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ClickTunesDB", 1);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create an object store if it doesn't exist
      if (!db.objectStoreNames.contains("Sounds")) {
        db.createObjectStore("Sounds", { keyPath: "id", autoIncrement: true }); // automatically generated id
      }
    };
  });
}

/**
 * Add a sound to the database.
 * @param {Object} sound - The sound object to store. It should contain `name` and `soundPath`.
 * @returns {Promise<void>}
 */
export function addSound(sound) {
  // Ensure that the sound object contains `name` and `soundPath`
  const soundToSave = {
    name: sound.name, // name of the sound
    soundPath: sound.soundPath // path to the sound file
  };

  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("Sounds", "readwrite");
      const store = transaction.objectStore("Sounds");
      const request = store.add(soundToSave);

      request.onsuccess = (event) => resolve(event.target.result); // Get the generated key
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

/**
 * Remove a sound from the database by ID.
 * @param {number} soundId - The ID of the sound to remove
 * @returns {Promise<void>}
 */
export function removeSound(soundId) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("Sounds", "readwrite");
      const store = transaction.objectStore("Sounds");
      const request = store.delete(soundId);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  });
}

/**
 * Retrieve all sounds from the database.
 * @returns {Promise<Array>}
 */
export function getAllSounds() {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("Sounds", "readonly");
      const store = transaction.objectStore("Sounds");
      const request = store.getAll();

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  });
}