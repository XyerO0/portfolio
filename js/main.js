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
   4. Dynamic Animated Background Grid (Interactive Terminal Grid & Pulses)
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

  const GRID_SIZE = 44;
  let cols = 0;
  let rows = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Dynamic theme colors across 7 themes
  const THEME_GRID_PALETTES = {
    gruvbox: {
      line: 'rgba(60, 56, 54, 0.24)',
      accent: '#7daea3',
      accentLight: '#89bf82',
      accentRgb: [125, 174, 163],
      accentGlow: 'rgba(125, 174, 163, 0.05)'
    },
    arch: {
      line: 'rgba(26, 37, 56, 0.22)',
      accent: '#1793d1',
      accentLight: '#38bdf8',
      accentRgb: [23, 147, 209],
      accentGlow: 'rgba(23, 147, 209, 0.05)'
    },
    catppuccin: {
      line: 'rgba(54, 58, 79, 0.26)',
      accent: '#cba6f7',
      accentLight: '#b4befe',
      accentRgb: [203, 166, 247],
      accentGlow: 'rgba(203, 166, 247, 0.05)'
    },
    nord: {
      line: 'rgba(76, 86, 106, 0.24)',
      accent: '#88c0d0',
      accentLight: '#81a1c1',
      accentRgb: [136, 192, 208],
      accentGlow: 'rgba(136, 192, 208, 0.05)'
    },
    tokyonight: {
      line: 'rgba(47, 53, 73, 0.26)',
      accent: '#7aa2f7',
      accentLight: '#7dcfff',
      accentRgb: [122, 162, 247],
      accentGlow: 'rgba(122, 162, 247, 0.05)'
    },
    dracula: {
      line: 'rgba(68, 71, 90, 0.26)',
      accent: '#bd93f9',
      accentLight: '#ff79c6',
      accentRgb: [189, 147, 249],
      accentGlow: 'rgba(189, 147, 249, 0.05)'
    },
    matrix: {
      line: 'rgba(27, 58, 27, 0.26)',
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
    radius: 180
  };

  // Light pulses travelling along grid segments
  const pulses = [];
  const MAX_PULSES = 3;

  // Click shockwaves / ripples
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
    offsetY = 0;
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
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      r: 4,
      maxR: Math.min(280, Math.max(width, height) * 0.35),
      speed: 4.8,
      alpha: 0.45
    });

    // Also trigger 1 subtle instant pulse originating from clicked intersection
    const clickCol = Math.round((e.clientX - offsetX) / GRID_SIZE);
    const clickRow = Math.round((e.clientY - offsetY) / GRID_SIZE);
    const startX = offsetX + clickCol * GRID_SIZE;
    const startY = offsetY + clickRow * GRID_SIZE;

    const dirs = [
      { axis: 'x', dir: 1 },
      { axis: 'x', dir: -1 },
      { axis: 'y', dir: 1 },
      { axis: 'y', dir: -1 }
    ];
    const picked = dirs[Math.floor(Math.random() * dirs.length)];
    spawnPulse(startX, startY, picked.axis, picked.dir, 2.8, GRID_SIZE * (2 + Math.floor(Math.random() * 3)));
  }, { passive: true });

  function spawnPulse(x, y, axis, dir, speed, maxDist) {
    if (pulses.length >= MAX_PULSES) return;
    pulses.push({
      startX: x,
      startY: y,
      axis: axis,
      dir: dir,
      speed: speed || (1.6 + Math.random() * 1.2),
      dist: 0,
      maxDist: maxDist || (GRID_SIZE * (2 + Math.floor(Math.random() * 4))),
      len: 36 + Math.random() * 24
    });
  }

  function maybeSpawnRandomPulse() {
    if (prefersReducedMotion || pulses.length >= MAX_PULSES) return;
    if (Math.random() < 0.015) {
      const c = Math.floor(Math.random() * cols);
      const r = Math.floor(Math.random() * rows);
      const x = offsetX + c * GRID_SIZE;
      const y = offsetY + r * GRID_SIZE;
      const axis = Math.random() > 0.5 ? 'x' : 'y';
      const dir = Math.random() > 0.5 ? 1 : -1;
      spawnPulse(x, y, axis, dir);
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
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
    } else {
      mouse.x += (-1000 - mouse.x) * 0.12;
      mouse.y += (-1000 - mouse.y) * 0.12;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Draw base grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = themeColors.line;
    ctx.beginPath();

    for (let c = 0; c <= cols; c++) {
      const x = Math.floor(offsetX + c * GRID_SIZE) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let r = 0; r <= rows; r++) {
      const y = Math.floor(offsetY + r * GRID_SIZE) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 2. Dynamic spotlight & line highlight near cursor
    if (mouse.x > -200 && mouse.x < width + 200 && mouse.y > -200 && mouse.y < height + 200) {
      const radGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      radGlow.addColorStop(0, themeColors.accentGlow);
      radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGlow;
      ctx.fillRect(mouse.x - mouse.radius, mouse.y - mouse.radius, mouse.radius * 2, mouse.radius * 2);

      const [ar, ag, ab] = themeColors.accentRgb;
      const minC = Math.max(0, Math.floor((mouse.x - mouse.radius - offsetX) / GRID_SIZE));
      const maxC = Math.min(cols, Math.ceil((mouse.x + mouse.radius - offsetX) / GRID_SIZE));
      const minR = Math.max(0, Math.floor((mouse.y - mouse.radius - offsetY) / GRID_SIZE));
      const maxR = Math.min(rows, Math.ceil((mouse.y + mouse.radius - offsetY) / GRID_SIZE));

      // Highlighted vertical lines
      for (let c = minC; c <= maxC; c++) {
        const x = Math.floor(offsetX + c * GRID_SIZE) + 0.5;
        const dx = Math.abs(x - mouse.x);
        if (dx < mouse.radius) {
          const dySpan = Math.sqrt(mouse.radius * mouse.radius - dx * dx);
          const y1 = Math.max(0, mouse.y - dySpan);
          const y2 = Math.min(height, mouse.y + dySpan);

          const gradV = ctx.createLinearGradient(x, y1, x, y2);
          gradV.addColorStop(0, 'rgba(0,0,0,0)');
          const alphaCenter = (1 - dx / mouse.radius) * 0.18;
          gradV.addColorStop(0.5, `rgba(${ar}, ${ag}, ${ab}, ${alphaCenter.toFixed(3)})`);
          gradV.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.strokeStyle = gradV;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();
        }
      }

      // Highlighted horizontal lines
      for (let r = minR; r <= maxR; r++) {
        const y = Math.floor(offsetY + r * GRID_SIZE) + 0.5;
        const dy = Math.abs(y - mouse.y);
        if (dy < mouse.radius) {
          const dxSpan = Math.sqrt(mouse.radius * mouse.radius - dy * dy);
          const x1 = Math.max(0, mouse.x - dxSpan);
          const x2 = Math.min(width, mouse.x + dxSpan);

          const gradH = ctx.createLinearGradient(x1, y, x2, y);
          gradH.addColorStop(0, 'rgba(0,0,0,0)');
          const alphaCenter = (1 - dy / mouse.radius) * 0.18;
          gradH.addColorStop(0.5, `rgba(${ar}, ${ag}, ${ab}, ${alphaCenter.toFixed(3)})`);
          gradH.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.strokeStyle = gradH;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      }
    }

    // 3. Shockwave / Click Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += rip.speed;
      rip.alpha *= 0.96;

      if (rip.alpha < 0.01 || rip.r >= rip.maxR) {
        ripples.splice(i, 1);
        continue;
      }

      const [ar, ag, ab] = themeColors.accentRgb;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${rip.alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Update & Draw Pulses (Data Packets)
    maybeSpawnRandomPulse();

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.dist += p.speed;

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

      const [ar, ag, ab] = themeColors.accentRgb;

      let headX, headY, tailX, tailY;
      if (p.axis === 'x') {
        headX = p.startX + p.dist * p.dir;
        headY = p.startY;
        tailX = headX - p.len * p.dir;
        tailY = headY;
      } else {
        headX = p.startX;
        headY = p.startY + p.dist * p.dir;
        tailX = headX;
        tailY = headY - p.len * p.dir;
      }

      const pGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      pGrad.addColorStop(0, 'rgba(0,0,0,0)');
      pGrad.addColorStop(1, `rgba(${ar}, ${ag}, ${ab}, ${(alpha * 0.32).toFixed(3)})`);

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = pGrad;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${(alpha * 0.5).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(headX, headY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Grid Intersections (Crosshairs "+")
    const [ar, ag, ab] = themeColors.accentRgb;

    for (let c = 0; c <= cols; c++) {
      const x = Math.floor(offsetX + c * GRID_SIZE);

      for (let r = 0; r <= rows; r++) {
        const y = Math.floor(offsetY + r * GRID_SIZE);

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.hypot(dx, dy);

        // Ambient breathing wave (soft & calm)
        const wave = Math.sin(time * 0.8 + c * 0.18 + r * 0.18) * 0.03;
        let baseAlpha = 0.08 + wave;
        let armLen = 2.0;

        // Mouse proximity boost
        if (dist < mouse.radius) {
          const mouseFactor = Math.pow(1 - dist / mouse.radius, 1.4);
          baseAlpha = Math.min(0.4, baseAlpha + mouseFactor * 0.25);
          armLen = 2.0 + mouseFactor * 1.5;
        }

        // Ripple proximity boost
        for (let ri = 0; ri < ripples.length; ri++) {
          const rip = ripples[ri];
          const ripDist = Math.abs(Math.hypot(x - rip.x, y - rip.y) - rip.r);
          if (ripDist < 25) {
            const ripFactor = (1 - ripDist / 25) * rip.alpha;
            baseAlpha = Math.min(0.5, baseAlpha + ripFactor * 0.25);
            armLen = Math.max(armLen, 2.0 + ripFactor * 1.5);
          }
        }

        ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${baseAlpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizontal tick
        ctx.moveTo(x - armLen + 0.5, y + 0.5);
        ctx.lineTo(x + armLen + 0.5, y + 0.5);
        // Vertical tick
        ctx.moveTo(x + 0.5, y - armLen + 0.5);
        ctx.lineTo(x + 0.5, y + armLen + 0.5);
        ctx.stroke();
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
