/* ═══════════════════════════════════════════════
   freeze.js — Donma Modu
   Tüm eksik harfler bulununca devreye girer.
   Oyuncu harfleri sürükle-bırak ile sıraya dizer.
   15 saniye süre.
═══════════════════════════════════════════════ */

const Freeze = (() => {

  const FREEZE_TIME = 15; // saniye
  const BOOK_COLORS = [
    '#c0392b','#1a3a5c','#2d6a4f','#b8860b',
    '#6b2d6b','#0e6674','#8b4513','#2e2d88'
  ];

  let timerInterval = null;
  let timeLeft      = FREEZE_TIME;
  let targetWord    = '';
  let collectedLetters = []; // Oyuncunun topladığı harfler (sırasız)
  let onSolved      = null;  // callback(true/false)
  let active        = false;

  /* ── Overlay ve grid elementleri ── */
  const getOverlay   = () => document.getElementById('freeze-overlay');
  const getFreezeGrid = () => document.getElementById('freeze-grid');
  const getTimerEl   = () => document.getElementById('freeze-timer');

  /* ── Harfleri karıştır ── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Sürükle-bırak mantığı ── */
  let dragSrc = null;

  function onDragStart(e) {
    dragSrc = e.currentTarget;
    dragSrc.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd(e) {
    dragSrc?.classList.remove('dragging');
    dragSrc = null;
    document.querySelectorAll('.freeze-slot').forEach(s => s.classList.remove('drag-over'));
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');
    if (!dragSrc || dragSrc === target) return;

    // Konumları değiştir
    const srcLetter  = dragSrc.dataset.letter;
    const srcColor   = dragSrc.dataset.color;
    const tgtLetter  = target.dataset.letter;
    const tgtColor   = target.dataset.color;

    dragSrc.dataset.letter = tgtLetter;
    dragSrc.dataset.color  = tgtColor;
    dragSrc.textContent    = tgtLetter;
    dragSrc.style.background = tgtColor || 'rgba(30,24,16,0.08)';

    target.dataset.letter = srcLetter;
    target.dataset.color  = srcColor;
    target.textContent    = srcLetter;
    target.style.background = srcColor;

    checkAnswer();
  }

  /* ── Doğru mu kontrol et ── */
  function checkAnswer() {
    const slots = getFreezeGrid()?.querySelectorAll('.freeze-slot') || [];
    const current = Array.from(slots).map(s => s.dataset.letter || '').join('');
    if (current === targetWord) {
      // DOĞRU!
      slots.forEach(s => {
        s.style.background = '#2d6a4f';
        s.style.color = '#f5f0e8';
        s.style.transform = 'scale(1.1)';
      });
      setTimeout(() => end(true), 600);
    }
  }

  /* ── Timer ── */
  function startTimer() {
    timeLeft = FREEZE_TIME;
    updateTimer();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimer();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        end(false);
      }
    }, 1000);
  }

  function updateTimer() {
    const el = getTimerEl();
    if (!el) return;
    el.textContent = timeLeft;
    el.style.color = timeLeft <= 5 ? '#c0392b' : '#1e1810';
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  /* ── Grid oluştur ── */
  function buildFreezeGrid(letters) {
    const grid = getFreezeGrid();
    if (!grid) return;
    grid.innerHTML = '';

    const shuffled = shuffle(letters);

    shuffled.forEach((letter, i) => {
      const slot = document.createElement('div');
      const color = BOOK_COLORS[i % BOOK_COLORS.length];
      slot.className   = 'freeze-slot grid-cell work-cell';
      slot.textContent = letter;
      slot.dataset.letter = letter;
      slot.dataset.color  = color;
      slot.style.cssText = `
        width: 56px; height: 56px;
        background: ${color};
        color: #f5f0e8;
        border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display);
        font-size: 22px; font-weight: 700;
        cursor: grab;
        transition: all 0.2s;
        border: 2px solid rgba(0,0,0,0.2);
        box-shadow: 2px 2px 0 rgba(0,0,0,0.15);
        user-select: none;
      `;
      slot.draggable = true;
      slot.addEventListener('dragstart',  onDragStart);
      slot.addEventListener('dragend',    onDragEnd);
      slot.addEventListener('dragover',   onDragOver);
      slot.addEventListener('dragleave',  onDragLeave);
      slot.addEventListener('drop',       onDrop);

      // Mobil: dokunmatik sürükle
      addTouchDrag(slot);

      grid.appendChild(slot);
    });
  }

  /* ── Mobil dokunmatik sürükleme ── */
  function addTouchDrag(el) {
    let touchSrc = null;

    el.addEventListener('touchstart', (e) => {
      touchSrc = e.currentTarget;
      touchSrc.style.opacity = '0.6';
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      if (!touchSrc) return;
      touchSrc.style.opacity = '1';

      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);

      if (target && target.classList.contains('freeze-slot') && target !== touchSrc) {
        // Değiştir
        const tLetter = target.dataset.letter;
        const tColor  = target.dataset.color;
        target.dataset.letter  = touchSrc.dataset.letter;
        target.dataset.color   = touchSrc.dataset.color;
        target.textContent     = touchSrc.dataset.letter;
        target.style.background = touchSrc.dataset.color;

        touchSrc.dataset.letter  = tLetter;
        touchSrc.dataset.color   = tColor;
        touchSrc.textContent     = tLetter;
        touchSrc.style.background = tColor;

        checkAnswer();
      }
      touchSrc = null;
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */

  /**
   * Donma modunu başlat
   * @param {string} word — hedef kelime
   * @param {string[]} letters — karışık harfler (kelimeden gelen)
   * @param {function} callback — (solved: boolean) => void
   */
  function start(word, letters, callback) {
    if (active) return;
    active   = true;
    targetWord = word;
    onSolved   = callback;

    const overlay = getOverlay();
    if (overlay) overlay.classList.add('active');

    buildFreezeGrid(letters);
    startTimer();
  }

  /**
   * Modu bitir
   */
  function end(solved) {
    if (!active) return;
    active = false;
    stopTimer();

    setTimeout(() => {
      const overlay = getOverlay();
      if (overlay) overlay.classList.remove('active');
      if (onSolved) onSolved(solved);
    }, solved ? 700 : 200);
  }

  /**
   * Dışarıdan iptal
   */
  function cancel() {
    active = false;
    stopTimer();
    const overlay = getOverlay();
    if (overlay) overlay.classList.remove('active');
  }

  function isActive() { return active; }

  return { start, end, cancel, isActive };

})();
