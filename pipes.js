/* ═══════════════════════════════════════════════
   pipes.js — Boru Sistemi Motoru
   3 dikey boru, harfler yukarıdan aşağı iner.
   Oyuncu doğru harfe tıklar.
═══════════════════════════════════════════════ */

const Pipes = (() => {

  /* ── Kitap sırtı renk paleti (style.css ile uyumlu) ── */
  const BOOK_COLORS = [
    '#c0392b','#1a3a5c','#2d6a4f','#b8860b',
    '#6b2d6b','#0e6674','#8b4513','#2e2d88',
    '#556b2f','#8b0000','#1b4332','#9c3b1e'
  ];

  /* ── Durum ── */
  let pipes         = [null, null, null]; // Her borudaki aktif harf objesi
  let queues        = [[], [], []];        // Her borunun harf kuyruğu
  let correctIndex  = -1;                 // Hangi boru doğru harfi taşıyor
  let currentLetter = '';                 // Beklenen harf
  let fallInterval  = null;              // Düşme timer'ı
  let fallSpeed     = 1800;              // ms — her adımda ne kadar bekle
  let tubeHeight    = 220;              // px
  let letterSize    = 60;               // px
  let active        = false;
  let onCorrect     = null;             // callback(letter)
  let onMiss        = null;             // callback(pipeIndex)
  let colorCounter  = 0;

  /* ── DOM referansları ── */
  const getTube = (i) => document.getElementById(`pipe-${i}`);

  /* ── Rastgele kitap rengi ── */
  function nextColor() {
    const c = BOOK_COLORS[colorCounter % BOOK_COLORS.length];
    colorCounter++;
    return c;
  }

  /* ── Yeni harf elementi oluştur ── */
  function createLetterEl(letter, color) {
    const el = document.createElement('div');
    el.className = 'pipe-letter';
    el.textContent = letter;
    el.style.background = color;
    el.style.top = `-${letterSize + 8}px`; // Borunun üstünden başla
    el.style.left = '4px';
    el.style.width  = (getTube(0)?.clientWidth - 8 || 56) + 'px';
    el.style.height = letterSize + 'px';
    el.style.lineHeight = letterSize + 'px';
    el.style.fontSize = '26px';
    el.style.position = 'absolute';
    el.style.transition = `top ${fallSpeed * 0.85}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    return el;
  }

  /* ── Boruyu başlat — ilk harfi koy ── */
  function loadPipe(pipeIndex) {
    if (!active) return;
    const tube = getTube(pipeIndex);
    if (!tube) return;

    // Kuyruktaki bir sonraki harfi al
    const letter = queues[pipeIndex].shift();
    if (!letter) return;

    const color = nextColor();
    const el = createLetterEl(letter, color);
    tube.appendChild(el);

    pipes[pipeIndex] = { el, letter, falling: false, escaped: false };

    // Tıklama
    el.addEventListener('click', () => handleClick(pipeIndex));

    // Kısa gecikme sonra düşmeye başla
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        startFalling(pipeIndex);
      });
    });
  }

  /* ── Harfi düşür ── */
  function startFalling(pipeIndex) {
    if (!active || !pipes[pipeIndex]) return;
    const p = pipes[pipeIndex];
    p.falling = true;

    // Borunun altına ulaş
    const targetTop = tubeHeight - letterSize - 4;
    p.el.style.top = targetTop + 'px';

    // Süre sonunda kaçtı mı kontrol et
    const duration = fallSpeed * 0.85;
    setTimeout(() => {
      if (!active || !pipes[pipeIndex] || p.escaped) return;
      // Harf borunun dibine ulaştı — kaçtı sayılır
      handleEscape(pipeIndex);
    }, duration + 100);
  }

  /* ── Tıklama ── */
  function handleClick(pipeIndex) {
    if (!active || !pipes[pipeIndex]) return;
    const p = pipes[pipeIndex];
    if (p.escaped) return;

    if (pipeIndex === correctIndex) {
      // DOĞRU
      p.el.classList.add('correct-flash');
      p.escaped = true;
      setTimeout(() => {
        p.el?.remove();
        pipes[pipeIndex] = null;
      }, 400);

      if (onCorrect) onCorrect(currentLetter);

      // Tüm boruları temizle, yeni tur için hazırla
      setTimeout(() => clearAllPipes(), 300);

    } else {
      // YANLIŞ
      p.el.classList.add('wrong-flash');
      setTimeout(() => p.el?.classList.remove('wrong-flash'), 400);

      if (onMiss) onMiss(pipeIndex);
    }
  }

  /* ── Kaçma — boru dibine ulaştı, oyuncu tıklamadı ── */
  function handleEscape(pipeIndex) {
    if (!pipes[pipeIndex] || pipes[pipeIndex].escaped) return;
    pipes[pipeIndex].escaped = true;

    const p = pipes[pipeIndex];

    // Boru doğru harfiyse ceza ver
    if (pipeIndex === correctIndex) {
      p.el.style.opacity = '0.2';
      setTimeout(() => {
        p.el?.remove();
        pipes[pipeIndex] = null;
      }, 300);
      if (onMiss) onMiss(pipeIndex);
      setTimeout(() => clearAllPipes(), 200);
    } else {
      // Yanlış boruysa sessizce temizle
      setTimeout(() => {
        p.el?.remove();
        pipes[pipeIndex] = null;
      }, 200);
    }
  }

  /* ── Tüm boruları temizle ── */
  function clearAllPipes() {
    for (let i = 0; i < 3; i++) {
      if (pipes[i]) {
        pipes[i].el?.remove();
        pipes[i] = null;
      }
      const tube = getTube(i);
      if (tube) tube.innerHTML = '';
    }
  }

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */

  /**
   * Yeni bir harf turu başlat.
   * @param {string} correct — doğru harf
   * @param {string[]} wrongs — [yanlış1, yanlış2]
   * @param {number} speed — düşme süresi ms (düşük = hızlı)
   */
  function newRound(correct, wrongs, speed) {
    if (!active) return;
    clearAllPipes();

    currentLetter = correct;
    fallSpeed = speed || 1800;

    // 3 konuma rastgele dağıt
    const positions = [0, 1, 2];
    correctIndex = positions[Math.floor(Math.random() * 3)];

    const letters = ['', '', ''];
    letters[correctIndex] = correct;
    let wi = 0;
    for (let i = 0; i < 3; i++) {
      if (i !== correctIndex) {
        letters[i] = wrongs[wi++] || '?';
      }
    }

    // Kuyrukları doldur
    queues = [[], [], []];
    for (let i = 0; i < 3; i++) {
      queues[i] = [letters[i]];
    }

    // Biraz gecikmeyle başlat (görsel hazırlık)
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        loadPipe(i);
      }
    }, 120);
  }

  /**
   * Sistemi başlat
   */
  function start(opts = {}) {
    active   = true;
    onCorrect = opts.onCorrect || null;
    onMiss    = opts.onMiss    || null;
    fallSpeed = opts.speed     || 1800;
    tubeHeight = getTube(0)?.clientHeight || 220;
    colorCounter = 0;
    clearAllPipes();
  }

  /**
   * Sistemi durdur
   */
  function stop() {
    active = false;
    clearAllPipes();
    if (fallInterval) { clearInterval(fallInterval); fallInterval = null; }
  }

  /**
   * Hız güncelle
   */
  function setSpeed(ms) {
    fallSpeed = ms;
  }

  /**
   * Aktif mi?
   */
  function isActive() { return active; }

  return { start, stop, newRound, setSpeed, isActive };

})();
