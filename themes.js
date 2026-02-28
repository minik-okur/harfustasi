/* ═══════════════════════════════════════════════
   themes.js — Tema & Seviye Sistemi
═══════════════════════════════════════════════ */

const Themes = (() => {

  /* ── Tema tanımları ── */
  const THEMES = [
    {
      id: 'mutfak',
      name: 'MUTFAK',
      desc: 'Ocaklar yanar, kelimeler pişer.',
      emoji: '🍳',
      levels: [1, 2, 3],
    },
    {
      id: 'deniz',
      name: 'DENİZ',
      desc: 'Dalgalar kırar, harfler dağılır.',
      emoji: '🌊',
      levels: [4, 5, 6],
    },
    {
      id: 'orman',
      name: 'ORMAN',
      desc: 'Ağaçlar konuşur, sen dinlersin.',
      emoji: '🌲',
      levels: [7, 8, 9],
    },
    {
      id: 'sehir',
      name: 'ŞEHİR',
      desc: 'Gürültü içinde anlam ara.',
      emoji: '🏙️',
      levels: [10, 11, 12],
    },
    {
      id: 'antik',
      name: 'ANTİK',
      desc: 'Yüzyıllar eski, kelimelerin genci.',
      emoji: '🏛️',
      levels: [13, 14, 15],
    },
  ];

  /* ── Seviye → zorluk haritası ── */
  // Her 3 seviyede bir tema, her seviyede eksik harf sayısı artar
  const LEVEL_CONFIG = {
    1:  { missingCount: 1, speed: 2200, theme: 'mutfak' },
    2:  { missingCount: 1, speed: 2000, theme: 'mutfak' },
    3:  { missingCount: 2, speed: 1800, theme: 'mutfak' },
    4:  { missingCount: 2, speed: 1700, theme: 'deniz' },
    5:  { missingCount: 2, speed: 1500, theme: 'deniz' },
    6:  { missingCount: 3, speed: 1400, theme: 'deniz' },
    7:  { missingCount: 3, speed: 1300, theme: 'orman' },
    8:  { missingCount: 3, speed: 1200, theme: 'orman' },
    9:  { missingCount: 3, speed: 1100, theme: 'orman' },
    10: { missingCount: 3, speed: 1000, theme: 'sehir' },
    11: { missingCount: 3, speed:  900, theme: 'sehir' },
    12: { missingCount: 3, speed:  800, theme: 'sehir' },
    13: { missingCount: 3, speed:  750, theme: 'antik' },
    14: { missingCount: 3, speed:  700, theme: 'antik' },
    15: { missingCount: 3, speed:  650, theme: 'antik' },
  };

  let currentThemeId  = 'mutfak';
  let currentLevel    = 1;
  let onIntroComplete = null;

  /* ── Seviye config'i al ── */
  function getLevelConfig(level) {
    return LEVEL_CONFIG[level] || LEVEL_CONFIG[15];
  }

  /* ── Mevcut tema objesi ── */
  function getTheme(id) {
    return THEMES.find(t => t.id === id) || THEMES[0];
  }

  /* ── Seviyeyi güncelle, tema değişti mi kontrol et ── */
  function setLevel(level) {
    const cfg = getLevelConfig(level);
    const newThemeId = cfg.theme;

    const themeChanged = newThemeId !== currentThemeId;
    currentThemeId = newThemeId;
    currentLevel   = level;

    // Tema badge güncelle
    const badgeEl = document.getElementById('theme-badge');
    if (badgeEl) {
      const t = getTheme(currentThemeId);
      badgeEl.textContent = `${t.emoji} ${t.name}`;
    }

    return themeChanged;
  }

  /* ── Tema giriş ekranını göster ── */
  function showThemeIntro(themeId, callback) {
    const overlay = document.getElementById('theme-intro');
    if (!overlay) { if (callback) callback(); return; }

    const t = getTheme(themeId);
    document.getElementById('theme-intro-title').textContent = t.name;
    document.getElementById('theme-intro-sub').textContent   = t.emoji + ' ' + 'Yeni Dünya';
    document.getElementById('theme-intro-desc').textContent  = t.desc;

    overlay.classList.add('active');

    // 2.5 saniye sonra kapat
    setTimeout(() => {
      overlay.classList.remove('active');
      if (callback) callback();
    }, 2500);
  }

  /* ── Başlangıç temasını göster ── */
  function init(opts = {}) {
    onIntroComplete = opts.onIntroComplete || null;
    setLevel(1);
  }

  /* ── Mevcut config'i döndür ── */
  function getCurrentConfig() {
    return getLevelConfig(currentLevel);
  }

  function getCurrentThemeId() { return currentThemeId; }
  function getCurrentLevel()   { return currentLevel; }

  return {
    init,
    setLevel,
    showThemeIntro,
    getLevelConfig,
    getTheme,
    getCurrentConfig,
    getCurrentThemeId,
    getCurrentLevel,
    THEMES,
  };

})();
