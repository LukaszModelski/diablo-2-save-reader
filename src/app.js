/**
 * Diablo II Save Tool — interactive entry point.
 * Prompts for the saves folder via a native OS folder picker, then runs
 * generate-html and/or merge-gems against it.
 *
 * Usage:
 *   node src/app.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { exec } = require("child_process");

const { pickFolder } = require("./folderPicker");
const { main: generateHtmlMain } = require("./generate-html");
const { run: mergeGemsRun } = require("./merge-gems");
const { run: sortRunesRun } = require("./sort-runes");

const PROJECT_ROOT = path.join(__dirname, "..");
const LAST_FOLDER_FILE = path.join(PROJECT_ROOT, ".last-saves-folder");

function readLastFolder() {
  try {
    const saved = fs.readFileSync(LAST_FOLDER_FILE, "utf8").trim();
    return saved && fs.existsSync(saved) ? saved : null;
  } catch (err) {
    return null;
  }
}

function saveLastFolder(folder) {
  try {
    fs.writeFileSync(LAST_FOLDER_FILE, folder);
  } catch (err) {
    console.log("Could not remember this folder for next time:", err.message);
  }
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    }),
  );
}

function openInBrowser(filePath) {
  const cmd =
    process.platform === "darwin"
      ? `open "${filePath}"`
      : process.platform === "win32"
        ? `start "" "${filePath}"`
        : `xdg-open "${filePath}"`;
  exec(cmd, (err) => {
    if (err) console.log("Could not auto-open the report:", err.message);
  });
}

async function main() {
  console.log("=== Diablo II Save Tool ===\n");

  const lastFolder = readLastFolder();
  const folder = pickFolder("Select your Diablo II saves folder", lastFolder);
  if (!folder) {
    console.log("No folder selected — exiting.");
    return;
  }
  console.log("Using folder:", folder, "\n");
  saveLastFolder(folder);

  const saveFileCount = fs
    .readdirSync(folder)
    .filter((f) => f.toLowerCase().endsWith(".d2s")).length;
  if (saveFileCount === 0) {
    console.log(
      `No Diablo II save files (.d2s) found in "${folder}". Pick a different folder and try again.`,
    );
    return;
  }

  const choice = await ask(
    "What would you like to do?\n" +
      "  1) Generate save report (characters, items, runes, runewords)\n" +
      "  2) Sort runes (scans all characters and sorts loose runes, highest level first, into 'Mule-runes', then 'mule-runess', then 'mule-runesss')\n" +
      "  3) Merge gems (scans all characters and places gems in 'mule-gems' characters)\n" +
      "  0) Exit\n" +
      "Enter choice: ",
  );

  if (choice === "2") {
    console.log("\n--- Sorting runes ---");
    sortRunesRun(folder);
  }

  if (choice === "3") {
    console.log("\n--- Merging gems ---");
    mergeGemsRun(folder);
  }

  if (choice === "1") {
    console.log("\n--- Generating report ---");
    const outputFile = path.join(PROJECT_ROOT, "index.html");
    generateHtmlMain(folder, outputFile);
    console.log("Opening report in browser...");
    openInBrowser(outputFile);
  }

  if (!["0", "1", "2", "3"].includes(choice)) {
    console.log("Unrecognized choice — exiting without doing anything.");
  }
}

main()
  .catch((err) => {
    console.error("\nError:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await ask("\nPress Enter to exit...");
  });
