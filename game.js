// ===== GAME STATE =====
const GRID_COLS = 6;
const GRID_ROWS = 12;
const DANGER_ROWS = 10;
const workRow = GRID_ROWS - 1;

let grid = [];
let score = 0;
let wordsCompleted = 0;
let gameActive = false;
let currentWord = null;
let dragSource = null;
let shuffleUsed = false;
let letterChoices = [];
let correctLetter = null;
let waitingForChoice = false;

// ===== GRID =====
function initGrid() {
  grid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    grid.push([]);
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r].push(null);
    }
  }
}

function renderGrid() {
  const container = document.getElementById('game-grid');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      const data = grid[r][c];
      if (data) {
        cell.textContent = data.letter;
        if (data.type === 'wrong') cell.classList.add('filled-wrong');
        if (data.type === 'work') {
          cell.classList.add('work-cell');
          if (data.isEmpty) cell.classList.add('empty-slot');
        }
      }

      if (data && data.type === 'work' && !data.isEmpty) {
        cell.draggable = true;
        cell.addEventListener('dragstart', onDragStart);
        cell.addEventListener('dragend', onDragEnd);
      }

      if (data && data.type === 'work') {
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('drop', onDrop);
        cell.addEventListener('dragleave', onDragLeave);
      }

      container.appendChild(cell);
    }
  }
}

function getCellElement(r, c) {
  return document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
}

// ===== DRAG & DROP =====
function onDragStart(e) {
  dragSource = {row: parseInt(e.target.dataset.row), col: parseInt(e.target.dataset.col)};
  e.target.classList.add('dragging');
}

function onDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!dragSource) return;

  const targetRow = parseInt(e.currentTarget.dataset.row);
  const targetCol = parseInt(e.currentTarget.dataset.col);

  if (targetRow !== dragSource.row) return;

  const srcData = grid[dragSource.row][dragSource.col];
  const tgtData = grid[targetRow][targetCol];

  if (!tgtData || tgtData.type !== 'work') return;

  grid[dragSource.row][dragSource.col] = tgtData;
  grid[targetRow][targetCol] = srcData;

  dragSource = null;
  renderGrid();
  checkWordCompletion();
}

// ===== ROUND =====
function startNewRound() {
  if (!gameActive) return;

  currentWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  const wordLetters = currentWord.split('');
  const missingIdx = Math.floor(Math.random() * wordLetters.length);
  correctLetter = wordLetters[missingIdx];

  const remaining = [...wordLetters];
  remaining[missingIdx] = null;
  const shuffled = shuffleArray(remaining);

  const startCol = Math.floor((GRID_COLS - wordLetters.length) / 2);
  for (let c = 0; c < GRID_COLS; c++) grid[workRow][c] = null;

  shuffled.forEach((letter, i) => {
    grid[workRow][startCol + i] = {
      letter: letter || '_',
      type: 'work',
      isEmpty: letter === null
    };
  });

  generateLetterChoices();
  shuffleUsed = false;
  updateShuffleBtn();
  waitingForChoice = true;

  renderGrid();
  setStatus('Doğru harfi seç!', 'info');
}

function generateLetterChoices() {
  const wrong = [];
  while (wrong.length < 4) {
    const l = TURKISH_ALPHABET[Math.floor(Math.random() * TURKISH_ALPHABET.length)];
    if (l !== correctLetter && !wrong.includes(l)) wrong.push(l);
  }
  letterChoices = shuffleArray([...wrong, correctLetter]);
  renderLetterChoices();
}

function renderLetterChoices() {
  const container = document.getElementById('letter-choices');
  container.innerHTML = '';
  letterChoices.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'letter-btn';
    btn.innerHTML = `<span>${letter}</span>`;
    btn.addEventListener('click', () => onLetterChosen(letter, btn));
    container.appendChild(btn);
  });
}

function onLetterChosen(letter, btn) {
  if (!waitingForChoice || !gameActive) return;
  waitingForChoice = false;

  if (letter === correctLetter) {
    btn.classList.add('correct-pick');
    addScore(5);
    setStatus('+5 PUAN! Harfleri diz!', 'good');
    placeLetterInSlot(letter);
    disableLetterButtons();
  } else {
    btn.classList.add('wrong-pick');
    setStatus('YANLIŞ! Blok düştü!', 'bad');
    dropWrongBlock();
    setTimeout(() => { waitingForChoice = true; }, 600);
  }
}

function placeLetterInSlot(letter) {
  const startCol = Math.floor((GRID_COLS - currentWord.length) / 2);
  for (let c = startCol; c < startCol + currentWord.length; c++) {
    if (grid[workRow][c] && grid[workRow][c].isEmpty) {
      grid[workRow][c] = {letter, type: 'work', isEmpty: false};
      break;
    }
  }
  renderGrid();
}

function dropWrongBlock() {
  const col = Math.floor(Math.random() * GRID_COLS);
  let targetRow = -1;
  for (let r = DANGER_ROWS - 1; r >= 0; r--) {
    if (!grid[r][col]) { targetRow = r; break; }
  }

  if (targetRow === -1) { triggerGameOver(); return; }

  const randomLetter = TURKISH_ALPHABET[Math.floor(Math.random() * TURKISH_ALPHABET.length)];
  grid[targetRow][col] = {letter: randomLetter, type: 'wrong'};
  renderGrid();
  checkDangerLevel();
}

function checkDangerLevel() {
  let maxFilled = 0;
  for (let c = 0; c < GRID_COLS; c++) {
    for (let r = 0; r < DANGER_ROWS; r++) {
      if (grid[r][c]) {
        const depth = DANGER_ROWS - r;
        if (depth > maxFilled) maxFilled = depth;
      }
    }
  }

  if (maxFilled >= DANGER_ROWS) {
    triggerGameOver();
  } else if (maxFilled >= DANGER_ROWS * 0.7) {
    document.body.classList.add('danger');
  } else {
    document.body.classList.remove('danger');
  }
}

function checkWordCompletion() {
  if (!currentWord) return;
  const startCol = Math.floor((GRID_COLS - currentWord.length) / 2);
  let formed = '';
  for (let i = 0; i < currentWord.length; i++) {
    const cell = grid[workRow][startCol + i];
    if (!cell || cell.isEmpty) return;
    formed += cell.letter;
  }
  if (formed === currentWord) wordSuccess();
}

function wordSuccess() {
  addScore(10);
  wordsCompleted++;
  document.getElementById('word-display').textContent = wordsCompleted;
  setStatus('+10 PUAN! ' + currentWord + '!', 'good');

  const startCol = Math.floor((GRID_COLS - currentWord.length) / 2);
  for (let i = 0; i < currentWord.length; i++) {
    const cell = getCellElement(workRow, startCol + i);
    if (cell) cell.classList.add('correct-row');
  }

  spawnParticles();

  setTimeout(() => {
    clearBottomRow();
    renderGrid();
    currentWord = null;
    setTimeout(() => startNewRound(), 300);
  }, 700);
}

function clearBottomRow() {
  for (let c = 0; c < GRID_COLS; c++) grid[workRow][c] = null;
  for (let r = DANGER_ROWS - 1; r > 0; r--) {
    for (let c = 0; c < GRID_COLS; c++) grid[r][c] = grid[r - 1][c];
  }
  for (let c = 0; c < GRID_COLS; c++) grid[0][c] = null;
  checkDangerLevel();
}

function spawnParticles() {
  const colors = ['#e8ff47', '#2ed573', '#ff4757', '#fff'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
    const y = window.innerHeight / 2;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 1.5) * 150;
    p.style.setProperty('--tx', tx + 'px');
    p.style.setProperty('--ty', ty + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

// ===== SCORE =====
function addScore(pts) {
  score += pts;
  document.getElementById('score-display').textContent = score;
}

// ===== STATUS =====
function setStatus(msg, type = '') {
  const el = document.getElementById('status-msg');
  el.textContent = msg;
  el.className = 'status-msg' + (type ? ' ' + type : '');
}

// ===== SHUFFLE =====
function shuffleLetterChoices() {
  if (shuffleUsed || !waitingForChoice) return;
  shuffleUsed = true;
  updateShuffleBtn();
  generateLetterChoices();
}

function updateShuffleBtn() {
  const btn = document.getElementById('shuffle-btn');
  const countEl = document.getElementById('shuffle-count');
  if (shuffleUsed) {
    btn.disabled = true;
    countEl.textContent = '(0)';
  } else {
    btn.disabled = false;
    countEl.textContent = '(1)';
  }
}

function disableLetterButtons() {
  document.querySelectorAll('.letter-btn').forEach(btn => btn.style.pointerEvents = 'none');
  document.getElementById('shuffle-btn').disabled = true;
}

// ===== GAME OVER =====
function triggerGameOver() {
  gameActive = false;
  document.body.classList.remove('danger');
  document.getElementById('final-score').textContent = score + ' PUAN';
  document.getElementById('overlay').classList.add('active');
}

// ===== INIT =====
function startGame() {
  score = 0;
  wordsCompleted = 0;
  gameActive = true;
  document.getElementById('score-display').textContent = '0';
  document.getElementById('word-display').textContent = '0';
  document.getElementById('overlay').classList.remove('active');
  document.body.classList.remove('danger');
  initGrid();
  renderGrid();
  setStatus('ZAR AT VE BAŞLA', 'info');
  document.getElementById('letter-choices').innerHTML = '';
  document.getElementById('shuffle-btn').disabled = true;
}

// ===== HELPERS =====
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== EVENTS =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dice-btn').addEventListener('click', () => {
    if (!gameActive) { gameActive = true; initGrid(); renderGrid(); }
    startNewRound();
  });

  document.getElementById('shuffle-btn').addEventListener('click', shuffleLetterChoices);

  document.getElementById('restart-btn').addEventListener('click', startGame);

  document.getElementById('submit-score-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();
    if (name.length > 0) {
      playerName = name;
      addToLeaderboard(name, score);
      nameInput.value = '';
      setStatus('SKOR KAYDEDİLDİ!', 'good');
    }
  });

  loadLeaderboard();
  startGame();
});
