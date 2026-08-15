/**
 * Cross-platform native folder-picker dialog.
 * Shells out to the OS's own picker — no GUI framework dependency.
 *   - Windows: PowerShell's System.Windows.Forms.FolderBrowserDialog
 *   - macOS:   AppleScript's "choose folder"
 * Returns the chosen absolute path, or null if the user canceled.
 */

const { execFileSync } = require('child_process');

function pickFolderWindows(promptTitle) {
  const script = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "${promptTitle.replace(/"/g, '""')}"
$dialog.ShowNewFolderButton = $false
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $dialog.SelectedPath
}
`;
  const result = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8' });
  const picked = result.trim();
  return picked || null;
}

function pickFolderMac(promptTitle) {
  const script = `POSIX path of (choose folder with prompt "${promptTitle.replace(/"/g, '\\"')}")`;
  try {
    const result = execFileSync('osascript', ['-e', script], { encoding: 'utf8' });
    const picked = result.trim();
    return picked || null;
  } catch (err) {
    if (/User canceled/i.test(err.message) || /-128/.test(err.message)) return null;
    throw err;
  }
}

function pickFolder(promptTitle = 'Select a folder') {
  if (process.platform === 'win32') return pickFolderWindows(promptTitle);
  if (process.platform === 'darwin') return pickFolderMac(promptTitle);
  throw new Error(
    `Folder picker not supported on platform "${process.platform}". ` +
    'Pass the folder path directly as a command-line argument instead.'
  );
}

module.exports = { pickFolder };
