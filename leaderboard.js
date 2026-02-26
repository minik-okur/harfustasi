let leaderboard = [];
let playerName = '';

function loadLeaderboard() {
  const stored = localStorage.getItem('harf_mimarı_lb');
  if (stored) {
    leaderboard = JSON.parse(stored);
  } else {
    leaderboard = [
      {name: "ALP", score: 340},
      {name: "ELİF", score: 280},
      {name: "CAN", score: 210},
      {name: "SEM", score: 180},
      {name: "NUR", score: 150},
    ];
  }
  renderLeaderboard();
}

function saveLeaderboard() {
  localStorage.setItem('harf_mimarı_lb', JSON.stringify(leaderboard));
}

function addToLeaderboard(name, sc) {
  leaderboard.push({name: name.toUpperCase().slice(0, 8), score: sc});
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 20);
  saveLeaderboard();
  renderLeaderboard();
}

function renderLeaderboard() {
  const el = document.getElementById('leaderboard-list');
  if (!el) return;
  el.innerHTML = '';
  leaderboard.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'lb-entry' + (entry.name === playerName.toUpperCase() ? ' you' : '');
    div.innerHTML = `
      <span class="lb-rank">${i + 1}.</span>
      <span class="lb-name">${entry.name}</span>
      <span class="lb-score">${entry.score}</span>
    `;
    el.appendChild(div);
  });
}
