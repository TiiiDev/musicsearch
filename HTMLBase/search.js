const DATA_URL = 'tracks.json';

let tracks = [];

fetch('date.txt')
  .then(r => r.text())
  .then(t => {
    document.getElementById('updated').textContent =
      '最終更新日時: ' + t.trim();
  })
  .catch(() => {
    document.getElementById('updated').textContent =
      '最終更新日時: 不明';
  });

fetch('version.txt')
  .then(r => r.text())
  .then(t => {
    document.getElementById('version').textContent =
      ' Ver. ' + t.trim();
  })
  .catch(() => {
    document.getElementById('version').textContent =
      ' Ver. 不明';
  });

fetch(DATA_URL)
  .then(r => r.json())
  .then(d => {
    tracks = d;
    updateCount(tracks.length);
  });

const q = document.getElementById('q');
const results = document.getElementById('results');
const count = document.getElementById('count');

function highlight(text, words) {
  if (!text) return '';

  let result = text;
  for (const w of words) {
    if (!w) continue;
    const re = new RegExp(`(${escapeRegExp(w)})`, 'gi');
    result = result.replace(re, '<mark>$1</mark>');
  }
  return result;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');}

q.addEventListener('input', () => {
  const words = q.value
    .trim()
    .toLowerCase()
    .split(/\s+/);

  if (words.length === 0 || words[0].length < 2) {
    results.innerHTML = '';
    updateCount(tracks.length);
    return;
  }

  // AND 用（通常検索語）
  const include = words.filter(w => !w.startsWith('-'));

  // NOT 用（-xxx）
  const exclude = words
    .filter(w => w.startsWith('-'))
    .map(w => w.slice(1));

  const hits = tracks.filter(t => {
    const a  = t.a?.toLowerCase() ?? '';
    const ti = t.t?.toLowerCase() ?? '';
    const p  = t.p?.toLowerCase() ?? '';

    // AND 検索（全部含まれる）
    if (!include.every(w =>
      a.includes(w) || ti.includes(w) || p.includes(w)
    )) {
      return false;
    }

    // NOT 検索（どれにも含まれない）
    if (!exclude.every(w =>
      !a.includes(w) && !ti.includes(w) && !p.includes(w)
    )) {
      return false;
    }

    return true;
  });

  // ★ include だけをハイライト用に渡す
  render(hits, include);
});

function render(list, words = []) {
  results.innerHTML = '';
  updateCount(list.length);

  const frag = document.createDocumentFragment();

  for (const t of list) {
    const li = document.createElement('li');

    li.innerHTML = `
      <div>
        <span class="artist">${highlight(t.a, words)}</span> -
        <span class="title">${highlight(t.t, words)}</span>
        <span class="time">(${t.l})</span>
      </div>
      <div class="path">${highlight(t.p, words)}</div>
    `;

    frag.appendChild(li);
  }

  results.appendChild(frag);
}

function updateCount(n) {
  count.textContent = `${n} 件`;
}
