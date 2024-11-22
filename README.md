# ClickTunes

This browser extension gives you a fun tool to add custom sounds for different situations. For example, you can add an "awww" sound for when something goes wrong or any other sound you'd like for specific moments. The following instructions will guide you through the process of installing it manually.

## Prerequisites

- A modern web browser like **Google Chrome**, or Chromium-based browsers like **Microsoft Edge**, **Opera**.
- Basic familiarity with installing extensions in browsers.

## Steps to Install the Extension

### 1. Download the ZIP File

- Visit the [GitHub repository](https://github.com/jayzpkz/ClickTunes) and download the ZIP file of the extension.

### 2. Extract the ZIP File

- Once the ZIP file is downloaded, extract it to a folder on your computer. This will create a folder containing the extension's files, including the `manifest.json` file, icons, and other necessary assets.

### 3. Install the Extension in Your Browser

#### For Google Chrome (and Chromium-based browsers like Microsoft Edge, Opera):

1. Open **Chrome** and go to `chrome://extensions/` in the browser's address bar.
2. Enable **Developer mode** (top-right corner).
3. Click the **Load unpacked** button.
4. Select the folder where you extracted the ZIP file.
5. The extension will now be installed and active in your browser. You should see the extension icon in your browser’s toolbar.

### 4. Using the Extension

- Once the extension is installed, you can use it by clicking the extension icon in your browser’s toolbar.
- The extension provides a **search/filter bar** to help you find sounds by name quickly.
- **Click the circle button** to play the selected sound.
- At the bottom of the extension, you'll find a **volume control** slider that lets you adjust the sound's volume.
- The **Delete button** enables **edit mode**, where you can delete sound buttons by clicking the "X" next to them. Note that the default buttons cannot be deleted.
- To **add your own sounds**, click the **Add button**. You'll be prompted to provide a name and upload a sound file in one of the following formats: `.mpeg`, `.wav`, `.ogg`.
- The new sound buttons you create are saved **locally** in the browser's **IndexedDB**. They will persist until the browser data is cleared or the database is removed via the extension's Developer Tools.

Enjoy customizing your sound experience with this extension!

### 5. Updating the Extension

- To update the extension, simply download the latest version from the GitHub repository and repeat the installation steps above (replacing the old version).

### 6. Uninstalling the Extension

If you want to remove the extension from your browser:

- Go to the **Extensions** page (`chrome://extensions/`, `about:debugging`, or `edge://extensions/`).
- Find the extension and click **Remove** or **Disable**.

## Troubleshooting

- **The extension doesn't show up after installation**: Make sure you're following the correct steps for your browser, and ensure that the extension is enabled in your browser settings.
- **The extension doesn't work as expected**: Check the browser's developer console for any errors. If you find any issues, feel free to open an issue on the GitHub repository.

## All Rights Reserved

All rights to this project are reserved by Arie Fishman. This extension may not be copied, distributed, or modified without permission.
