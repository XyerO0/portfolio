/**
 * Debanjan (Xyero.Dev) - Minimal Terminal Portfolio Scripts
 * Handles theme switcher, interactive console, and live GitHub repository synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTerminal();
  initGitHubSync();
  initDynamicGrid();
});

/* ==========================================================================
   1. Theme System (7 Cult-Classic Hacker/Terminal Themes)
   Supported: gruvbox (default), arch, catppuccin, nord, tokyonight, dracula, matrix
   ========================================================================== */
const AVAILABLE_THEMES = [
  'gruvbox',
  'arch',
  'catppuccin',
  'nord',
  'tokyonight',
  'dracula',
  'matrix'
];

function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('site_theme');
  const initialTheme = (saved && AVAILABLE_THEMES.includes(saved)) ? saved : 'gruvbox';
  applyTheme(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'gruvbox';
      const currentIndex = AVAILABLE_THEMES.indexOf(current);
      const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
      const nextTheme = AVAILABLE_THEMES[nextIndex];
      applyTheme(nextTheme);
    });
  }
}

function applyTheme(theme) {
  if (!AVAILABLE_THEMES.includes(theme)) {
    theme = 'gruvbox';
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('site_theme', theme);
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = `theme: ${theme}`;
    const nextIdx = (AVAILABLE_THEMES.indexOf(theme) + 1) % AVAILABLE_THEMES.length;
    toggleBtn.title = `Active: ${theme} (Click to switch to ${AVAILABLE_THEMES[nextIdx]})`;
  }
  if (window.updateGridTheme) {
    window.updateGridTheme();
  }
}

/* ==========================================================================
   2. Live GitHub Repository Dynamic Synchronization
   Auto-fetches from https://api.github.com/users/XyerO0/repos
   Updates in real-time when repositories are created or deleted!
   ========================================================================== */
let activeReposList = [
  { name: 'portfolio', html_url: 'https://github.com/XyerO0/portfolio', description: 'Personal developer portfolio website engineered with a terminal aesthetic and live GitHub sync.' },
  { name: 'projectAlpha', html_url: 'https://github.com/XyerO0/projectAlpha', description: 'Initial software development project exploring programming fundamentals and code structure.' }
];

function initGitHubSync() {
  const grid = document.getElementById('projectsGrid');
  const statusText = document.getElementById('syncStatusText');
  const syncBtn = document.getElementById('manualSyncBtn');
  const username = 'XyerO0';

  async function fetchRepos(isManual = false) {
    if (syncBtn) {
      syncBtn.classList.add('syncing');
      syncBtn.textContent = 'syncing...';
    }

    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!res.ok) {
        throw new Error(`GitHub API HTTP ${res.status}`);
      }

      const repos = await res.json();
      if (Array.isArray(repos) && repos.length > 0) {
        activeReposList = repos;
        renderProjects(repos, grid);
        if (statusText) {
          statusText.textContent = `live-sync: ${repos.length} repositories`;
        }
        localStorage.setItem('xyero_cached_repos', JSON.stringify(repos));
        localStorage.setItem('xyero_cache_time', Date.now());
      }
    } catch (err) {
      // Fallback: check localStorage cache
      const cached = localStorage.getItem('xyero_cached_repos');
      if (cached) {
        try {
          const cachedRepos = JSON.parse(cached);
          if (Array.isArray(cachedRepos) && cachedRepos.length > 0) {
            activeReposList = cachedRepos;
            renderProjects(cachedRepos, grid);
            if (statusText) {
              statusText.textContent = `cached-sync: ${cachedRepos.length} repositories`;
            }
          }
        } catch (_) {}
      } else if (statusText) {
        statusText.textContent = `live-sync: github.com/${username}`;
      }
    } finally {
      if (syncBtn) {
        syncBtn.classList.remove('syncing');
        syncBtn.textContent = isManual ? 'synced!' : 'sync now';
        if (isManual) {
          setTimeout(() => {
            syncBtn.textContent = 'sync now';
          }, 2000);
        }
      }
    }
  }

  function renderProjects(repos, container) {
    if (!container) return;
    container.innerHTML = '';

    repos.forEach(repo => {
      const card = document.createElement('article');
      card.className = 'project-card';

      const repoName = escapeHtml(repo.name);
      const repoDesc = escapeHtml(repo.description || 'Public repository by XyerO0 on GitHub.');
      const repoUrl = escapeHtml(repo.html_url);
      const isFork = repo.fork;
      const lang = repo.language ? escapeHtml(repo.language) : 'Code';
      const updatedDate = repo.pushed_at ? new Date(repo.pushed_at).toISOString().split('T')[0] : '';

      card.innerHTML = `
        <div class="project-top">
          <h3 class="project-title">${repoName}</h3>
          <span class="project-type">${isFork ? 'Forked Repo' : 'Public Repository'}</span>
        </div>

        <p class="project-summary">${repoDesc}</p>

        <div class="project-tech">
          <span class="tech-chip">${lang}</span>
          ${repo.stargazers_count > 0 ? `<span class="tech-chip">stars: ${repo.stargazers_count}</span>` : ''}
          ${updatedDate ? `<span class="tech-chip">updated: ${updatedDate}</span>` : ''}
        </div>

        <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="project-footer-link">
          <span>view repository on github -></span>
        </a>
      `;

      container.appendChild(card);
    });
  }

  if (syncBtn) {
    syncBtn.addEventListener('click', () => fetchRepos(true));
  }

  // Initial fetch on page load
  fetchRepos(false);
}

/* ==========================================================================
   3. Interactive Terminal Console
   ========================================================================== */
function initTerminal() {
  const form = document.getElementById('termForm');
  const input = document.getElementById('termInput');
  const output = document.getElementById('termOutput');

  if (!form || !input || !output) return;

  const commands = {
    help: () => `available commands:
  about       - profile and focus
  academics   - B.Tech degree, coursework and research focus
  skills      - programming languages and tools
  projects    - technical repositories (live-synced)
  fastfetch   - system information
  theme [opt] - switch or list themes (gruvbox, arch, nord, catppuccin...)
  contact     - email, GitHub, LinkedIn
  clear       - clear output`,

    about: () => `Debanjan (Xyero.Dev)
Computer Science Undergraduate Student.
Focus: Systems Programming, C/C++, Linux, Operating Systems concepts.
Seeking research internships & summer projects across IITs, NITs, and tech labs.`,

    academics: () => `Academics & Research Focus:
Degree:      B.Tech in Computer Science & Engineering
Coursework:  Data Structures & Algorithms, Operating Systems, Computer Architecture, OOP (C++)
Target:      Summer Research Fellowships & Internships (IITs / NITs / GFTIs)`,

    skills: () => `Technical Toolkit:
Languages:   C, C++, Python, Bash
Systems:     Arch Linux (Daily driver), Git, Neovim (LSP), GCC / Make
Core CS:     Data Structures & Algorithms, Operating Systems Concepts
Web Basics:  HTML5, CSS3, JavaScript`,

    projects: () => {
      const lines = activeReposList.map((r, i) => `${i + 1}. ${r.name.padEnd(16)} - ${r.html_url}`);
      return `GitHub Repositories (github.com/XyerO0):\n${lines.join('\n')}`;
    },

    fastfetch: () => `OS:         Arch Linux x86_64
Host:       Debanjan Workstation
Kernel:     Linux (zen/rolling)
Editor:     Neovim
Shell:      bash / zsh
User:       xyero (Debanjan)`,

    theme: (arg) => {
      if (!arg) {
        const current = document.documentElement.getAttribute('data-theme') || 'gruvbox';
        return `Current active theme: ${current}

Available themes:
  * gruvbox     [default] (warm retro dark)
  * arch        (Arch Linux electric cyan)
  * catppuccin  (mocha mauve modern rice)
  * nord        (arctic ice frost)
  * tokyonight  (Tokyo cyberpunk neon)
  * dracula     (vampire purple & pink)
  * matrix      (terminal phosphor green)

Usage: theme <name> (e.g. 'theme nord', 'theme arch')`;
      }

      const target = arg.trim().toLowerCase();
      if (AVAILABLE_THEMES.includes(target)) {
        applyTheme(target);
        return `Theme switched to '${target}'.`;
      }
      return `Unknown theme '${target}'. Available: ${AVAILABLE_THEMES.join(', ')}`;
    },

    contact: () => `Contact & Inquiry:
Email:    debanjanbaidya6@gmail.com
GitHub:   https://github.com/XyerO0
LinkedIn: https://linkedin.com/in/debanjan-baidya-107566373`,

    clear: () => {
      output.textContent = '';
      return '';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (cmd === 'clear') {
      commands.clear();
      input.value = '';
      return;
    }

    const res = commands[cmd]
      ? commands[cmd](arg)
      : `bash: command not found: ${cmd}. Type 'help' for available commands.`;

    output.textContent += (output.textContent ? '\n\n' : '') + `$ ${raw}\n${res}`;
    output.scrollTop = output.scrollHeight;
    input.value = '';
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   4. Microarchitecture Bus & Memory Blueprint (Bespoke Systems Canvas)
   Draws an authentic, low-level hardware blueprint:
   - Major bus conduits every 4 tracks with integrated circuit vias and corner brackets
   - Minor memory matrix with micro-dots & subtle breathing wave
   - Sparse virtual memory offset labels (0x0040, 0x0100...) in monospace
   - Orthogonal PCB trace packets that make 90-degree turns along bus channels
   - Digital logic probe tracking cursor with [0xADDR] HUD tag & crosshair alignment
   - Click bus broadcast wave sending orthogonal trace packets along all 4 vectors
   ========================================================================== */
function initDynamicGrid() {
  const canvas = document.getElementById('bgGridCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Signal CSS that dynamic canvas is running
  document.body.classList.add('canvas-active');

  let width = 0;
  let height = 0;
  let dpr = 1;

  const GRID_SIZE = 48;
  const MAJOR_STEP = 4;
  let cols = 0;
  let rows = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Dynamic theme colors across 7 themes (calibrated for high contrast & subtlety)
  const THEME_GRID_PALETTES = {
    gruvbox: {
      lineMajor: 'rgba(125, 174, 163, 0.16)',
      lineMinor: 'rgba(60, 56, 54, 0.20)',
      dotMinor: 'rgba(168, 153, 132, 0.14)',
      accent: '#7daea3',
      accentLight: '#89bf82',
      accentRgb: [125, 174, 163],
      accentGlow: 'rgba(125, 174, 163, 0.05)'
    },
    arch: {
      lineMajor: 'rgba(23, 147, 209, 0.18)',
      lineMinor: 'rgba(26, 37, 56, 0.20)',
      dotMinor: 'rgba(139, 156, 182, 0.14)',
      accent: '#1793d1',
      accentLight: '#38bdf8',
      accentRgb: [23, 147, 209],
      accentGlow: 'rgba(23, 147, 209, 0.05)'
    },
    catppuccin: {
      lineMajor: 'rgba(203, 166, 247, 0.18)',
      lineMinor: 'rgba(54, 58, 79, 0.22)',
      dotMinor: 'rgba(166, 173, 200, 0.15)',
      accent: '#cba6f7',
      accentLight: '#b4befe',
      accentRgb: [203, 166, 247],
      accentGlow: 'rgba(203, 166, 247, 0.05)'
    },
    nord: {
      lineMajor: 'rgba(136, 192, 208, 0.18)',
      lineMinor: 'rgba(76, 86, 106, 0.20)',
      dotMinor: 'rgba(216, 222, 233, 0.14)',
      accent: '#88c0d0',
      accentLight: '#81a1c1',
      accentRgb: [136, 192, 208],
      accentGlow: 'rgba(136, 192, 208, 0.05)'
    },
    tokyonight: {
      lineMajor: 'rgba(122, 162, 247, 0.18)',
      lineMinor: 'rgba(47, 53, 73, 0.22)',
      dotMinor: 'rgba(154, 165, 206, 0.15)',
      accent: '#7aa2f7',
      accentLight: '#7dcfff',
      accentRgb: [122, 162, 247],
      accentGlow: 'rgba(122, 162, 247, 0.05)'
    },
    dracula: {
      lineMajor: 'rgba(189, 147, 249, 0.18)',
      lineMinor: 'rgba(68, 71, 90, 0.22)',
      dotMinor: 'rgba(191, 191, 209, 0.14)',
      accent: '#bd93f9',
      accentLight: '#ff79c6',
      accentRgb: [189, 147, 249],
      accentGlow: 'rgba(189, 147, 249, 0.05)'
    },
    matrix: {
      lineMajor: 'rgba(34, 197, 94, 0.20)',
      lineMinor: 'rgba(27, 58, 27, 0.22)',
      dotMinor: 'rgba(134, 239, 172, 0.15)',
      accent: '#22c55e',
      accentLight: '#4ade80',
      accentRgb: [34, 197, 94],
      accentGlow: 'rgba(34, 197, 94, 0.05)'
    }
  };

  let themeColors = THEME_GRID_PALETTES.gruvbox;

  function updateColors() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'gruvbox';
    themeColors = THEME_GRID_PALETTES[currentTheme] || THEME_GRID_PALETTES.gruvbox;
  }

  window.updateGridTheme = updateColors;
  updateColors();

  // Mouse tracking with smooth lerp
  const mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    radius: 170
  };

  // Orthogonal PCB trace packets
  const pulses = [];
  const MAX_PULSES = 4;

  // Expanding diamond/square bus waves
  const ripples = [];

  // Animation frame handle
  let animationId = null;
  let lastTime = 0;
  let isTabVisible = true;
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(width / GRID_SIZE) + 1;
    rows = Math.ceil(height / GRID_SIZE) + 1;
    offsetX = Math.floor((width % GRID_SIZE) / 2);
    offsetY = Math.floor((height % GRID_SIZE) / 2);
  }

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('pointermove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.active = false;
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  });

  window.addEventListener('click', (e) => {
    if (prefersReducedMotion) return;

    const clickCol = Math.round((e.clientX - offsetX) / GRID_SIZE);
    const clickRow = Math.round((e.clientY - offsetY) / GRID_SIZE);
    const startX = offsetX + clickCol * GRID_SIZE;
    const startY = offsetY + clickRow * GRID_SIZE;

    // 1. Bus shockwave (expanding diamond)
    ripples.push({
      x: startX,
      y: startY,
      size: 4,
      maxSize: Math.min(300, Math.max(width, height) * 0.35),
      speed: 4.5,
      alpha: 0.5
    });

    // 2. Broadcast orthogonal trace signals in all 4 cardinal directions
    spawnPulse(startX, startY, 1, 0, 2.4, GRID_SIZE * 6, true);
    spawnPulse(startX, startY, -1, 0, 2.4, GRID_SIZE * 6, true);
    spawnPulse(startX, startY, 0, 1, 2.4, GRID_SIZE * 6, true);
    spawnPulse(startX, startY, 0, -1, 2.4, GRID_SIZE * 6, true);
  }, { passive: true });

  function spawnPulse(x, y, dirX, dirY, speed, maxDist, isMajor = false) {
    if (pulses.length >= MAX_PULSES + 4) return;
    pulses.push({
      x,
      y,
      dirX,
      dirY,
      speed: speed || (1.4 + Math.random() * 0.9),
      len: 34 + Math.random() * 26,
      dist: 0,
      maxDist: maxDist || (GRID_SIZE * (3 + Math.floor(Math.random() * 5))),
      turnsLeft: Math.random() > 0.4 ? 1 : 0,
      turnCooldown: 12,
      isMajor
    });
  }

  function maybeSpawnRandomPulse() {
    if (prefersReducedMotion || pulses.length >= MAX_PULSES) return;
    if (Math.random() < 0.02) {
      // Prefer spawning on major bus lanes
      const isMajor = Math.random() > 0.3;
      let c, r;
      if (isMajor) {
        if (Math.random() > 0.5) {
          c = Math.floor(Math.random() * Math.ceil(cols / MAJOR_STEP)) * MAJOR_STEP;
          r = Math.floor(Math.random() * rows);
        } else {
          c = Math.floor(Math.random() * cols);
          r = Math.floor(Math.random() * Math.ceil(rows / MAJOR_STEP)) * MAJOR_STEP;
        }
      } else {
        c = Math.floor(Math.random() * cols);
        r = Math.floor(Math.random() * rows);
      }

      const x = offsetX + c * GRID_SIZE;
      const y = offsetY + r * GRID_SIZE;
      const horizontal = Math.random() > 0.5;
      const dir = Math.random() > 0.5 ? 1 : -1;
      spawnPulse(x, y, horizontal ? dir : 0, horizontal ? 0 : dir, null, null, isMajor);
    }
  }

  let time = 0;

  function render(now) {
    if (!isTabVisible) {
      animationId = requestAnimationFrame(render);
      return;
    }

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0.016;
    lastTime = now;
    time += dt;

    // Smooth mouse lerping
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;
    } else {
      mouse.x += (-1000 - mouse.x) * 0.14;
      mouse.y += (-1000 - mouse.y) * 0.14;
    }

    ctx.clearRect(0, 0, width, height);

    const [ar, ag, ab] = themeColors.accentRgb;

    // ------------------------------------------------------------------------
    // 1. Minor Memory Matrix (Hairlines & Dots)
    // ------------------------------------------------------------------------
    ctx.lineWidth = 1;
    ctx.strokeStyle = themeColors.lineMinor;
    ctx.beginPath();

    // Minor hairlines
    for (let c = 0; c <= cols; c++) {
      if (c % MAJOR_STEP === 0) continue;
      const x = Math.floor(offsetX + c * GRID_SIZE) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let r = 0; r <= rows; r++) {
      if (r % MAJOR_STEP === 0) continue;
      const y = Math.floor(offsetY + r * GRID_SIZE) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Minor memory vertices (micro-dots with breathing wave)
    ctx.fillStyle = themeColors.dotMinor;
    for (let c = 0; c <= cols; c++) {
      if (c % MAJOR_STEP === 0) continue;
      const x = Math.floor(offsetX + c * GRID_SIZE);

      for (let r = 0; r <= rows; r++) {
        if (r % MAJOR_STEP === 0) continue;
        const y = Math.floor(offsetY + r * GRID_SIZE);

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.hypot(dx, dy);

        let dotR = 0.8;
        if (dist < mouse.radius) {
          const boost = (1 - dist / mouse.radius);
          dotR = 0.8 + boost * 0.8;
        }

        ctx.beginPath();
        ctx.arc(x + 0.5, y + 0.5, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ------------------------------------------------------------------------
    // 2. Major Bus Conduits (System Architecture Traces)
    // ------------------------------------------------------------------------
    ctx.lineWidth = 1;
    ctx.strokeStyle = themeColors.lineMajor;
    ctx.beginPath();

    for (let c = 0; c <= cols; c += MAJOR_STEP) {
      const x = Math.floor(offsetX + c * GRID_SIZE) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let r = 0; r <= rows; r += MAJOR_STEP) {
      const y = Math.floor(offsetY + r * GRID_SIZE) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // ------------------------------------------------------------------------
    // 3. Major Bus Junctions (Circuit Vias, Brackets & Hex Labels)
    // ------------------------------------------------------------------------
    ctx.font = '8.5px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';

    for (let c = 0; c <= cols; c += MAJOR_STEP) {
      const x = Math.floor(offsetX + c * GRID_SIZE);

      for (let r = 0; r <= rows; r += MAJOR_STEP) {
        const y = Math.floor(offsetY + r * GRID_SIZE);

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.hypot(dx, dy);

        let viaAlpha = 0.28;
        let scale = 1;
        if (dist < mouse.radius) {
          const prox = (1 - dist / mouse.radius);
          viaAlpha = 0.28 + prox * 0.45;
          scale = 1 + prox * 0.3;
        }

        // Circuit Via (outer square pad + center dot)
        ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${viaAlpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        const padSize = 5 * scale;
        ctx.strokeRect(x - padSize / 2 + 0.5, y - padSize / 2 + 0.5, padSize, padSize);

        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${(viaAlpha * 0.9).toFixed(3)})`;
        ctx.fillRect(x, y, 1, 1);

        // Corner registration ticks (┌ ┐ └ ┘)
        const arm = 3;
        const off = 8;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(x - off, y - off + arm);
        ctx.lineTo(x - off, y - off);
        ctx.lineTo(x - off + arm, y - off);
        // Top-right
        ctx.moveTo(x + off - arm, y - off);
        ctx.lineTo(x + off, y - off);
        ctx.lineTo(x + off, y - off + arm);
        // Bottom-left
        ctx.moveTo(x - off, y + off - arm);
        ctx.lineTo(x - off, y + off);
        ctx.lineTo(x - off + arm, y + off);
        // Bottom-right
        ctx.moveTo(x + off - arm, y + off);
        ctx.lineTo(x + off, y + off);
        ctx.lineTo(x + off, y + off - arm);
        ctx.stroke();

        // Sparse Hex Memory Address Labels (objdump / hardware map aesthetic)
        if ((c / MAJOR_STEP) % 2 === 0 && (r / MAJOR_STEP) % 2 === 0) {
          const hexAddr = (((c * 32 + r * 16) & 0xFFFF) >>> 0).toString(16).toUpperCase().padStart(4, '0');
          ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, 0.12)`;
          ctx.fillText(`0x${hexAddr}`, x + 6, y + 6);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 4. Click Bus Shockwaves (Expanding Diamond Registration Waves)
    // ------------------------------------------------------------------------
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.size += rip.speed;
      rip.alpha *= 0.96;

      if (rip.alpha < 0.01 || rip.size >= rip.maxSize) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(rip.x + 0.5, rip.y + 0.5);
      ctx.rotate(Math.PI / 4); // diamond
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${rip.alpha.toFixed(3)})`;
      ctx.strokeRect(-rip.size / 2, -rip.size / 2, rip.size, rip.size);
      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // 5. Orthogonal PCB Trace Packets (Data Signals with 90° Routing)
    // ------------------------------------------------------------------------
    maybeSpawnRandomPulse();

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.x += p.dirX * p.speed;
      p.y += p.dirY * p.speed;
      p.dist += p.speed;
      p.turnCooldown = Math.max(0, p.turnCooldown - 1);

      // Check for orthogonal 90° turn at grid intersections
      if (p.turnsLeft > 0 && p.turnCooldown === 0) {
        if (p.dirX !== 0) {
          const gridDiff = Math.abs((p.x - offsetX) % GRID_SIZE);
          if (gridDiff < p.speed * 1.2) {
            p.x = Math.round((p.x - offsetX) / GRID_SIZE) * GRID_SIZE + offsetX;
            p.dirY = Math.random() > 0.5 ? 1 : -1;
            p.dirX = 0;
            p.turnsLeft -= 1;
            p.turnCooldown = 30;
          }
        } else if (p.dirY !== 0) {
          const gridDiff = Math.abs((p.y - offsetY) % GRID_SIZE);
          if (gridDiff < p.speed * 1.2) {
            p.y = Math.round((p.y - offsetY) / GRID_SIZE) * GRID_SIZE + offsetY;
            p.dirX = Math.random() > 0.5 ? 1 : -1;
            p.dirY = 0;
            p.turnsLeft -= 1;
            p.turnCooldown = 30;
          }
        }
      }

      if (p.dist >= p.maxDist) {
        pulses.splice(i, 1);
        continue;
      }

      const progress = p.dist / p.maxDist;
      let alpha = 1;
      if (progress < 0.15) {
        alpha = progress / 0.15;
      } else if (progress > 0.7) {
        alpha = (1 - progress) / 0.3;
      }

      const tailX = p.x - p.dirX * p.len;
      const tailY = p.y - p.dirY * p.len;

      // Trace gradient
      const pGrad = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
      pGrad.addColorStop(0, 'rgba(0,0,0,0)');
      pGrad.addColorStop(1, `rgba(${ar}, ${ag}, ${ab}, ${(alpha * 0.45).toFixed(3)})`);

      ctx.lineWidth = p.isMajor ? 1.6 : 1.2;
      ctx.strokeStyle = pGrad;
      ctx.beginPath();
      ctx.moveTo(tailX + 0.5, tailY + 0.5);
      ctx.lineTo(p.x + 0.5, p.y + 0.5);
      ctx.stroke();

      // Signal Head (phosphor dot)
      ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${(alpha * 0.85).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x + 0.5, p.y + 0.5, p.isMajor ? 1.8 : 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // ------------------------------------------------------------------------
    // 6. Digital Logic Probe (Cursor Reticle & [0xADDR] HUD Tag)
    // ------------------------------------------------------------------------
    if (mouse.x > -100 && mouse.x < width + 100 && mouse.y > -100 && mouse.y < height + 100) {
      // Soft radial trace glow
      const radGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      radGlow.addColorStop(0, themeColors.accentGlow);
      radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGlow;
      ctx.fillRect(mouse.x - mouse.radius, mouse.y - mouse.radius, mouse.radius * 2, mouse.radius * 2);

      const probeCol = Math.round((mouse.x - offsetX) / GRID_SIZE);
      const probeRow = Math.round((mouse.y - offsetY) / GRID_SIZE);
      const probeX = Math.floor(offsetX + probeCol * GRID_SIZE) + 0.5;
      const probeY = Math.floor(offsetY + probeRow * GRID_SIZE) + 0.5;

      const probeDist = Math.hypot(mouse.x - probeX, mouse.y - probeY);
      if (probeDist < 140) {
        const factor = Math.pow(1 - probeDist / 140, 1.2);

        // Alignment crosshair beams
        const beamSpan = 70 * factor;
        const beamH = ctx.createLinearGradient(probeX - beamSpan, probeY, probeX + beamSpan, probeY);
        beamH.addColorStop(0, 'rgba(0,0,0,0)');
        beamH.addColorStop(0.5, `rgba(${ar}, ${ag}, ${ab}, ${(factor * 0.35).toFixed(3)})`);
        beamH.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.lineWidth = 1;
        ctx.strokeStyle = beamH;
        ctx.beginPath();
        ctx.moveTo(probeX - beamSpan, probeY);
        ctx.lineTo(probeX + beamSpan, probeY);
        ctx.stroke();

        const beamV = ctx.createLinearGradient(probeX, probeY - beamSpan, probeX, probeY + beamSpan);
        beamV.addColorStop(0, 'rgba(0,0,0,0)');
        beamV.addColorStop(0.5, `rgba(${ar}, ${ag}, ${ab}, ${(factor * 0.35).toFixed(3)})`);
        beamV.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = beamV;
        ctx.beginPath();
        ctx.moveTo(probeX, probeY - beamSpan);
        ctx.lineTo(probeX, probeY + beamSpan);
        ctx.stroke();

        // Probe target brackets ([ ])
        ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${(factor * 0.6).toFixed(3)})`;
        const bSize = 6;
        ctx.beginPath();
        // Left bracket [
        ctx.moveTo(probeX - bSize, probeY - bSize);
        ctx.lineTo(probeX - bSize - 2, probeY - bSize);
        ctx.lineTo(probeX - bSize - 2, probeY + bSize);
        ctx.lineTo(probeX - bSize, probeY + bSize);
        // Right bracket ]
        ctx.moveTo(probeX + bSize, probeY - bSize);
        ctx.lineTo(probeX + bSize + 2, probeY - bSize);
        ctx.lineTo(probeX + bSize + 2, probeY + bSize);
        ctx.lineTo(probeX + bSize, probeY + bSize);
        ctx.stroke();

        // Memory pointer HUD readout
        const hexOffset = (((probeCol * 64 + probeRow * 16) & 0xFFFF) >>> 0).toString(16).toUpperCase().padStart(4, '0');
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${(factor * 0.5).toFixed(3)})`;
        ctx.fillText(`[0x${hexOffset}]`, probeX + 10, probeY - 10);
      }
    }

    animationId = requestAnimationFrame(render);
  }

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible) {
      lastTime = performance.now();
    }
  });

  resize();
  lastTime = performance.now();
  animationId = requestAnimationFrame(render);
}
