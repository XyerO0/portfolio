/**
 * Debanjan (Xyero.Dev) - Minimal Terminal Portfolio Scripts
 * Handles theme switcher, interactive console, and live GitHub repository synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTerminal();
  initGitHubSync();
});

/* ==========================================================================
   1. Theme Switcher (Arch Cyan <-> Gruvbox)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('site_theme') || 'arch';
  applyTheme(saved);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'arch';
      const next = current === 'arch' ? 'gruvbox' : 'arch';
      applyTheme(next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('site_theme', theme);
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = `theme: ${theme}`;
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

    contact: () => `Contact & Inquiry:
Email:    debanjan.cs@example.com
GitHub:   https://github.com/XyerO0
LinkedIn: https://linkedin.com`,

    clear: () => {
      output.textContent = '';
      return '';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim().toLowerCase();
    if (!raw) return;

    if (raw === 'clear') {
      commands.clear();
      input.value = '';
      return;
    }

    const res = commands[raw]
      ? commands[raw]()
      : `bash: command not found: ${raw}. Type 'help' for available commands.`;

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
