/* ═══════════════════════════════════════════════
   scoring.js — Puan · Can · Tezgah Sistemi
═══════════════════════════════════════════════ */

const Scoring = (() => {

  /* ── Durum ── */
  let score       = 0;
  let lives       = 3;
  let maxLives    = 3;
  let wordCount   = 0;
  let correctHits = 0;
  let wrongHits   = 0;
  let level       = 1;

  /* Tezgah: grid doluluk seviyesi.
     0 = boş, MAX_ROWS = oyun bitti */
  const MAX_ROWS  = 6; // Grid toplam satır sayısı
  let benchLevel  = 0; // Dolu satır sayısı (0 = boş, 6 = dolu = game over)

  /* Callback'ler */
  let onGameOver  = null;
  let onUpdate    = null; // UI güncellemesi için

  /* ── Kişisel rekor (localStorage) ── */
  function getPersonalBest() {
    return parseInt(localStorage.getItem('hm_personal_best') || '0');
  }
  function savePersonalBest(s) {
    const pb = getPersonalBest();
    if (s > pb) {
      localStorage.setItem('hm_personal_best', String(s));
      return true; // Yeni rekor!
    }
    return false;
  }

  /* ── UI Güncelle ── */
  function updateUI() {
    // Skor
    const scoreEl = document.getElementById('score-display');
    if (scoreEl) scoreEl.textContent = score;

    // Kelime sayısı
    const wordEl = document.getElementById('word-display');
    if (wordEl) wordEl.textContent = wordCount;

    // Seviye
    const lvlEl = document.getElementById('level-display');
    if (lvlEl) lvlEl.textContent = level;

    // Kişisel rekor
    const pbEl = document.getElementById('personal-best');
    if (pbEl) pbEl.textContent = getPersonalBest() || '—';

    // İstatistikler
    const cEl = document.getElementById('stat-correct');
    const wEl = document.getElementById('stat-wrong');
    const wdEl = document.getElementById('stat-words');
    if (cEl) cEl.textContent = correctHits;
    if (wEl) wEl.textContent = wrongHits;
    if (wdEl) wdEl.textContent = wordCount;

    // Can ikonları
    updateLivesUI();

    // Level bar (5 kelimede bir bölüm = %20 per kelime)
    const barEl = document.getElementById('level-bar');
    if (barEl) {
      const pct = ((wordCount % 5) / 5) * 100;
      barEl.style.width = pct + '%';
    }

    if (onUpdate) onUpdate({ score, lives, benchLevel, level, wordCount });
  }

  function updateLivesUI() {
    const el = document.getElementById('lives-display');
    if (!el) return;
    const icons = el.querySelectorAll('.life-icon');
    icons.forEach((icon, i) => {
      icon.classList.toggle('lost', i >= lives);
    });
  }

  /* ── Grid blok sistemi ── */
  function renderBench() {
    const grid = document.getElementById('game-grid');
    if (!grid) return;

    const cells = grid.querySelectorAll('.grid-cell');
    const totalRows = MAX_ROWS;
    const cols = 6;

    cells.forEach((cell, idx) => {
      const row = Math.floor(idx / cols);
      // benchLevel kaç satır dolu: alttan yukarı doğru
      const filledFrom = totalRows - benchLevel;
      if (row >= filledFrom) {
        // Dolu — kitap sırtı rengi ver
        const colorClass = `book-${idx % 12}`;
        cell.className = `grid-cell ${colorClass}`;
        cell.textContent = '';
      } else {
        // Boş
        cell.className = 'grid-cell';
        cell.textContent = '';
      }
    });

    // Tehlike kontrolü
    const danger = benchLevel >= MAX_ROWS - 1;
    document.body.classList.toggle('danger', danger);

    // Game over
    if (benchLevel >= MAX_ROWS) {
      triggerGameOver();
    }
  }

  function triggerGameOver() {
    savePersonalBest(score);
    if (onGameOver) onGameOver({ score, personalBest: getPersonalBest(), level, wordCount });
  }

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */

  /** Doğru harf seçildi — 1 blok sil */
  function correctHit() {
    correctHits++;
    score += 10 * level;
    if (benchLevel > 0) benchLevel--;
    renderBench();
    updateUI();
  }

  /** Yanlış harf / kaçırma — tezgah 1 birim yukarı */
  function wrongHit() {
    wrongHits++;
    benchLevel++;
    renderBench();
    updateUI();
  }

  /** Kelime doğru dizildi (donma modu) — 1 can kazan */
  function wordSolved() {
    wordCount++;
    score += 50 * level;
    if (lives < maxLives) {
      lives++;
      showLiveGain();
    }
    updateUI();
  }

  /** Kelime çözülemedi (donma modu timeout) — tezgah 1 yukarı */
  function wordFailed() {
    wordCount++; // yine de sayılır, ama puan yok
    benchLevel++;
    renderBench();
    updateUI();
  }

  /** Can kullan — tezgah 3 aşağı */
  function useLife() {
    if (lives <= 0) return false;
    lives--;
    benchLevel = Math.max(0, benchLevel - 3);
    renderBench();
    updateUI();
    return true;
  }

  /** Seviye güncelle */
  function setLevel(l) {
    level = l;
    updateUI();
  }

  /** Sıfırla */
  function reset() {
    score       = 0;
    lives       = 3;
    wordCount   = 0;
    correctHits = 0;
    wrongHits   = 0;
    level       = 1;
    benchLevel  = 0;
    document.body.classList.remove('danger');
    renderBench();
    updateUI();
  }

  /** Callback'leri kaydet */
  function init(opts = {}) {
    onGameOver = opts.onGameOver || null;
    onUpdate   = opts.onUpdate   || null;
    reset();
  }

  /** Can kazanım animasyonu */
  function showLiveGain() {
    const el = document.getElementById('lives-display');
    if (!el) return;
    el.style.transform = 'scale(1.3)';
    setTimeout(() => el.style.transform = '', 300);
  }

  /** Getter'lar */
  function getScore()      { return score; }
  function getLives()      { return lives; }
  function getBenchLevel() { return benchLevel; }
  function getLevel()      { return level; }
  function getWordCount()  { return wordCount; }
  function getStats()      { return { score, lives, benchLevel, level, wordCount, correctHits, wrongHits }; }

  /** Grid'i başlangıçta çiz */
  function initGrid() {
    const grid = document.getElementById('game-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < MAX_ROWS * 6; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      grid.appendChild(cell);
    }
    renderBench();
  }

  return {
    init, reset, initGrid,
    correctHit, wrongHit,
    wordSolved, wordFailed,
    useLife, setLevel,
    getScore, getLives, getBenchLevel,
    getLevel, getWordCount, getStats,
    getPersonalBest, savePersonalBest,
    renderBench
  };

})();
