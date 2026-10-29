/**
 * Build-time GitHub Sync Script
 * Usage: node scripts/sync-github.js
 * Fetches all public repositories for XyerO0 and updates the static HTML fallback in index.html
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const USERNAME = 'XyerO0';
const INDEX_PATH = path.join(__dirname, '..', 'index.html');

function fetchRepos() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${USERNAME}/repos?sort=updated&per_page=100`,
      method: 'GET',
      headers: {
        'User-Agent': 'NodeJS-Portfolio-Sync',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
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

async function sync() {
  console.log(`[sync] Fetching public repositories for ${USERNAME}...`);
  try {
    const repos = await fetchRepos();
    if (!Array.isArray(repos) || repos.length === 0) {
      console.log('[sync] No repositories found.');
      return;
    }

    console.log(`[sync] Found ${repos.length} repositories.`);

    const cardsHtml = repos.map(repo => {
      const name = escapeHtml(repo.name);
      const desc = escapeHtml(repo.description || 'Public repository on GitHub.');
      const url = escapeHtml(repo.html_url);
      const isFork = repo.fork ? 'Forked Repo' : 'Public Repository';
      const lang = repo.language ? escapeHtml(repo.language) : 'Code';
      const updated = repo.pushed_at ? new Date(repo.pushed_at).toISOString().split('T')[0] : '';

      return `        <!-- Project: ${name} -->
        <article class="project-card">
          <div class="project-top">
            <h3 class="project-title">${name}</h3>
            <span class="project-type">${isFork}</span>
          </div>

          <p class="project-summary">${desc}</p>

          <div class="project-tech">
            <span class="tech-chip">${lang}</span>
            ${repo.stargazers_count > 0 ? `<span class="tech-chip">stars: ${repo.stargazers_count}</span>` : ''}
            ${updated ? `<span class="tech-chip">updated: ${updated}</span>` : ''}
          </div>

          <a href="${url}" target="_blank" rel="noopener noreferrer" class="project-footer-link">
            <span>view repository on github -></span>
          </a>
        </article>`;
    }).join('\n\n');

    let html = fs.readFileSync(INDEX_PATH, 'utf-8');
    const startMarker = '<div class="projects-grid" id="projectsGrid">';
    const endMarker = '      </div>\n    </section>';

    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker, startIndex);

    if (startIndex !== -1 && endIndex !== -1) {
      const newHtml = html.substring(0, startIndex + startMarker.length) + '\n\n' + cardsHtml + '\n\n' + html.substring(endIndex);
      fs.writeFileSync(INDEX_PATH, newHtml, 'utf-8');
      console.log(`[sync] Successfully updated ${INDEX_PATH} with ${repos.length} repositories.`);
    } else {
      console.error('[sync] Could not find projectsGrid markers in index.html.');
    }
  } catch (err) {
    console.error(`[sync] Error syncing repositories: ${err.message}`);
  }
}

sync();
