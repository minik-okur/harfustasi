/* ═══════════════════════════════════════════════
   section-end.js — Bölüm Sonu & Özlü Söz Motoru
   Her 5 kelimede bölüm sonu açılır.
   Çözülen kelimelerin etiketlerine göre özlü söz seçilir.
═══════════════════════════════════════════════ */

const SectionEnd = (() => {

  /* ── Özlü söz veritabanı ── */
  /* Her sözün: text, author, tags (tetikleyici etiketler) */
  const QUOTES = [
    // MUTFAK / YİYECEK
    {
      text: "Aşçı ne kadar az konuşursa, yemek o kadar çok anlatır.",
      author: "Harf Mimarı",
      tags: ["yemek","pişirme","mutfak","tat","aroma","tuz","ekmek","çorba","sebze","et"]
    },
    {
      text: "Tuz olmayan yerde ne sevgi tutmuş ne de söz.",
      author: "Harf Mimarı",
      tags: ["tuz","baharat","tat","lezzet","çeşni","acı","tatlı"]
    },
    {
      text: "Ellerin yağlı ama kelimelerin keskin.",
      author: "Harf Mimarı",
      tags: ["yağ","kızartma","pişirme","mutfak","tava","ocak"]
    },
    // DENİZ / SU
    {
      text: "Dalgalar kıyıya gelir, harfler de sayfaya. İkisi de iz bırakır.",
      author: "Harf Mimarı",
      tags: ["dalga","deniz","su","kıyı","sahil","ırmak","göl","balık","yüzme"]
    },
    {
      text: "Derinliği olmayan su, balığı tutmaz; derinliği olmayan söz, kalbi.",
      author: "Harf Mimarı",
      tags: ["derin","su","deniz","balık","avcı","ağ","gemi"]
    },
    {
      text: "Fırtınayı seven denizcinin pusula derdi olmaz.",
      author: "Harf Mimarı",
      tags: ["fırtına","denizci","gemi","rüzgar","yelken","pusula","yolculuk"]
    },
    // ORMAN / DOĞA
    {
      text: "Ağaç kökünü bilir ama yerini değil. Sen de öylesin.",
      author: "Harf Mimarı",
      tags: ["ağaç","kök","orman","yaprak","dal","bitki","doğa","toprak"]
    },
    {
      text: "Sessiz ormanda en gürültülü şey kendi düşüncendir.",
      author: "Harf Mimarı",
      tags: ["sessizlik","orman","huzur","dinginlik","doğa","kuş"]
    },
    // ŞEHİR / YAPI
    {
      text: "Şehir planı kadar dağınık, ama o kadar da işlevsel.",
      author: "Harf Mimarı",
      tags: ["şehir","sokak","bina","yol","köprü","inşaat","mimari","kalabalık"]
    },
    {
      text: "Kalabalıkta kaybolan kelime, yalnızlıkta kendini bulur.",
      author: "Harf Mimarı",
      tags: ["kalabalık","şehir","yalnızlık","kayıp","bulma","sokak"]
    },
    // ANTİK / TARİH
    {
      text: "Yüzyıllar geçer, taşlar kalır; taşlar düşer, kelimeler kalır.",
      author: "Harf Mimarı",
      tags: ["antik","tarih","kalıntı","uygarlık","taş","anıt","geçmiş","çağ"]
    },
    {
      text: "İmparatorluklar çöktü ama alfabesi hâlâ ayakta.",
      author: "Harf Mimarı",
      tags: ["imparator","uygarlık","antik","alfabe","yazı","tarih","Roma","Yunan"]
    },
    // GENEL / EVRENSEL
    {
      text: "Hatalı harf bile bazen en güzel anlamı üretir.",
      author: "Harf Mimarı",
      tags: ["hata","yanlış","öğrenme","deneme","yanılma","kelime"]
    },
    {
      text: "Kelimelerin de ağırlığı var. Bazıları koşturur, bazıları çöktürür.",
      author: "Harf Mimarı",
      tags: ["kelime","anlam","dil","söz","güç","etki"]
    },
    {
      text: "Hızlı düşünen değil, doğru seçen kazanır.",
      author: "Harf Mimarı",
      tags: ["hız","seçim","strateji","düşünce","karar"]
    },
    {
      text: "Beş kelime, beş pencere. Hangisinden baktığın seni anlatır.",
      author: "Harf Mimarı",
      tags: ["pencere","bakış","anlam","seçim","dil","görmek"]
    },
    {
      text: "Sözcükler taş gibidir. Nasıl dizersen o yapıyı kurar.",
      author: "Harf Mimarı",
      tags: ["yapı","düzen","mimari","inşa","kurmak","dizmek"]
    },
    {
      text: "Dil unutmaz. Sen de onun bir parçasısın.",
      author: "Harf Mimarı",
      tags: ["dil","bellek","hatıra","kalıcılık","iz","miras"]
    },
    // FALLBACK
    {
      text: "Beş kelime, bir nefes. Devam et.",
      author: "Harf Mimarı",
      tags: []
    }
  ];

  /* ── En iyi özlü sözü bul ── */
  function findBestQuote(solvedWords) {
    // Kelimelerin etiketlerini topla (words.js'deki WORDS verisinden)
    const wordTags = [];
    if (typeof WORDS !== 'undefined') {
      solvedWords.forEach(w => {
        const entry = WORDS.find(x => x.word === w.toUpperCase() || x.word === w);
        if (entry && entry.tags) wordTags.push(...entry.tags);
      });
    }

    // Eşleşme skoru hesapla
    let best = null;
    let bestScore = -1;

    QUOTES.forEach(q => {
      let score = 0;
      q.tags.forEach(tag => {
        if (wordTags.includes(tag)) score++;
      });
      // Fallback sözü her zaman en sona
      if (q.tags.length === 0) score = -0.5;

      if (score > bestScore) {
        bestScore = score;
        best = q;
      }
    });

    // Hiç eşleşme yoksa fallback
    if (bestScore <= 0) {
      return QUOTES[QUOTES.length - 1];
    }

    return best;
  }

  /* ── Bölüm sonu ekranını göster ── */
  function show(solvedWords, callback) {
    const overlay = document.getElementById('section-end-overlay');
    const wordsEl = document.getElementById('section-words');
    const quoteEl = document.getElementById('section-quote');
    const btn     = document.getElementById('section-continue-btn');

    if (!overlay) { if (callback) callback(); return; }

    // Kelimeleri listele
    wordsEl.innerHTML = '';
    solvedWords.forEach(w => {
      const tag = document.createElement('div');
      tag.className   = 'section-word-tag';
      tag.textContent = w.toUpperCase();
      wordsEl.appendChild(tag);
    });

    // Özlü sözü seç
    const quote = findBestQuote(solvedWords);
    quoteEl.innerHTML = `"${quote.text}"<br><small style="font-size:10px;letter-spacing:2px;color:var(--ink-faded);font-style:normal;">— ${quote.author}</small>`;

    // Ekranı göster
    overlay.classList.add('active');

    // Devam butonu
    const continueHandler = () => {
      overlay.classList.remove('active');
      btn.removeEventListener('click', continueHandler);
      if (callback) callback();
    };
    btn.addEventListener('click', continueHandler);
  }

  return { show, findBestQuote };

})();
