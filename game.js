/* ═══════════════════════════════════════════════
   game.js — Ana Oyun Orkestratörü
   Pipes · Scoring · Themes · Freeze · SectionEnd
   hepsini yönetir.
═══════════════════════════════════════════════ */

const Game = (() => {

  /* ── Durum ── */
  let state = {
    running:       false,
    currentWord:   null,      // { word, def, theme, tags }
    missingIndices:[],        // Hangi pozisyonlar eksik
    collectedCount:0,         // Bu kelimede kaç harf toplandı
    usedWords:     [],        // Bu oturumda kullanılan kelimeler
    sectionWords:  [],        // Bu bölümde (5'li grup) çözülen kelimeler
    currentLevel:  1,
    currentTheme:  'mutfak',
    pipeSpeed:     2200,
  };

  /* ── Durum mesajı ── */
  function setStatus(msg, type = '') {
    const el = document.getElementById('status-msg');
    if (!el) return;
    el.textContent   = msg;
    el.className     = 'status-msg' + (type ? ` ${type}` : '');
  }

  /* ── Kelime tanımını göster ── */
  function showWordDef(def) {
    const el = document.getElementById('word-def');
    if (el) el.textContent = def || '—';
  }

  /* ── Boru turunu hazırla ── */
  function prepareRound() {
    if (!state.currentWord) return;

    const word    = state.currentWord.word;
    const missing = state.missingIndices;

    // Hangi harfler eksik?
    const remainingMissing = missing.filter(
      (_, i) => i >= state.collectedCount
    );

    if (remainingMissing.length === 0) {
      // Tüm harfler toplandı → donma moduna geç
      startFreeze();
      return;
    }

    // Sıradaki eksik harfin konumu
    const nextIdx    = remainingMissing[0];
    const correct    = word[nextIdx];
    const wrongs     = getWrongLetters(correct, 2);

    setStatus(`${state.collectedCount + 1}. HARF: DOĞRUYU SEÇ`, 'info');

    // Boruları başlat
    Pipes.newRound(correct, wrongs, state.pipeSpeed);
  }

  /* ── Doğru harf seçildi ── */
  function onCorrectHit(letter) {
    state.collectedCount++;
    Scoring.correctHit();
    setStatus(`✓ DOĞRU — ${letter}`, 'good');

    // Kısa gecikme sonra bir sonraki tura geç
    setTimeout(() => {
      if (!state.running) return;
      prepareRound();
    }, 600);
  }

  /* ── Yanlış harf veya kaçırma ── */
  function onMissHit() {
    Scoring.wrongHit();
    setStatus('✗ YANLIŞ — TEZGAH YUKARI!', 'bad');

    setTimeout(() => {
      if (!state.running) return;
      // Aynı harfi tekrar sor
      prepareRound();
    }, 700);
  }

  /* ── Donma modunu başlat ── */
  function startFreeze() {
    Pipes.stop();
    setStatus('DONMA MODU — HARFLERİ DİZ!', 'info');

    const letters = state.missingIndices.map(i => state.currentWord.word[i]);

    // Kelimenin eksik harflerinden oluşan hedef (sadece eksik harfler sıralı)
    const target = letters.join('');

    Freeze.start(target, letters, (solved) => {
      if (solved) {
        Scoring.wordSolved();
        setStatus('🎉 KELİME TAMAMLANDI!', 'good');
        showWordDef(state.currentWord.def);

        state.sectionWords.push(state.currentWord.word);

        // Parçacık efekti
        spawnParticles();

        // 5 kelime bölüm sonu kontrolü
        if (state.sectionWords.length >= 5) {
          setTimeout(() => showSectionEnd(), 1200);
        } else {
          setTimeout(() => nextWord(), 1500);
        }
      } else {
        // Çözülemedi
        Scoring.wordFailed();
        setStatus('SÜRE DOLDU — DEVAM', 'bad');
        setTimeout(() => nextWord(), 900);
      }
    });
  }

  /* ── Bir sonraki kelimeye geç ── */
  function nextWord() {
    if (!state.running) return;

    // Seviye hesapla
    const wordCount = Scoring.getWordCount();
    const newLevel  = Math.floor(wordCount / 3) + 1;
    const clampedLevel = Math.min(newLevel, 15);

    if (clampedLevel !== state.currentLevel) {
      state.currentLevel = clampedLevel;
      Scoring.setLevel(clampedLevel);

      const cfg = Themes.getLevelConfig(clampedLevel);
      state.pipeSpeed  = cfg.speed;

      const themeChanged = Themes.setLevel(clampedLevel);
      if (themeChanged) {
        state.currentTheme = Themes.getCurrentThemeId();
        // Tema intro göster
        Pipes.stop();
        Themes.showThemeIntro(state.currentTheme, () => {
          loadWord();
        });
        return;
      }
    }

    loadWord();
  }

  /* ── Yeni kelime yükle ── */
  function loadWord() {
    const cfg     = Themes.getCurrentConfig();
    const wordObj = getRandomWord(state.currentTheme, state.currentLevel, state.usedWords);

    if (!wordObj) {
      setStatus('KELİME KALMADI!', 'bad');
      return;
    }

    state.usedWords.push(wordObj.word);
    state.currentWord    = wordObj;
    state.collectedCount = 0;

    // Eksik harf pozisyonlarını belirle
    const missingCount = cfg.missingCount;
    state.missingIndices = pickMissingIndices(wordObj.word, missingCount);

    // Boruları yeniden başlat
    Pipes.start({
      onCorrect: onCorrectHit,
      onMiss:    onMissHit,
      speed:     state.pipeSpeed,
    });

    setStatus(`YENİ KELİME — ${wordObj.word.length} HARF`, 'info');
    setTimeout(() => prepareRound(), 500);
  }

  /* ── Rastgele eksik harf pozisyonları seç ── */
  function pickMissingIndices(word, count) {
    const indices = Array.from({ length: word.length }, (_, i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, word.length)).sort((a, b) => a - b);
  }

  /* ── Bölüm sonu ── */
  function showSectionEnd() {
    Pipes.stop();
    const words = [...state.sectionWords];
    state.sectionWords = [];

    SectionEnd.show(words, () => {
      loadWord();
    });
  }

  /* ── Oyun sonu ── */
  function triggerGameOver({ score, personalBest, level, wordCount }) {
    state.running = false;
    Pipes.stop();
    Freeze.cancel();

    const overlay   = document.getElementById('overlay');
    const finalScore = document.getElementById('final-score');
    const finalPB   = document.getElementById('final-personal-best');

    if (finalScore) finalScore.textContent = `${score} PUAN`;
    if (finalPB)    finalPB.textContent    = personalBest || score;
    if (overlay)    overlay.classList.add('active');
  }

  /* ── Parçacık efekti ── */
  function spawnParticles() {
    const colors = ['#c0392b','#2d6a4f','#b8860b','#1a3a5c','#6b2d6b'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.setProperty('--tx', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--ty', (Math.random() * -160 - 40) + 'px');
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = (Math.random() * 80 + 10) + 'vw';
      p.style.top  = '50vh';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  /* ── Başlat ── */
  function start() {
    state.running       = true;
    state.usedWords     = [];
    state.sectionWords  = [];
    state.currentLevel  = 1;
    state.currentTheme  = 'mutfak';
    state.pipeSpeed     = 2200;

    Scoring.init({
      onGameOver: triggerGameOver,
    });
    Scoring.initGrid();
    Themes.init();

    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('active');

    // İlk tema intro
    Themes.showThemeIntro('mutfak', () => {
      loadWord();
    });
  }

  /* ── Yeniden oyna ── */
  function restart() {
    Pipes.stop();
    Freeze.cancel();
    start();
  }

  /* ── Event listener'lar ── */
  function bindEvents() {
    document.getElementById('start-btn')?.addEventListener('click', () => {
      if (!state.running) start();
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      document.getElementById('overlay')?.classList.remove('active');
      restart();
    });

    document.getElementById('submit-score-btn')?.addEventListener('click', () => {
      const name = document.getElementById('player-name')?.value?.trim();
      if (name) {
        // Leaderboard kaydı (basit localStorage)
        const scores = JSON.parse(localStorage.getItem('hm_scores') || '[]');
        scores.push({ name, score: Scoring.getScore(), date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('hm_scores', JSON.stringify(scores.slice(0, 20)));
        document.getElementById('submit-score-btn').textContent = 'KAYDEDİLDİ ✓';
      }
    });
  }

  /* ── DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    // Grid'i görsel olarak çiz (henüz oyun başlamadan)
    Scoring.initGrid();
    setStatus('📚 BAŞLAMAK İÇİN BASILIN');
  });

  return { start, restart };

})();
