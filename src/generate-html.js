/**
 * Diablo II (.d2s) Save File Reader / Parser
 * Generates a static index.html report instead of console output.
 * Scans the saves/ directory: every save whose filename doesn't start with
 * "mule" gets its own character tab, and a combined "Runes" tab aggregates
 * rune counts across ALL save files (characters and mules alike).
 *
 * Usage:
 *   node src/generate-html.js
 */

const fs = require('fs');
const path = require('path');

const { parseHeader } = require('./headerParser');
const { parseStats } = require('./statsParser');
const { parseSkills } = require('./skillParser');
const { parseQuests } = require('./questParser');
const { parseWaypoints } = require('./waypointParser');
const { parseItems } = require('./itemParser');
const { RUNEWORDS } = require('./runewords');

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

function socketedSuffix(socketedItems) {
  if (!socketedItems || !socketedItems.length) return '';
  return ` <span class="muted">(${socketedItems.map(s => esc(s.name)).join(', ')})</span>`;
}

function renderEquipped(equippedItems) {
  const rows = equippedItems.length
    ? equippedItems.map(it => `
        <tr>
          <td class="slot">${esc(it.slotName)}</td>
          <td class="highlight">${esc(it.name)}${socketedSuffix(it.socketedItems)}</td>
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
      // Count every rune the file has, whether it's sitting in the stash or
      // socketed into gear — this total is independent of the per-character
      // inventory display, which folds socketed runes into their host item.
      itemData.items.filter(it => it.type === 'Rune').forEach(it => {
        if (!runeCounts[it.name]) runeCounts[it.name] = { count: 0, level: it.level };
        runeCounts[it.name].count += 1;
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

function renderRunewordsTab(runewords, runeCounts) {
  const byCategory = {};
  runewords.forEach(rw => {
    if (!byCategory[rw.category]) byCategory[rw.category] = [];
    byCategory[rw.category].push(rw);
  });

  const categories = Object.keys(byCategory).sort();

  const blocks = categories.map(category => {
    const rows = byCategory[category]
      .slice()
      .sort((a, b) => a.clvlRequired - b.clvlRequired || a.name.localeCompare(b.name))
      .map(rw => {
        const runesHtml = rw.runes
          .map(r => {
            const owned = !!(runeCounts && runeCounts[`${r.name} Rune`]);
            const cls = owned ? 'rune-owned' : 'muted';
            return `${runeIcon(r.name, r.level)}<span class="${cls}">${esc(r.name)} (${r.level})</span>`;
          })
          .join(' <span class="muted">+</span> ');
        const statsHtml = rw.stats.map(s => esc(s)).join('<br>');
        return `
        <tr>
          <td class="highlight">${esc(rw.name)}</td>
          <td class="rune-seq">${runesHtml}</td>
          <td>${rw.sockets}</td>
          <td>${rw.clvlRequired}</td>
          <td class="muted">${statsHtml}</td>
        </tr>`;
      }).join('');

    return `
        <div class="category">
          <h3>${esc(category)} <span class="muted">(${byCategory[category].length})</span></h3>
          <table class="data-table runeword-table">
            <thead><tr><th>Runeword</th><th>Runes</th><th>Sockets</th><th>Clvl</th><th>Stats</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
  }).join('');

  return `
      <h2>📜 Runewords (Non-Ladder, Classic v1.09&ndash;1.14b)</h2>
      <p class="muted">${runewords.length} runewords across ${categories.length} item categories. Ladder-only runewords are excluded since they can't be created in classic single-player LoD.</p>
      ${blocks}`;
}

function renderInventory(groupedByCategory, socketedInstances = []) {
  const instancesByCategory = {};
  socketedInstances.forEach(inst => {
    if (!instancesByCategory[inst.category]) instancesByCategory[inst.category] = [];
    instancesByCategory[inst.category].push(inst);
  });

  const categories = Array.from(new Set([...Object.keys(groupedByCategory), ...Object.keys(instancesByCategory)])).sort();

  const blocks = categories.map(category => {
    const entries = Object.entries(groupedByCategory[category] || {}).sort(([nameA, a], [nameB, b]) => {
      if (a.level != null && b.level != null) return b.level - a.level;
      return nameA.localeCompare(nameB);
    });
    const items = entries.map(([name, { count, level }]) => {
      const icon = category === 'Rune' ? runeIcon(name, level) : '';
      return `
          <li>${icon}<span class="item-label"><span class="highlight">${esc(name)}</span>${level != null ? ` <span class="muted">(Lvl ${level})</span>` : ''}</span> <span class="count">x${count}</span></li>`;
    }).join('');

    const socketedItems = (instancesByCategory[category] || [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(inst => `
          <li><span class="item-label"><span class="highlight">${esc(inst.name)}</span>${socketedSuffix(inst.socketedItems)}</span></li>`)
      .join('');

    return `
        <div class="category">
          <h3>${esc(category)}</h3>
          <ul class="item-list">${items}${socketedItems}</ul>
        </div>`;
  }).join('');

  return `
      <h2>🎒 Item Inventory Overview</h2>
      <div class="category-grid">${blocks}</div>`;
}

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'character';
}

function renderCharacterPanel(fileName, buf) {
  const header = parseHeader(buf);
  const stats = parseStats(buf);
  const skills = parseSkills(buf, header.classId);
  const quests = parseQuests(buf);
  const waypoints = parseWaypoints(buf);
  const itemData = parseItems(buf);

  const content = `
    <div class="grid">
      <section class="card">${renderCharacterSummary(header)}</section>
      <section class="card">${renderStats(stats)}</section>
      <section class="card full">${renderSkills(skills)}</section>
      <section class="card">${renderProgress('Difficulty &amp; Quest Progress', quests, 'Quests')}</section>
      <section class="card">${renderProgress('Waypoints Unlocked', waypoints, 'Waypoints')}</section>
      <section class="card full">${renderEquipped(itemData.equippedItems)}</section>
      <section class="card full">${renderInventory(itemData.groupedByCategory, itemData.socketedInstances)}</section>
    </div>
    <footer>${esc(fileName)} (${buf.length} bytes) &mdash; Total Item Count: ${itemData.totalItems}</footer>`;

  return { name: header.name, content };
}

function generateHtml(savesDir) {
  const files = fs.readdirSync(savesDir).filter(f => f.toLowerCase().endsWith('.d2s'));
  const characterFiles = files.filter(f => !f.toLowerCase().startsWith('mule'));

  const characters = characterFiles.map(file => {
    const buf = fs.readFileSync(path.join(savesDir, file));
    const { name, content } = renderCharacterPanel(file, buf);
    return { file, name, slug: slugify(name), content };
  });

  const { runeCounts, scannedFiles } = aggregateRunesFromAllSaves(savesDir);

  const tabButtons = characters.map((c, i) => `
      <button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${esc(c.slug)}">${esc(c.name)}</button>`).join('');
  const tabPanels = characters.map((c, i) => `
    <div class="tab-panel${i === 0 ? ' active' : ''}" id="tab-${esc(c.slug)}">${c.content}
    </div>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Diablo II Save Report</title>
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
  table.runeword-table { margin-bottom: 1.5rem; }
  table.runeword-table td { vertical-align: top; }
  .rune-seq img.rune-icon { display: inline-block; vertical-align: middle; margin-right: 2px; }
  .rune-owned { color: #4caf50; font-weight: 600; }
</style>
</head>
<body>
  <div class="page">
    <header class="title-bar">
      <h1>DIABLO II SAVE FILE PARSER</h1>
      <p>${characters.length} character${characters.length === 1 ? '' : 's'} &middot; ${scannedFiles.length} save file${scannedFiles.length === 1 ? '' : 's'} scanned</p>
    </header>
    <div class="tabs">${tabButtons}
      <button class="tab-btn" data-tab="runes">Runes</button>
      <button class="tab-btn" data-tab="runewords">Runewords</button>
    </div>${tabPanels}
    <div class="tab-panel" id="tab-runes">
    <div class="grid">
      <section class="card full">${renderRunesTab(runeCounts, scannedFiles)}</section>
    </div>
    </div>
    <div class="tab-panel" id="tab-runewords">
    <div class="grid">
      <section class="card full">${renderRunewordsTab(RUNEWORDS, runeCounts)}</section>
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
const projectRoot = path.join(__dirname, '..');
const savesDir = path.join(projectRoot, 'saves');
const outputFile = path.join(projectRoot, 'index.html');

if (!fs.existsSync(savesDir)) {
  console.error(`Error: Saves directory not found at ${savesDir}`);
  process.exit(1);
}

const html = generateHtml(savesDir);
fs.writeFileSync(outputFile, html);
console.log(`Report written to ${outputFile}`);
console.log(`Open it with: open ${outputFile}`);
