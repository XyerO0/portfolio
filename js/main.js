/**
 * Debanjan (Xyero.Dev) - Minimal Terminal Portfolio Scripts
 * Handles theme switcher and interactive console
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTerminal();
});

/* Theme Switcher */
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

/* Interactive Terminal */
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
  projects    - technical repositories
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

    projects: () => `Technical Repositories:
1. c-cpp-systems-dsa    - Hands-on data structures, algorithms, and POSIX exercises in C/C++.
2. xyero.dev-portfolio  - Responsive terminal-themed developer portfolio.
3. dotfiles-linux       - Tailored Neovim and Arch Linux environment configurations.`,

    fastfetch: () => `OS:         Arch Linux x86_64
Host:       Debanjan Workstation
Kernel:     Linux (zen/rolling)
Editor:     Neovim
Shell:      bash / zsh
User:       xyero (Debanjan)`,

    contact: () => `Contact & Inquiry:
Email:    debanjan.cs@example.com
GitHub:   https://github.com
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
