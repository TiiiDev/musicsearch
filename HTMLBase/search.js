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

fetch(DATA_URL)
  .then(r => r.json())
  .then(d => {
    tracks = d;
    updateCount(tracks.length);
  });

const q = document.getElementById('q');
const results = document.getElementById('results');
const count = document.getElementById('count');

q.addEventListener('input', () => {
  const kw = q.value.trim().toLowerCase();

  if (kw.length < 2) {
    results.innerHTML = '';
    updateCount(tracks.length);
    return;
  }

  const hits = tracks.filter(t =>
    t.a.toLowerCase().includes(kw) ||
    t.t.toLowerCase().includes(kw)
  );

  render(hits);
});

function render(list) {
  results.innerHTML = '';
  updateCount(list.length);

  const frag = document.createDocumentFragment();

  for (const t of list) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <span class="artist">${t.a}</span> -
        <span class="title">${t.t}</span>
        <span class="time">(${t.l})</span>
      </div>
      <div class="path">${t.p}</div>
    `;
    frag.appendChild(li);
  }

  results.appendChild(frag);
}

function updateCount(n) {
  count.textContent = `${n} 件`;
}
