/**
 * Ruang Panggul Ibu - Panduan Mandiri Senam Kegel Kehamilan
 * Skrip Logika:
 * 1. Navigasi Bab & Perpindahan Halaman Halus
 * 2. Sketsa Interaktif Anatomi Panggul
 * 3. Timer Senam Kegel dengan Animasi Denyut Napas & Nada Suara Lembut
 * 4. Kuis Evaluasi Pemahaman Mandiri
 */

document.addEventListener('DOMContentLoaded', () => {
  initEditorialNavigation();
  initAnatomySketch();
  initMindfulTimer();
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
   2. ANATOMI SKETSA PANGGUL INTERAKTIF (BEBAS BORDER HITAM)
   ========================================================================== */
function initAnatomySketch() {
  const sketchParts = document.querySelectorAll('.sketch-part');
  const chips = document.querySelectorAll('.chip-btn');
  const journalCards = document.querySelectorAll('.journal-entry-card');

  function spotlightOrgan(organKey) {
    // Sorot elemen gambar
    sketchParts.forEach(part => {
      if (part.dataset.organ === organKey) {
        part.classList.add('active');
      } else {
        part.classList.remove('active');
      }
    });

    // Sorot tombol chip
    chips.forEach(chip => {
      if (chip.dataset.organ === organKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Tampilkan kartu penjelasan
    journalCards.forEach(card => {
      if (card.dataset.organ === organKey) {
        card.classList.add('active-entry');
      } else {
        card.classList.remove('active-entry');
      }
    });
  }

  sketchParts.forEach(part => {
    part.addEventListener('click', () => {
      spotlightOrgan(part.dataset.organ);
    });
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      spotlightOrgan(chip.dataset.organ);
    });
  });
}

/* ==========================================================================
   3. TIMER SENAM KEGEL INTERAKTIF (DENYUT NAPAS & NADA LEMBUT)
   ========================================================================== */
function initMindfulTimer() {
  const RHYTHMS = {
    pemula: { contract: 3, relax: 4, reps: 5, label: 'Pemula' },
    menengah: { contract: 5, relax: 5, reps: 8, label: 'Standar' },
    lanjutan: { contract: 8, relax: 8, reps: 10, label: 'Lanjutan' }
  };

  let currentRhythm = { ...RHYTHMS.pemula };
  let timerState = 'idle'; // 'idle', 'running', 'paused', 'completed'
  let currentPhase = 'contract'; // 'contract' atau 'relax'
  let currentRep = 1;
  let remainingSeconds = currentRhythm.contract;
  let timerInterval = null;
  let isMuted = false;

  // Elemen DOM
  const pebble = document.getElementById('pulseCircle');
  const phaseBadge = document.getElementById('phaseBadge');
  const countdownNumber = document.getElementById('timerCountdown');
  const instructionWhisper = document.getElementById('timerInstruction');
  const repStatusText = document.getElementById('repStatusText');
  const repDotsContainer = document.getElementById('repDotsContainer');

  const btnStart = document.getElementById('btnStartTimer');
  const btnPause = document.getElementById('btnPauseTimer');
  const btnReset = document.getElementById('btnResetTimer');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const presetPills = document.querySelectorAll('.rhythm-pill');

  // Pengatur Kustom
  const customSection = document.getElementById('customTimerSettings');
  const contractRange = document.getElementById('contractRange');
  const relaxRange = document.getElementById('relaxRange');
  const repsRange = document.getElementById('repsRange');
  const valContract = document.getElementById('valContract');
  const valRelax = document.getElementById('valRelax');
  const valReps = document.getElementById('valReps');

  // Audio Context untuk nada lembut (Web Audio API)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playMindfulChime(type) {
    if (isMuted) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      if (type === 'contract') {
        // Nada lembut naik menandakan mulai mengencangkan otot
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.3);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'relax') {
        // Nada lembut turun menandakan saatnya melemaskan otot
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now);
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.35);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'complete') {
        // Nada harmoni selesai
        const chord = [261.63, 329.63, 392.00, 523.25];
        chord.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          const startTime = now + (idx * 0.12);
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.09, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.85);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.85);
        });
      }
    } catch (e) {
      console.warn('Audio note error:', e);
    }
  }

  function renderDots() {
    repDotsContainer.innerHTML = '';
    for (let i = 1; i <= currentRhythm.reps; i++) {
      const dot = document.createElement('div');
      dot.className = 'ribbon-dot';
      if (i < currentRep || timerState === 'completed') {
        dot.classList.add('done');
      } else if (i === currentRep) {
        dot.classList.add('active-now');
      }
      repDotsContainer.appendChild(dot);
    }

    if (timerState === 'completed') {
      repStatusText.textContent = `Latihan Selesai: ${currentRhythm.reps} siklus tuntas`;
    } else {
      repStatusText.textContent = `Siklus ${currentRep} dari ${currentRhythm.reps}`;
    }
  }

  function updateVisuals() {
    countdownNumber.textContent = remainingSeconds;

    if (timerState === 'completed') {
      pebble.className = 'organic-pebble completed';
      phaseBadge.className = 'pebble-phase-tag';
      phaseBadge.textContent = 'SELESAI';
      instructionWhisper.textContent = 'Luar biasa, Bunda! Latihan hari ini telah selesai.';
      btnStart.style.display = 'none';
      btnPause.style.display = 'none';
      return;
    }

    if (currentPhase === 'contract') {
      pebble.className = 'organic-pebble contracting';
      phaseBadge.className = 'pebble-phase-tag tag-contract';
      phaseBadge.textContent = 'TAHAN & ANGKAT';
      instructionWhisper.textContent = 'Kencangkan otot panggul perlahan ke arah dalam...';
    } else {
      pebble.className = 'organic-pebble relaxing';
      phaseBadge.className = 'pebble-phase-tag tag-relax';
      phaseBadge.textContent = 'LEPAS & RILEKS';
      instructionWhisper.textContent = 'Lepaskan sepenuhnya, biarkan panggul lemas...';
    }
    renderDots();
  }

  function stepTimer() {
    if (remainingSeconds > 1) {
      remainingSeconds--;
      countdownNumber.textContent = remainingSeconds;
    } else {
      if (currentPhase === 'contract') {
        currentPhase = 'relax';
        remainingSeconds = currentRhythm.relax;
        playMindfulChime('relax');
        updateVisuals();
      } else {
        if (currentRep < currentRhythm.reps) {
          currentRep++;
          currentPhase = 'contract';
          remainingSeconds = currentRhythm.contract;
          playMindfulChime('contract');
          updateVisuals();
        } else {
          finishTimer();
        }
      }
    }
  }

  function startTimer() {
    initAudio();
    if (timerState === 'idle' || timerState === 'completed') {
      currentRep = 1;
      currentPhase = 'contract';
      remainingSeconds = currentRhythm.contract;
      playMindfulChime('contract');
    }
    timerState = 'running';
    updateVisuals();

    btnStart.style.display = 'none';
    btnPause.style.display = 'inline-flex';
    btnPause.textContent = 'Jeda Latihan';

    clearInterval(timerInterval);
    timerInterval = setInterval(stepTimer, 1000);
  }

  function pauseTimer() {
    if (timerState === 'running') {
      clearInterval(timerInterval);
      timerState = 'paused';
      btnPause.textContent = 'Lanjutkan Latihan';
      instructionWhisper.textContent = 'Latihan dijeda sejenak. Bernapaslah santai.';
    } else if (timerState === 'paused') {
      timerState = 'running';
      btnPause.textContent = 'Jeda Latihan';
      if (currentPhase === 'contract') {
        instructionWhisper.textContent = 'Kencangkan otot panggul perlahan ke arah dalam...';
      } else {
        instructionWhisper.textContent = 'Lepaskan sepenuhnya, biarkan panggul lemas...';
      }
      clearInterval(timerInterval);
      timerInterval = setInterval(stepTimer, 1000);
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerState = 'idle';
    currentRep = 1;
    currentPhase = 'contract';
    remainingSeconds = currentRhythm.contract;

    pebble.className = 'organic-pebble';
    phaseBadge.className = 'pebble-phase-tag';
    phaseBadge.textContent = 'SIAP LATIHAN';
    instructionWhisper.textContent = "Klik 'Mulai Latihan' saat Bunda telah siap.";
    countdownNumber.textContent = currentRhythm.contract;

    btnStart.style.display = 'inline-flex';
    btnPause.style.display = 'none';

    renderDots();
  }

  function finishTimer() {
    clearInterval(timerInterval);
    timerState = 'completed';
    playMindfulChime('complete');
    updateVisuals();
  }

  // Pengaturan Preset
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.dataset.preset;
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      if (key === 'custom') {
        customSection.style.display = 'block';
        currentRhythm = {
          contract: parseInt(contractRange.value, 10),
          relax: parseInt(relaxRange.value, 10),
          reps: parseInt(repsRange.value, 10),
          label: 'Kustom'
        };
      } else {
        customSection.style.display = 'none';
        currentRhythm = { ...RHYTHMS[key] };
      }
      resetTimer();
    });
  });

  // Listener Slider Kustom
  function handleCustomRange() {
    valContract.textContent = contractRange.value;
    valRelax.textContent = relaxRange.value;
    valReps.textContent = repsRange.value;

    currentRhythm.contract = parseInt(contractRange.value, 10);
    currentRhythm.relax = parseInt(relaxRange.value, 10);
    currentRhythm.reps = parseInt(repsRange.value, 10);

    resetTimer();
  }

  if (contractRange && relaxRange && repsRange) {
    contractRange.addEventListener('input', handleCustomRange);
    relaxRange.addEventListener('input', handleCustomRange);
    repsRange.addEventListener('input', handleCustomRange);
  }

  // Tombol Toggle Suara
  btnSoundToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      btnSoundToggle.classList.add('muted');
      btnSoundToggle.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        Nada Senyap
      `;
    } else {
      btnSoundToggle.classList.remove('muted');
      btnSoundToggle.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        Nada Suara Aktif
      `;
    }
  });

  btnStart.addEventListener('click', startTimer);
  btnPause.addEventListener('click', pauseTimer);
  btnReset.addEventListener('click', resetTimer);

  resetTimer();
}

/* ==========================================================================
   4. KUIS EVALUASI PEMAHAMAN (5 SOAL BERSKOR OTOMATIS)
   ========================================================================== */
function initStationeryQuiz() {
  const quizData = [
    {
      question: "Mengapa ibu hamil pada trimester 2 dan 3 lebih mudah mengalami keluarnya tetesan air kencing saat batuk atau tertawa?",
      choices: [
        "Karena konsumsi air putih ibu hamil terlalu banyak.",
        "Pengaruh hormon relaksin yang melunakkan katup kemih serta beban rahim yang menekan kandung kemih dari atas.",
        "Karena posisi kandung kemih berpindah tempat.",
        "Akibat ibu hamil terlalu sering berjalan kaki."
      ],
      correctIndex: 1,
      midwifeNote: "Hormon relaksin melunakkan jaringan jalan lahir sekaligus membuat katup saluran kemih sedikit meregang. Bersamaan dengan membesarnya ukuran janin, tekanan mendadak seperti batuk atau tawa mudah memicu rembesan air seni bila otot panggul tidak dilatih."
    },
    {
      question: "Bagaimana cara merasakan kontraksi otot dasar panggul yang benar saat melakukan senam Kegel?",
      choices: [
        "Membayangkan sensasi menahan buang angin atau pipis (otot terangkat ke arah dalam), tanpa mengeraskan perut atau meremas paha.",
        "Menahan napas kuat-kuat di tenggorokan lalu menekan perut ke arah bawah.",
        "Menjepit kedua paha dan meremas pantat sekuat tenaga.",
        "Menekan bagian pusar dengan kedua tangan sembari membungkuk."
      ],
      correctIndex: 0,
      midwifeNote: "Kunci senam Kegel yang tepat adalah mengisolasi otot dasar panggul. Dinding perut, paha, dan pantat harus tetap lemas. Bila perut mengeras atau paha menjepit, artinya Bunda masih menggunakan otot luar tubuh."
    },
    {
      question: "Mengapa fase relaksasi (melepaskan otot) sama pentingnya dengan fase mengencangkan otot?",
      choices: [
        "Hanya agar waktu latihan terasa lebih santai.",
        "Agar otot panggul tidak perlu dilatih secara rutin.",
        "Agar otot tidak kaku berlebih dan tetap lentur saat membuka jalan lahir pada proses persalinan nanti.",
        "Supaya ibu hamil bisa langsung tertidur setelah latihan."
      ],
      correctIndex: 2,
      midwifeNote: "Otot panggul yang sehat adalah otot yang mampu mengencang kuat namun juga bisa membuka lebar secara rileks. Otot yang terus tegang kaku tanpa relaksasi justru dapat menyulitkan kepala bayi turun saat persalinan."
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
      resultMessage.textContent = 'Tidak apa-apa, Bun! Namanya juga belajar hal baru tentang tubuh sendiri. Silakan intip kembali gambar anatomi dan panduan gerakan, lalu coba kuis ini lagi kapan saja ya.';
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
