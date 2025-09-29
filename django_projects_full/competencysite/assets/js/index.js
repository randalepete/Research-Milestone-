
import '../css/main.css';
import { greeting } from './greet';
import { fetchProjects } from './api';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
const csrftoken = getCookie('csrftoken');

const greetEl = document.getElementById('greeting');
if (greetEl) greetEl.textContent = greeting('Aidan');

async function renderProjects() {
  const list = document.getElementById('project-list');
  if (!list) return;
  try {
    const projects = await fetchProjects();
    list.innerHTML = projects.map(renderItem).join('');
  } catch (err) {
    list.innerHTML = `<li>Failed to load projects: ${err.message}</li>`;
  }
}
function renderItem(p) {
  const extra = p.slug ? ` <em>(slug: ${p.slug}, desc chars: ${p.description_length})</em>` : '';
  return `<li><strong>${p.name}</strong> — ${p.description} ${p.url ? `<a href="${p.url}" target="_blank">Link</a>` : ''}${extra}</li>`;
}
renderProjects();

const btn = document.getElementById('lazy-btn');
if (btn) {
  btn.addEventListener('click', async () => {
    const { default: fact } = await import('./lazy-fact.js');
    alert(fact());
  });
}

const form = document.getElementById('project-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('proj-name').value.trim();
    const url = document.getElementById('proj-url').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const statusEl = document.getElementById('form-status');
    statusEl.textContent = 'Saving…';
    try {
      const res = await fetch('/api/projects/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken || '' },
        body: JSON.stringify({ name, url, description })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      statusEl.textContent = 'Saved!';
      const list = document.getElementById('project-list');
      const item = renderItem(data.project);
      list.innerHTML = item + list.innerHTML;
      form.reset();
    } catch (err) {
      statusEl.textContent = `Error: ${err.message}`;
    }
  });
}
