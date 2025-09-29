import '../css/main.css';
import { getIdeas, createIdea, voteIdea } from './api';
import makeToast from './makeToast';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
const csrftoken = getCookie('csrftoken');

const list = document.getElementById('ideas-list');
const statusEl = document.getElementById('idea-status');

function renderItem(i) {
  return `<li data-id="${i.id}"><strong>${i.title}</strong> — ${i.details}
    ${i.url ? ` <a href="${i.url}" target="_blank">link</a>` : ''}
    <button class="vote-btn" aria-label="upvote">▲ ${i.votes}</button>
    ${i.slug ? `<em> (slug: ${i.slug}, words: ${i.word_count}, priority: ${i.priority})</em>` : ''}
  </li>`;
}

async function renderList() {
  try {
    const ideas = await getIdeas();
    list.innerHTML = ideas.map(renderItem).join('');
  } catch (err) {
    list.innerHTML = `<li>Load error: ${err.message}</li>`;
  }
}
renderList();

const form = document.getElementById('idea-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Submitting…';
    const title = document.getElementById('idea-title').value.trim();
    const details = document.getElementById('idea-details').value.trim();
    const url = document.getElementById('idea-url').value.trim();
    try {
      const { idea } = await createIdea({ title, details, url }, csrftoken);
      list.innerHTML = renderItem(idea) + list.innerHTML;
      form.reset();
      statusEl.textContent = 'Saved!';
      makeToast('Idea submitted');
    } catch (err) {
      statusEl.textContent = `Error: ${err.message}`;
    }
  });
}

list?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.vote-btn');
  if (!btn) return;
  const li = btn.closest('li');
  const id = li?.getAttribute('data-id');
  if (!id) return;
  try {
    const { votes } = await voteIdea(id, csrftoken);
    btn.textContent = `▲ ${votes}`;
  } catch (err) {
    makeToast('Vote failed');
  }
});
