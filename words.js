/* ═══════════════════════════════════════════════
   words.js — Kelime Havuzu
   Her kelimede: word, theme, tags, def (esprili tanım)
   Başta kısa/kolay, ilerledikçe uzun/nadir
═══════════════════════════════════════════════ */

const WORDS = [

  /* ══ MUTFAK ══ */
  { word: "TUZ",     theme: "mutfak", tags: ["tuz","baharat","tat","lezzet"], level: 1,
    def: "Her şeyin gizli mimarı. Olmasa fark edilir, olunca unutulur." },
  { word: "YAĞ",     theme: "mutfak", tags: ["yağ","kızartma","pişirme"], level: 1,
    def: "Tencerenin ilk sözcüğü. Sesi bile iştah açar." },
  { word: "ET",      theme: "mutfak", tags: ["et","yemek","protein","ızgara"], level: 1,
    def: "Sofraya söz vermez, varlığıyla konuşur." },
  { word: "PİŞ",     theme: "mutfak", tags: ["pişirme","ısı","ocak"], level: 1,
    def: "Hem yemeğe hem insana söylenir. İkisi de zaman ister." },
  { word: "EKMEK",   theme: "mutfak", tags: ["ekmek","buğday","fırın","un"], level: 2,
    def: "Unun en erdemli hali. Masanın sessiz ortağı." },
  { word: "ÇORBA",   theme: "mutfak", tags: ["çorba","su","sebze","sıcak"], level: 2,
    def: "Bir kase içinde toparlanan her şey. Sabah varlığının kanıtı." },
  { word: "TAVA",    theme: "mutfak", tags: ["tava","kızartma","ocak","pişirme"], level: 2,
    def: "Mutfağın karakteri. Temiz tava yoktur; tecrübeli tava vardır." },
  { word: "SIRMA",   theme: "mutfak", tags: ["süzme","süt","süzgeç","yoğurt"], level: 3,
    def: "Süzülmek de bir emektir. Sabır gerektirir." },
  { word: "BAHARAT", theme: "mutfak", tags: ["baharat","çeşni","tat","aroma"], level: 3,
    def: "Yemeğin kişiliği. Onsuz sadece besin alırsın." },
  { word: "HAMUR",   theme: "mutfak", tags: ["hamur","un","yoğurma","ekmek"], level: 3,
    def: "Her şekle girer, hiçbirinde kalmaz. Fırın karar verir." },
  { word: "SPATULA", theme: "mutfak", tags: ["spatula","pişirme","çevirmek","tava"], level: 3,
    def: "Çevirmek de bir sanattır. Erken çevirirsen yakar." },

  /* ══ DENİZ ══ */
  { word: "SU",      theme: "deniz", tags: ["su","deniz","irmak","göl"], level: 4,
    def: "Şekli yok ama her şeyi şekillendirir." },
  { word: "AĞ",      theme: "deniz", tags: ["ağ","balık","avlanma","deniz"], level: 4,
    def: "Boşluklarla doludur ama tutar. İlginç paradoks." },
  { word: "GEMİ",    theme: "deniz", tags: ["gemi","deniz","yolculuk","yelken"], level: 4,
    def: "Suyun üstünde yürüyen çelişki." },
  { word: "DALGA",   theme: "deniz", tags: ["dalga","deniz","hareket","ritim"], level: 5,
    def: "Her biri farklı ama hepsi aynı yönde. Çoğunluklar böyledir." },
  { word: "BALIK",   theme: "deniz", tags: ["balık","deniz","av","su"], level: 5,
    def: "Sessiz yüzer, hep bir adım önde. Pek çok şeyden daha akıllı." },
  { word: "PUSULA",  theme: "deniz", tags: ["pusula","yön","kuzey","yolculuk"], level: 6,
    def: "Sana nereye gitmen gerektiğini değil, nerede olduğunu söyler." },
  { word: "FIRTINA", theme: "deniz", tags: ["fırtına","rüzgar","deniz","tehlike"], level: 6,
    def: "Herkesi eşitler. Kaptan da yolcu da ıslanır." },
  { word: "YELKEN",  theme: "deniz", tags: ["yelken","rüzgar","gemi","özgürlük"], level: 6,
    def: "Rüzgara direnmez, onu kullanır. Akıllı bir bez parçası." },

  /* ══ ORMAN ══ */
  { word: "KOK",     theme: "orman", tags: ["kök","ağaç","toprak","zemin"], level: 7,
    def: "Görünmez ama her şeyi tutar. Sessiz kahraman." },
  { word: "DAL",     theme: "orman", tags: ["dal","ağaç","yaprak","orman"], level: 7,
    def: "Gövdeden ayrılmak ister gibi durur ama gitmez." },
  { word: "YAPRAK",  theme: "orman", tags: ["yaprak","ağaç","sonbahar","yeşil"], level: 8,
    def: "Her yıl gider, her yıl döner. En sadık mevsimlik işçi." },
  { word: "MANTAR",  theme: "orman", tags: ["mantar","orman","toprak","bitki"], level: 8,
    def: "Nereden çıktığını kimse bilmez. Ama hep çıkar." },
  { word: "ORMAN",   theme: "orman", tags: ["orman","ağaç","doğa","sessizlik"], level: 9,
    def: "Yalnız ağaçların toplantısı. Sessizlik zorunlu." },
  { word: "MEŞE",    theme: "orman", tags: ["meşe","ağaç","palamuT","güç"], level: 9,
    def: "Zamana direnen ahşap. Masa olunca bile ayaktadır." },

  /* ══ ŞEHİR ══ */
  { word: "YOL",     theme: "sehir", tags: ["yol","şehir","ulaşım","gitmek"], level: 10,
    def: "Biri inşa eder, herkes kullanır. Kimse teşekkür etmez." },
  { word: "KÖPRÜ",   theme: "sehir", tags: ["köprü","bağlantı","şehir","nehir"], level: 10,
    def: "İki yakayı tanıştırmak için hayatını geçirip geçirir orada." },
  { word: "BINA",    theme: "sehir", tags: ["bina","yapı","inşaat","mimari"], level: 10,
    def: "İnsanlar dolar boşalır. Bina kalır, hatırlamaz." },
  { word: "SOKAK",   theme: "sehir", tags: ["sokak","kalabalık","şehir","yürüyüş"], level: 11,
    def: "Şehrin damarı. En çok şeye tanıklık eden yüzeydir." },
  { word: "METRO",   theme: "sehir", tags: ["metro","ulaşım","tünel","şehir"], level: 11,
    def: "Yerin altında herkes eşittir. İstasyona kadar." },
  { word: "MİMARİ",  theme: "sehir", tags: ["mimari","tasarım","yapı","şehir"], level: 12,
    def: "Taşın düşünce haline gelmesi. Uzun sürer ama kalır." },

  /* ══ ANTİK ══ */
  { word: "TAPINAK", theme: "antik", tags: ["tapınak","antik","din","taş","mimari"], level: 13,
    def: "Tanrılara inşa edildi, turistler fotoğrafladı. Herkes mutlu." },
  { word: "HEYKEL",  theme: "antik", tags: ["heykel","sanat","taş","antik","imge"], level: 13,
    def: "Taşın içinde zaten vardı. Sanatçı sadece fazlalığı çıkardı." },
  { word: "YAZIT",   theme: "antik", tags: ["yazıt","alfabe","antik","tarih","yazı"], level: 14,
    def: "Binlerce yıl bekledi okunmak için. Sabır bu demek." },
  { word: "MOZAIK",  theme: "antik", tags: ["mozaik","sanat","antik","renk","taş"], level: 14,
    def: "Kırık parçaların en güzel hali. Bütünden daha anlamlı." },
  { word: "SÜTUN",   theme: "antik", tags: ["sütun","mimari","antik","taşıyıcı"], level: 15,
    def: "Yükü taşır ama şikayet etmez. Mermer sabırdır." },
  { word: "PAPIRÜS", theme: "antik", tags: ["papirüs","yazı","antik","belge","Mısır"], level: 15,
    def: "İlk not defteri. Bin yıl sonra hâlâ okunuyor." },

];

/* ── Tema & seviyeye göre kelime filtrele ── */
function getWordsByTheme(themeId, maxLevel) {
  return WORDS.filter(w => w.theme === themeId && w.level <= maxLevel);
}

/* ── Rastgele kelime seç ── */
function getRandomWord(themeId, maxLevel, usedWords = []) {
  const pool = getWordsByTheme(themeId, maxLevel).filter(w => !usedWords.includes(w.word));
  if (pool.length === 0) {
    // Tüm kelimeler kullanıldı, listeyi sıfırla
    const all = getWordsByTheme(themeId, maxLevel);
    return all[Math.floor(Math.random() * all.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Yanlış harf üret (Türk alfabesinden) ── */
function getWrongLetters(correctLetter, count = 2) {
  const TR_ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  const pool = TR_ALPHABET.filter(l => l !== correctLetter);
  const result = [];
  while (result.length < count) {
    const l = pool[Math.floor(Math.random() * pool.length)];
    if (!result.includes(l)) result.push(l);
  }
  return result;
}
