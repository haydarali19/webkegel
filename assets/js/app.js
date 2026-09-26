/**
 * STIKES RSPAD Gatot Soebroto
 * Media Edukasi Digital Senam Kegel Ibu Hamil
 * Skrip Logika:
 * 1. Navigasi Bab & Perpindahan Halaman Halus (8 Bab)
 * 2. Kerangka Interaktif Pemutar Video Panduan Latihan
 * 3. Kuis Evaluasi Pemahaman Mandiri
 */

document.addEventListener('DOMContentLoaded', () => {
  initEditorialNavigation();
  initVideoGuide();
  initStationeryQuiz();
});

/* ==========================================================================
   1. NAVIGASI BAB & PERPINDAHAN KONTEN
   ========================================================================== */
function initEditorialNavigation() {
  const chapterButtons = document.querySelectorAll('.chapter-nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const jumpLinks = document.querySelectorAll('[data-target-tab]');

  function navigateToChapter(targetChapterId) {
    // Jeda otomatis pemutaran video jika pengguna berpindah ke bab lain
    if (targetChapterId !== 'latihan') {
      pausePracticeVideo();
    }

    // Perbarui tombol tab aktif
    chapterButtons.forEach(btn => {
      if (btn.dataset.tab === targetChapterId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Perbarui tampilan bab aktif
    tabPanes.forEach(pane => {
      if (pane.id === targetChapterId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Gulir halus ke atas agar pembaca berada di awal bab
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  chapterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navigateToChapter(btn.dataset.tab);
    });
  });

  jumpLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.targetTab;
      if (target) {
        navigateToChapter(target);
      }
    });
  });
}

/* ==========================================================================
   2. PEMUTAR VIDEO PANDUAN SENAM KEGEL & AUTO-PAUSE LOGIC
   ========================================================================== */
function pausePracticeVideo() {
  const iframe = document.getElementById('videoKegelIframe');
  const video = document.getElementById('videoKegel');

  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'pauseVideo',
          args: []
        }),
        '*'
      );
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'pauseVideo',
          args: ''
        }),
        '*'
      );
    } catch (err) {
      // ignore cross-origin error
    }
  }

  if (video && typeof video.pause === 'function') {
    try {
      video.pause();
    } catch (err) {
      // ignore
    }
  }
}

function initVideoGuide() {
  const iframe = document.getElementById('videoKegelIframe');
  const video = document.getElementById('videoKegel');
  const checkpointButtons = document.querySelectorAll('.checkpoint-chip');
  const latihanPane = document.getElementById('latihan');

  // Pengawas mutasi: pastikan video dijeda jika section latihan kehilangan kelas active
  if (latihanPane) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          if (!latihanPane.classList.contains('active')) {
            pausePracticeVideo();
          }
        }
      });
    });
    observer.observe(latihanPane, { attributes: true, attributeFilter: ['class'] });
  }

  // Jeda video otomatis saat tab browser diminimalkan atau disembunyikan
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pausePracticeVideo();
    }
  });

  if (!checkpointButtons.length) return;

  checkpointButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const timeInSeconds = parseFloat(btn.dataset.time);
      if (isNaN(timeInSeconds)) return;

      if (iframe) {
        try {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'seekTo',
              args: [timeInSeconds, true]
            }),
            '*'
          );
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'playVideo',
              args: []
            }),
            '*'
          );
        } catch (err) {
          // Fallback cross-origin
        }
        iframe.src = `https://www.youtube.com/embed/7RRdxxArYrk?enablejsapi=1&autoplay=1&start=${Math.floor(timeInSeconds)}`;
      } else if (video) {
        video.currentTime = timeInSeconds;
        video.play().catch(() => {});
      }
    });
  });
}

/* ==========================================================================
   3. KUIS EVALUASI PEMAHAMAN (5 SOAL BERSKOR OTOMATIS)
   ========================================================================== */
function initStationeryQuiz() {
  const quizData = [
    {
      question: "Apa yang dimaksud dengan inkontinensia urine?",
      choices: [
        "Kesulitan untuk tidur",
        "Keluarnya urine secara tidak terkendali",
        "Peningkatan frekuensi makan",
        "Nyeri pada kaki"
      ],
      correctIndex: 1,
      midwifeNote: "Inkontinensia urine adalah kondisi keluarnya urine secara tidak terkendali, terutama saat terjadi peningkatan tekanan intra abdomen seperti saat batuk, bersin, atau tertawa akibat kelemahan sfingter uretra dan otot dasar panggul."
    },
    {
      question: "Apa tujuan utama senam Kegel?",
      choices: [
        "Menguatkan otot lengan",
        "Menguatkan otot dasar panggul",
        "Mengurangi tinggi badan",
        "Melatih otot mata"
      ],
      correctIndex: 1,
      midwifeNote: "Senam Kegel dirancang khusus dengan tujuan utama memperkuat otot-otot dasar panggul (pelvic floor muscles) guna mendukung organ panggul dan mencegah kebocoran urine."
    },
    {
      question: "Mengapa tekanan intraabdomen dapat menyebabkan kebocoran urine?",
      choices: [
        "Mendorong kandung kemih",
        "Mengurangi ukuran kandung kemih",
        "Menghentikan kerja ginjal",
        "Mengurangi tekanan pada panggul"
      ],
      correctIndex: 0,
      midwifeNote: "Peningkatan tekanan intra abdomen (seperti saat batuk, bersin, atau aktivitas fisik) memberikan dorongan kuat pada kandung kemih. Jika sfingter uretra atau otot dasar panggul lemah, dorongan ini memicu keluarnya urine tidak terkendali."
    },
    {
      question: "Manakah tindakan di bawah ini yang merupakan KESALAHAN dan TIDAK boleh dilakukan secara rutin?",
      choices: [
        "Berlatih senam Kegel sambil berbaring miring ke kiri dengan bantal di antara kedua paha.",
        "Melakukan senam Kegel secara rutin di toilet setiap kali sedang buang air kecil.",
        "Bernapas secara santai dan wajar lewat hidung selama latihan.",
        "Melakukan 5 hingga 8 repetisi secara teratur 2–3 kali sehari."
      ],
      correctIndex: 1,
      midwifeNote: "Menghentikan aliran kencing di kloset hanya diperbolehkan sekali saja saat pertama kali belajar mengenali letak otot. Bila dilakukan secara rutin, hal ini dapat mengganggu refleks pengosongan kandung kemih dan meningkatkan risiko infeksi saluran kemih (ISK)."
    },
    {
      question: "Gejala manakah yang mengharuskan Bunda segera berkonsultasi ke bidan atau dokter kandungan?",
      choices: [
        "Sedikit tetesan air kencing saat batuk keras.",
        "Merasa lebih sering ingin buang air kecil dibanding sebelum hamil.",
        "Kencing terasa perih seperti terbakar, air kencing keruh atau berbau menyengat, disertai demam.",
        "Merasa otot panggul lebih nyaman setelah berlatih senam Kegel."
      ],
      correctIndex: 2,
      midwifeNote: "Rasa panas, perih, urine keruh, atau demam merupakan tanda infeksi saluran kemih (ISK) yang memerlukan pemeriksaan medis dan obat yang aman untuk kehamilan dari bidan atau dokter."
    }
  ];

  let currentIndex = 0;
  let scoreCount = 0;
  let hasAnswered = false;

  // Elemen DOM
  const questionText = document.getElementById('quizQuestionText');
  const optionsContainer = document.getElementById('quizOptionsList');
  const feedbackBox = document.getElementById('quizFeedback');
  const feedbackTitle = document.getElementById('quizFeedbackTitle');
  const feedbackText = document.getElementById('quizFeedbackText');
  const btnNext = document.getElementById('btnNextQuestion');
  const progressText = document.getElementById('quizProgressText');
  const progressFill = document.getElementById('quizProgressFill');

  const questionSection = document.getElementById('quizQuestionSection');
  const resultsCard = document.getElementById('quizResultsCard');
  const scoreDisplay = document.getElementById('quizScoreDisplay');
  const badgeReward = document.getElementById('quizBadgeReward');
  const resultMessage = document.getElementById('quizResultMessage');
  const btnRestart = document.getElementById('btnRestartQuiz');

  function renderQuestion(idx) {
    hasAnswered = false;
    const item = quizData[idx];

    questionText.textContent = `${idx + 1}. ${item.question}`;
    progressText.textContent = `Pertanyaan ${idx + 1} dari ${quizData.length}`;
    progressFill.style.width = `${((idx + 1) / quizData.length) * 100}%`;

    feedbackBox.style.display = 'none';
    btnNext.style.display = 'none';

    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    item.choices.forEach((choiceStr, choiceIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-row-btn';
      btn.innerHTML = `
        <span class="choice-letter">${letters[choiceIdx]}.</span>
        <span class="choice-content">${choiceStr}</span>
      `;
      btn.addEventListener('click', () => handleChoiceSelect(choiceIdx, btn));
      optionsContainer.appendChild(btn);
    });
  }

  function handleChoiceSelect(pickedIdx, btnEl) {
    if (hasAnswered) return;
    hasAnswered = true;

    const currentItem = quizData[currentIndex];
    const buttons = optionsContainer.querySelectorAll('.choice-row-btn');
    buttons.forEach(b => b.disabled = true);

    const isCorrect = (pickedIdx === currentItem.correctIndex);

    if (isCorrect) {
      scoreCount++;
      btnEl.classList.add('correct-pick');
      feedbackTitle.textContent = 'Jawaban Tepat';
    } else {
      btnEl.classList.add('wrong-pick');
      buttons[currentItem.correctIndex].classList.add('correct-pick');
      feedbackTitle.textContent = 'Pembahasan Jawaban:';
    }

    feedbackText.textContent = currentItem.midwifeNote;
    feedbackBox.style.display = 'block';

    if (currentIndex < quizData.length - 1) {
      btnNext.innerHTML = 'Pertanyaan Berikutnya &rarr;';
    } else {
      btnNext.innerHTML = 'Lihat Hasil Kuis &rarr;';
    }
    btnNext.style.display = 'inline-flex';
  }

  btnNext.addEventListener('click', () => {
    if (currentIndex < quizData.length - 1) {
      currentIndex++;
      renderQuestion(currentIndex);
    } else {
      showFinalResults();
    }
  });

  function showFinalResults() {
    questionSection.style.display = 'none';
    resultsCard.style.display = 'block';

    const percentage = Math.round((scoreCount / quizData.length) * 100);
    scoreDisplay.textContent = `${percentage}%`;

    if (percentage === 100) {
      badgeReward.textContent = 'Luar Biasa, Bunda Paham Sepenuhnya!';
      resultMessage.textContent = 'Keren sekali, Bunda! Semua prinsip dasar panggul dan teknik latihan yang aman sudah Bunda kuasai. Sekarang tinggal menjadikannya kebiasaan kecil yang menyenangkan setiap hari di rumah.';
    } else if (percentage >= 80) {
      badgeReward.textContent = 'Pemahaman Bunda Sudah Bagus Sekali';
      resultMessage.textContent = 'Bagus sekali! Bunda sudah menguasai poin-poin terpenting dalam menjaga kesehatan panggul. Sedikit kekeliruan tadi wajar sekali, jadikan catatan ini pedoman saat mulai latihan mandiri ya.';
    } else if (percentage >= 60) {
      badgeReward.textContent = 'Sudah di Jalur yang Tepat';
      resultMessage.textContent = 'Bunda sudah menangkap gambaran utamanya. Luangkan waktu 2 menit untuk membaca kembali bab Anjuran & Pantangan agar latihan Bunda semakin mantap dan bebas ragu.';
    } else {
      badgeReward.textContent = 'Yuk, Baca Santai Sekali Lagi';
      resultMessage.textContent = 'Tidak apa-apa, Bun! Namanya juga belajar hal baru tentang tubuh sendiri. Silakan tonton kembali video panduan gerakan dan baca bab anjuran, lalu coba kuis ini lagi kapan saja ya.';
    }
  }

  function restartQuiz() {
    currentIndex = 0;
    scoreCount = 0;
    questionSection.style.display = 'block';
    resultsCard.style.display = 'none';
    renderQuestion(0);
  }

  btnRestart.addEventListener('click', restartQuiz);

  renderQuestion(0);
}
