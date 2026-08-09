/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Generates a static index.html report instead of console output.
 *
 * Usage:
 *   node src/generate-html.js
 *   node src/generate-html.js saves/Amazonka.d2s
 */

const fs = require('fs');
const path = require('path');

const { parseHeader } = require('./headerParser');
const { parseStats } = require('./statsParser');
const { parseSkills } = require('./skillParser');
const { parseQuests } = require('./questParser');
const { parseWaypoints } = require('./waypointParser');
const { parseItems } = require('./itemParser');

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderCharacterSummary(header) {
  return `
      <h2>Character Summary</h2>
      <dl class="kv">
        <dt>Name</dt><dd class="highlight">${esc(header.name)}</dd>
        <dt>Class</dt><dd class="gold">${esc(header.className)}</dd>
        <dt>Level</dt><dd class="highlight">${esc(header.level)}</dd>
        <dt>Title</dt><dd class="magic">${esc(header.title)}</dd>
        <dt>Expansion (LoD)</dt><dd>${header.isExpansion ? 'Yes' : 'No'}</dd>
        <dt>Mode</dt><dd class="${header.isHardcore ? 'unique' : ''}">${header.isHardcore ? 'Hardcore' : 'Softcore'}</dd>
        <dt>Has Died</dt><dd>${header.hasDied ? 'Yes' : 'No'}</dd>
        <dt>Version ID</dt><dd>${esc(header.version)} (0x${header.version.toString(16)})</dd>
        <dt>Last Played</dt><dd>${esc(header.lastPlayedDate)}</dd>
      </dl>`;
}

function renderStats(stats) {
  return `
      <h2>Base &amp; Total Attributes</h2>
      <dl class="kv">
        <dt>Strength</dt><dd>${esc(stats.strength)}</dd>
        <dt>Dexterity</dt><dd>${esc(stats.dexterity)}</dd>
        <dt>Energy</dt><dd>${esc(stats.energy)}</dd>
        <dt>Hit Points</dt><dd class="hp">${esc(stats.hpCurrent)} / ${esc(stats.hpMax)} HP</dd>
        <dt>Mana</dt><dd class="mana">${esc(stats.manaCurrent)} / ${esc(stats.manaMax)} MP</dd>
        <dt>Stamina</dt><dd>${esc(stats.staminaCurrent)} / ${esc(stats.staminaMax)}</dd>
        <dt>Experience</dt><dd>${stats.exp.toLocaleString()} XP</dd>
        <dt>Gold</dt><dd class="gold">${stats.goldInventory.toLocaleString()} (Inv) + ${stats.goldStash.toLocaleString()} (Stash) = ${stats.goldTotal.toLocaleString()} Total</dd>
        <dt>Unassigned</dt><dd class="gold">${esc(stats.freeStatPts)} Stat Points | ${esc(stats.freeSkillPts)} Skill Points</dd>
      </dl>`;
}

function renderSkills(skills) {
  const rows = skills.allocatedSkills.map(sk => `
        <tr><td>${esc(sk.name)}</td><td class="muted">${esc(sk.tree)}</td><td class="highlight">${esc(sk.level)}</td></tr>`).join('');
  return `
      <h2>Skill Allocation</h2>
      <table class="data-table">
        <thead><tr><th>Skill</th><th>Tree</th><th>Level</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="muted">Total Invested Skill Points: <span class="highlight">${esc(skills.pointsSpent)}</span></p>`;
}

function renderProgress(title, data, unitLabel) {
  const rows = Object.entries(data).map(([diff, d]) => `
        <tr><td>${esc(diff)}</td><td>${esc(d.completed ?? d.unlocked)} / ${esc(d.total)} ${unitLabel}</td></tr>`).join('');
  return `
      <h2>${esc(title)}</h2>
      <table class="data-table">
        <tbody>${rows}</tbody>
      </table>`;
}

function renderEquipped(equippedItems) {
  const rows = equippedItems.length
    ? equippedItems.map(it => `
        <tr>
          <td class="slot">${esc(it.slotName)}</td>
          <td class="highlight">${esc(it.name)}</td>
          <td class="quality-${esc(it.quality.toLowerCase())}">${esc(it.quality)}</td>
          <td class="muted">${esc(it.type)}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" class="muted">No gear equipped in active slots</td></tr>`;
  return `
      <h2>🛡️ Equipped Gear</h2>
      <table class="data-table">
        <thead><tr><th>Slot</th><th>Item</th><th>Quality</th><th>Type</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
}

// Rune icon image, keyed by rune level (1-33), stored as src/img/runes/r01.gif .. r33.gif
function runeIcon(name, level) {
  if (level == null) return '';
  const code = `r${String(level).padStart(2, '0')}`;
  return `<img class="rune-icon" src="src/img/runes/${code}.gif" alt="${esc(name)}" width="26" height="28">`;
}

// Scans every .d2s file in the saves directory and sums up rune counts across all of them
function aggregateRunesFromAllSaves(savesDir) {
  const files = fs.readdirSync(savesDir).filter(f => f.toLowerCase().endsWith('.d2s'));
  const runeCounts = {};
  const scannedFiles = [];

  files.forEach(file => {
    try {
      const buf = fs.readFileSync(path.join(savesDir, file));
      const itemData = parseItems(buf);
      scannedFiles.push(file);
      const runes = itemData.groupedByCategory['Rune'];
      if (!runes) return;
      Object.entries(runes).forEach(([name, { count, level }]) => {
        if (!runeCounts[name]) runeCounts[name] = { count: 0, level };
        runeCounts[name].count += count;
      });
    } catch (e) {
      // Skip files that fail to parse
    }
  });

  return { runeCounts, scannedFiles };
}

function renderRunesTab(runeCounts, scannedFiles) {
  const entries = Object.entries(runeCounts).sort(([, a], [, b]) => b.level - a.level);
  const totalRunes = entries.reduce((sum, [, d]) => sum + d.count, 0);
  const rows = entries.map(([name, { count, level }]) => `
        <li>${runeIcon(name, level)}<span class="item-label"><span class="highlight">${esc(name)}</span> <span class="muted">(Lvl ${level})</span></span><span class="count">x${count}</span></li>`).join('');

  return `
      <h2>💎 Runes (All Saves Combined)</h2>
      <ul class="item-list rune-list">${rows || '<li class="muted">No runes found across any save files</li>'}</ul>
      <p class="muted">Total Runes: <span class="highlight">${totalRunes}</span></p>
      <p class="muted">Scanned Files: ${scannedFiles.map(esc).join(', ')}</p>`;
}

function renderInventory(groupedByCategory) {
  const categories = Object.keys(groupedByCategory).sort();
  const blocks = categories.map(category => {
    const entries = Object.entries(groupedByCategory[category]).sort(([nameA, a], [nameB, b]) => {
      if (a.level != null && b.level != null) return b.level - a.level;
      return nameA.localeCompare(nameB);
    });
    const items = entries.map(([name, { count, level }]) => {
      const icon = category === 'Rune' ? runeIcon(name, level) : '';
      return `
          <li>${icon}<span class="item-label"><span class="highlight">${esc(name)}</span>${level != null ? ` <span class="muted">(Lvl ${level})</span>` : ''}</span> <span class="count">x${count}</span></li>`;
    }).join('');
    return `
        <div class="category">
          <h3>${esc(category)}</h3>
          <ul class="item-list">${items}</ul>
        </div>`;
  }).join('');

  return `
      <h2>🎒 Item Inventory Overview</h2>
      <div class="category-grid">${blocks}</div>`;
}

function generateHtml(filePath) {
  const buf = fs.readFileSync(filePath);

  const header = parseHeader(buf);
  const stats = parseStats(buf);
  const skills = parseSkills(buf, header.classId);
  const quests = parseQuests(buf);
  const waypoints = parseWaypoints(buf);
  const itemData = parseItems(buf);

  const savesDir = path.join(__dirname, '..', 'saves');
  const { runeCounts, scannedFiles } = fs.existsSync(savesDir)
    ? aggregateRunesFromAllSaves(savesDir)
    : { runeCounts: {}, scannedFiles: [] };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(header.name)} - Diablo II Save Report</title>
<style>
  :root {
    --bg: #16130f;
    --card-bg: #1f1a14;
    --border: #3a2f22;
    --text: #d8cdb8;
    --muted: #8c8271;
    --highlight: #f2c94c;
    --gold: #e0a72d;
    --magic: #6b8cff;
    --hp: #d24b4b;
    --mana: #4b7bd2;
    --unique: #c9a227;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2rem 1rem 4rem;
    background: radial-gradient(ellipse at top, #221c15, var(--bg));
    color: var(--text);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .page {
    max-width: 960px;
    margin: 0 auto;
  }
  header.title-bar {
    text-align: center;
    margin-bottom: 2rem;
  }
  header.title-bar h1 {
    color: var(--highlight);
    letter-spacing: 0.08em;
    margin-bottom: 0.25rem;
    font-size: 1.6rem;
  }
  header.title-bar p {
    color: var(--muted);
    margin: 0;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.25rem;
  }
  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
  }
  .card.full { grid-column: 1 / -1; }
  h2 {
    margin-top: 0;
    font-size: 1.05rem;
    color: var(--highlight);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }
  h3 {
    color: var(--gold);
    font-size: 0.95rem;
    margin: 0 0 0.4rem;
  }
  dl.kv {
    display: grid;
    grid-template-columns: auto 1fr;
    row-gap: 0.4rem;
    column-gap: 1rem;
    margin: 0;
  }
  dl.kv dt { color: var(--muted); }
  dl.kv dd { margin: 0; text-align: right; }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  table.data-table th {
    text-align: left;
    color: var(--muted);
    font-weight: 400;
    border-bottom: 1px solid var(--border);
    padding: 0.3rem 0.5rem;
  }
  table.data-table td {
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  td.slot { color: var(--muted); white-space: nowrap; }
  .highlight { color: var(--highlight); font-weight: 600; }
  .gold { color: var(--gold); }
  .magic { color: var(--magic); }
  .hp { color: var(--hp); }
  .mana { color: var(--mana); }
  .unique { color: var(--unique); }
  .muted { color: var(--muted); }
  .quality-unique { color: #c9a227; }
  .quality-set { color: #4caf50; }
  .quality-rare { color: #e8e05a; }
  .quality-crafted { color: #d2914b; }
  .quality-magic { color: var(--magic); }
  .quality-superior, .quality-normal, .quality-inferior { color: var(--text); }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  ul.item-list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.88rem;
  }
  ul.item-list li {
    padding: 0.15rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .item-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }
  .rune-icon {
    flex-shrink: 0;
    display: block;
    image-rendering: pixelated;
  }
  .count { color: var(--muted); }
  footer {
    text-align: center;
    color: var(--muted);
    margin-top: 2rem;
    font-size: 0.8rem;
  }
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  .tab-btn {
    background: none;
    border: none;
    color: var(--muted);
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
    font-family: inherit;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .tab-btn.active {
    color: var(--highlight);
    border-bottom-color: var(--highlight);
  }
  .tab-panel { display: none; }
  .tab-panel.active { display: block; }
  ul.rune-list li { font-size: 0.95rem; padding: 0.3rem 0; }
</style>
</head>
<body>
  <div class="page">
    <header class="title-bar">
      <h1>DIABLO II SAVE FILE PARSER</h1>
      <p>${esc(path.basename(filePath))} (${buf.length} bytes)</p>
    </header>
    <div class="tabs">
      <button class="tab-btn active" data-tab="overview">Overview</button>
      <button class="tab-btn" data-tab="runes">Runes</button>
    </div>
    <div class="tab-panel active" id="tab-overview">
    <div class="grid">
      <section class="card">${renderCharacterSummary(header)}</section>
      <section class="card">${renderStats(stats)}</section>
      <section class="card full">${renderSkills(skills)}</section>
      <section class="card">${renderProgress('Difficulty &amp; Quest Progress', quests, 'Quests')}</section>
      <section class="card">${renderProgress('Waypoints Unlocked', waypoints, 'Waypoints')}</section>
      <section class="card full">${renderEquipped(itemData.equippedItems)}</section>
      <section class="card full">${renderInventory(itemData.groupedByCategory)}</section>
    </div>
    <footer>Total Item Count: ${itemData.totalItems}</footer>
    </div>
    <div class="tab-panel" id="tab-runes">
    <div class="grid">
      <section class="card full">${renderRunesTab(runeCounts, scannedFiles)}</section>
    </div>
    </div>
  </div>
  <script>
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });
  </script>
</body>
</html>`;
}

// CLI Execution
const args = process.argv.slice(2);
const projectRoot = path.join(__dirname, '..');
const targetFile = args[0] || path.join(projectRoot, 'saves', 'Amazonka.d2s');
const outputFile = path.join(projectRoot, 'index.html');

if (!fs.existsSync(targetFile)) {
  console.error(`Error: Save file not found at ${targetFile}`);
  process.exit(1);
}

const html = generateHtml(targetFile);
fs.writeFileSync(outputFile, html);
console.log(`Report written to ${outputFile}`);
console.log(`Open it with: open ${outputFile}`);
