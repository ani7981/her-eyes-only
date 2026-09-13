/**
 * Her Eyes Only — Application Orchestrator & UI Controller
 */

class AppController {
  constructor() {
    this.config = window.HER_EYES_CONFIG || {};
    this.eyeTracker = null;
    this.currentStage = 1; // 1: Lock Screen, 2: Camera Scan, 3: Scrapbook Reveal
    this.counterInterval = null;
    this.floatingHeartInterval = null;
  }

  init() {
    // Populate dynamic text and sections from config
    this.populateConfigData();
    this.renderMilestones();
    this.renderGallery();
    this.renderLetter();

    // Start Live Anniversary Timer
    this.startLiveCounter();

    // Setup Event Handlers
    this.setupEventListeners();
  }

  populateConfigData() {
    const couple = this.config.couple || {};
    const terminal = this.config.terminal || {};

    // Terminal stage
    const subtextEl = document.getElementById('hud-subtext');
    if (subtextEl && terminal.subtext) subtextEl.innerText = terminal.subtext;

    // Scrapbook stage
    const heroTitleEl = document.getElementById('scrapbook-hero-title');
    if (heroTitleEl && couple.heroTitle) heroTitleEl.innerHTML = couple.heroTitle;

    const heroSubtitleEl = document.getElementById('scrapbook-hero-subtitle');
    if (heroSubtitleEl && couple.heroSubtitle) heroSubtitleEl.innerText = couple.heroSubtitle;

    const stickyNoteEl = document.getElementById('scrapbook-sticky-note');
    if (stickyNoteEl && couple.stickyNote) stickyNoteEl.innerText = couple.stickyNote;
  }

  // ========================================================
  // LIVE ANNIVERSARY COUNTER (Ticking every second)
  // ========================================================
  startLiveCounter() {
    const startDateStr = (this.config.couple && this.config.couple.anniversaryDate) || '2024-03-12T19:00:00';
    const startDate = new Date(startDateStr);

    const updateCounter = () => {
      const now = new Date();
      const diff = Math.max(0, now - startDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const elDays = document.getElementById('counter-days');
      const elHours = document.getElementById('counter-hours');
      const elMinutes = document.getElementById('counter-minutes');
      const elSeconds = document.getElementById('counter-seconds');

      if (elDays) elDays.innerText = days;
      if (elHours) elHours.innerText = hours;
      if (elMinutes) elMinutes.innerText = minutes;
      if (elSeconds) elSeconds.innerText = seconds < 10 ? '0' + seconds : seconds;
    };

    updateCounter();
    this.counterInterval = setInterval(updateCounter, 1000);
  }

  // ========================================================
  // RENDER DYNAMIC SECTIONS (Milestones, Gallery, Letter)
  // ========================================================
  renderMilestones() {
    const container = document.getElementById('timeline-milestones-container');
    if (!container) return;

    const milestones = this.config.milestones || [];
    container.innerHTML = milestones.map((m, index) => {
      const isSpecial = index === milestones.length - 1;
      return `
        <div class="relative flex items-start gap-4 sm:gap-8 mb-10 group">
          <!-- Pin Badge -->
          <div class="w-12 sm:w-16 flex items-center justify-center flex-shrink-0 z-10">
            <div class="w-10 h-10 rounded-full ${isSpecial ? 'bg-crimson-ink text-white border-2 border-white shadow-lg ring-4 ring-rose-200' : 'bg-white border-2 border-crimson-ink text-crimson-ink shadow-md'} flex items-center justify-center font-hand font-bold text-sm group-hover:scale-110 transition-transform">
              ${m.id}
            </div>
          </div>
          <!-- Milestone Card -->
          <div class="flex-1 ${isSpecial ? 'bg-gradient-to-r from-rose-50/80 to-white border-2 border-rose-300' : 'bg-white border border-rose-200/80'} p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-all relative overflow-visible">
            <div class="washi-tape-strip -top-3 ${index % 2 === 0 ? 'right-8 rotate-2' : 'left-8 -rotate-2'} w-20 h-5 bg-pink-300/80"></div>
            
            <div class="flex items-baseline justify-between border-b border-rose-100 pb-2 mb-3">
              <h3 class="font-serif text-xl sm:text-2xl font-bold text-crimson-ink">${m.title}</h3>
              <span class="font-mono text-xs text-rose-500 font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/60">${m.date}</span>
            </div>

            <!-- Preview Photo -->
            <div class="aspect-[16/9] sm:aspect-[2/1] rounded-lg overflow-hidden bg-rose-50 border border-rose-100 relative group-hover:scale-[1.01] transition-transform duration-300 shadow-inner cursor-pointer" onclick="app.openMilestoneLightbox(${index})">
              <img src="${m.image}" alt="${m.title}" class="w-full h-full object-cover">
              <div class="absolute -right-2 -bottom-2 z-20 bg-[#fff3f6] border border-rose-200 rounded px-2.5 py-1 text-xs font-hand text-crimson-ink font-bold rotate-6 shadow-sm select-none">
                <span class="text-rose-500 mr-1">★</span>${m.badge}
              </div>
            </div>

            <!-- Caption -->
            <div class="mt-3 flex items-center justify-between text-left">
              <p class="font-hand text-xl sm:text-2xl text-rose-900 font-bold leading-tight">${m.caption}</p>
              <span class="hidden sm:inline-block font-hand text-xs text-rose-400 font-semibold">${m.tag}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderGallery() {
    const container = document.getElementById('gallery-grid-container');
    if (!container) return;

    const items = this.config.gallery || [];
    container.innerHTML = items.map((item, idx) => `
      <div class="gallery-item polaroid-frame p-3 pb-5 rounded bg-white ${item.rotate} border border-rose-100 relative cursor-pointer" data-category="${item.category}" onclick="app.openGalleryLightbox(${idx})">
        <div class="washi-tape-strip -top-3 ${idx % 2 === 0 ? 'left-4 rotate-2' : 'right-4 -rotate-4'} w-14 h-4 bg-pink-300/80"></div>
        <div class="aspect-square overflow-hidden bg-rose-50 mb-2 rounded-xs">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <p class="font-hand text-lg text-center text-rose-900 font-bold">${item.title}</p>
        <span class="block text-center font-mono text-[9px] text-rose-400">${item.date}</span>
      </div>
    `).join('');
  }
        <div class="washi-tape-strip -top-3 ${idx % 2 === 0 ? 'left-4 rotate-2' : 'right-4 -rotate-4'} w-14 h-4 bg-pink-300/80"></div>
        <div class="aspect-square overflow-hidden bg-rose-50 mb-2 rounded-xs">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <p class="font-hand text-lg text-center text-rose-900 font-bold">${item.title}</p>
        <span class="block text-center font-mono text-[9px] text-rose-400">${item.date}</span>
      </div>
    `).join('');
  }

  renderLetter() {
    const container = document.getElementById('letter-content-container');
    if (!container) return;

    const letter = this.config.letter || {};
    const paragraphsHtml = (letter.paragraphs || []).map((p, idx) => {
      if (idx === 1) {
        return `<p class="bg-rose-50/70 p-4 rounded-xl border-l-3 border-crimson-ink/40">${p}</p>`;
      }
      return `<p>${p}</p>`;
    }).join('');

    container.innerHTML = `
      <p class="text-3xl sm:text-4xl text-crimson-ink font-bold">${letter.salutation || 'Hey,'}</p>
      ${paragraphsHtml}
      <div class="pt-4">
        <div class="mt-4 flex flex-col items-end mr-4 sm:mr-10">
          <span class="font-hand text-2xl text-rose-900">${letter.closing || 'Always,'}</span>
          <span class="font-hand text-4xl text-crimson-ink font-bold mt-1">${letter.signature || 'Me'}</span>
        </div>
      </div>
    `;
  }

  // ========================================================
  // EVENT LISTENERS & NAVIGATION
  // ========================================================
  setupEventListeners() {
    // Primary Scan Trigger
    const btnScan = document.getElementById('btn-scan-trigger');
    if (btnScan) {
      btnScan.addEventListener('click', () => this.openCameraModal());
    }

    // Modal Close Button
    const btnCloseModal = document.getElementById('btn-close-scanner');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => this.closeCameraModal());
    }

    // Test Access Denied Button
    const btnTestDenied = document.getElementById('btn-test-denied');
    if (btnTestDenied) {
      btnTestDenied.addEventListener('click', () => {
        if (this.eyeTracker) {
          this.eyeTracker.triggerDenied();
        }
      });
    }

    // Bypass / Instant Match Button
    const btnBypass = document.getElementById('btn-bypass-verify');
    if (btnBypass) {
      btnBypass.addEventListener('click', () => {
        if (this.eyeTracker) {
          this.eyeTracker.triggerSuccess(
            { x: 120, y: 140, width: 90, height: 60 },
            { x: 260, y: 140, width: 90, height: 60 },
            { x: 165, y: 170 },
            { x: 305, y: 170 }
          );
        }
      });
    }

    // Try Again on Denied Modal Button
    const btnTryAgain = document.getElementById('btn-try-again');
    if (btnTryAgain) {
      btnTryAgain.addEventListener('click', () => this.resetScanner());
    }

    // Gallery Category Filtering Pills
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        filterBtns.forEach(b => {
          b.classList.remove('bg-[#d43d63]', 'text-white');
          b.classList.add('bg-rose-100/90', 'text-crimson-ink');
        });
        btn.classList.remove('bg-rose-100/90', 'text-crimson-ink');
        btn.classList.add('bg-[#d43d63]', 'text-white');

        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (cat === 'all' || itemCat === cat) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Music Floating Button
    const musicBtn = document.getElementById('music-toggle-btn');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        if (window.soundController) {
          window.soundController.toggleRomanticMusic();
        }
      });
    }
  }

  // ========================================================
  // STAGE 2: CAMERA VIEWFINDER & EYE SCANNING MODAL
  // ========================================================
  openCameraModal() {
    const modal = document.getElementById('camera-scan-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const videoEl = document.getElementById('scanner-video');
    const canvasEl = document.getElementById('scanner-canvas');

    // Reset UI indicators
    this.resetScannerUI();

    // Start Eye Tracker Engine
    if (!this.eyeTracker) {
      this.eyeTracker = new window.EyeTracker();
    }

    this.eyeTracker.init(videoEl, canvasEl, {
      onProgress: (progress, data) => this.handleScanProgress(progress, data),
      onSuccess: () => this.handleScanSuccess(),
      onFailure: (msg) => this.handleScanFailure(msg)
    });
  }

  closeCameraModal() {
    const modal = document.getElementById('camera-scan-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (this.eyeTracker) {
      this.eyeTracker.stop();
    }
  }

  resetScannerUI() {
    const deniedBox = document.getElementById('modal-denied-alert');
    const successBox = document.getElementById('modal-success-alert');
    const hudFrame = document.getElementById('scanner-viewfinder-frame');
    const progressFill = document.getElementById('scan-progress-bar');
    const progressPercent = document.getElementById('scan-progress-percent');
    const telemetryStatus = document.getElementById('telemetry-status-text');

    if (deniedBox) deniedBox.classList.add('hidden');
    if (successBox) successBox.classList.add('hidden');
    if (hudFrame) hudFrame.classList.remove('glitching', 'border-red-500', 'border-emerald-500');
    if (progressFill) progressFill.style.width = '0%';
    if (progressPercent) progressPercent.innerText = '0%';
    if (telemetryStatus) telemetryStatus.innerText = 'ALIGN EYES WITH RECTANGLES';
  }

  resetScanner() {
    this.resetScannerUI();
    if (this.eyeTracker) {
      this.eyeTracker.reset();
    }
  }

  handleScanProgress(progress, data) {
    const progressFill = document.getElementById('scan-progress-bar');
    const progressPercent = document.getElementById('scan-progress-percent');
    const telemetryStatus = document.getElementById('telemetry-status-text');
    const coordLeft = document.getElementById('telemetry-coord-left');
    const coordRight = document.getElementById('telemetry-coord-right');
    const confidenceEl = document.getElementById('telemetry-confidence');

    if (progressFill) progressFill.style.width = `${Math.min(100, Math.round(progress))}%`;
    if (progressPercent) progressPercent.innerText = `${Math.min(100, Math.round(progress))}%`;

    if (data.isLookingForward) {
      if (telemetryStatus) telemetryStatus.innerText = 'LOCKING RETINA... HOLD GAZE';
    } else {
      if (telemetryStatus) telemetryStatus.innerText = 'PLEASE LOOK DIRECTLY AT CAMERA';
    }

    if (data.leftPupil && coordLeft) {
      coordLeft.innerText = `[${Math.round(data.leftPupil.x)}, ${Math.round(data.leftPupil.y)}]`;
    }
    if (data.rightPupil && coordRight) {
      coordRight.innerText = `[${Math.round(data.rightPupil.x)}, ${Math.round(data.rightPupil.y)}]`;
    }
    if (confidenceEl && data.confidence) {
      confidenceEl.innerText = `${data.confidence}%`;
    }
  }

  handleScanSuccess() {
    const successBox = document.getElementById('modal-success-alert');
    const hudFrame = document.getElementById('scanner-viewfinder-frame');
    const telemetryStatus = document.getElementById('telemetry-status-text');

    if (successBox) successBox.classList.remove('hidden');
    if (hudFrame) {
      hudFrame.classList.remove('border-red-500');
      hudFrame.classList.add('border-emerald-500', 'shadow-[0_0_60px_rgba(34,197,94,0.6)]');
    }
    if (telemetryStatus) {
      telemetryStatus.innerText = '✅ BIOMETRIC MATCH CONFIRMED';
      telemetryStatus.className = 'text-emerald-400 font-bold';
    }

    // After 1.3s, trigger vault door unlock & reveal Stage 3!
    setTimeout(() => {
      this.triggerUnlockTransition();
    }, 1300);
  }

  handleScanFailure(customMsg) {
    const deniedBox = document.getElementById('modal-denied-alert');
    const hudFrame = document.getElementById('scanner-viewfinder-frame');
    const telemetryStatus = document.getElementById('telemetry-status-text');

    if (deniedBox) deniedBox.classList.remove('hidden');
    if (hudFrame) {
      hudFrame.classList.add('glitching', 'border-red-500');
    }
    if (telemetryStatus) {
      telemetryStatus.innerText = '❌ ACCESS DENIED: UNKNOWN SUBJECT';
      telemetryStatus.className = 'text-red-500 font-bold';
    }

    setTimeout(() => {
      if (hudFrame) hudFrame.classList.remove('glitching');
    }, 600);
  }

  // ========================================================
  // STAGE 3: THE REVEAL (Vault Unlock + Scrapbook + Music)
  // ========================================================
  triggerUnlockTransition() {
    const lockScreen = document.getElementById('stage-lockscreen');
    const scrapbook = document.getElementById('stage-scrapbook');
    const modal = document.getElementById('camera-scan-modal');

    // Stop eye tracking webcam
    if (this.eyeTracker) {
      this.eyeTracker.stop();
    }

    // Close camera modal with vault wipe animation
    if (modal) {
      modal.classList.add('vault-wipe');
    }

    setTimeout(() => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'vault-wipe');
      }
      if (lockScreen) lockScreen.classList.add('hidden');
      if (scrapbook) scrapbook.classList.remove('hidden');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Burst of soft petals & confetti!
      this.triggerConfetti();

      // Start Romantic Music Synthesizer
      if (window.soundController) {
        window.soundController.startRomanticMusic();
      }

      // Start background floating hearts
      this.startFloatingHearts();
    }, 900);
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        colors: ['#e8748d', '#f8bbd0', '#ffccd5', '#d43d63', '#fff0f3', '#f7d070']
      };

      const fire = (particleRatio, opts) => {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }

  startFloatingHearts() {
    if (this.floatingHeartInterval) clearInterval(this.floatingHeartInterval);

    const emojis = ['♡', '✨', '🌸', '💖', '🧸', '🌷'];
    this.floatingHeartInterval = setInterval(() => {
      const heart = document.createElement('div');
      heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      heart.className = 'fixed pointer-events-none text-rose-400 font-hand z-50 text-2xl floating-heart';
      heart.style.left = `${Math.random() * 90 + 5}vw`;
      heart.style.top = `${Math.random() * 80 + 10}vh`;
      heart.style.animationDuration = `${3 + Math.random() * 2.5}s`;

      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 5000);
    }, 1800);
  }

  // ========================================================
  // POLAROID LIGHTBOX MODAL
  // ========================================================
  openLightbox(imageUrl, title, date, caption) {
    const modal = document.getElementById('polaroid-lightbox-modal');
    const imgEl = document.getElementById('lightbox-image');
    const titleEl = document.getElementById('lightbox-title');
    const dateEl = document.getElementById('lightbox-date');
    const captionEl = document.getElementById('lightbox-caption');

    if (!modal) return;

    if (imgEl) imgEl.src = imageUrl;
    if (titleEl) titleEl.innerText = title;
    if (dateEl) dateEl.innerText = date;
    if (captionEl) captionEl.innerText = caption;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeLightbox() {
    const modal = document.getElementById('polaroid-lightbox-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  openMilestoneLightbox(index) {
    const m = (this.config.milestones || [])[index];
    if (m) this.openLightbox(m.image, m.title, m.date, m.caption);
  }

  openGalleryLightbox(index) {
    const item = (this.config.gallery || [])[index];
    if (item) this.openLightbox(item.image, item.title, item.date, item.tag);
  }

  // Quick State Switcher (Dev & Testing)
  switchStage(stage) {
    if (stage === 1) {
      this.closeCameraModal();
      const lockScreen = document.getElementById('stage-lockscreen');
      const scrapbook = document.getElementById('stage-scrapbook');
      if (lockScreen) lockScreen.classList.remove('hidden');
      if (scrapbook) scrapbook.classList.add('hidden');
      if (window.soundController) window.soundController.stopRomanticMusic();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (stage === 2) {
      const lockScreen = document.getElementById('stage-lockscreen');
      const scrapbook = document.getElementById('stage-scrapbook');
      if (lockScreen) lockScreen.classList.remove('hidden');
      if (scrapbook) scrapbook.classList.add('hidden');
      this.openCameraModal();
    } else if (stage === 'denied') {
      this.openCameraModal();
      setTimeout(() => {
        if (this.eyeTracker) this.eyeTracker.triggerDenied();
      }, 500);
    } else if (stage === 3) {
      this.closeCameraModal();
      const lockScreen = document.getElementById('stage-lockscreen');
      const scrapbook = document.getElementById('stage-scrapbook');
      if (lockScreen) lockScreen.classList.add('hidden');
      if (scrapbook) scrapbook.classList.remove('hidden');
      this.triggerConfetti();
      if (window.soundController) window.soundController.startRomanticMusic();
      this.startFloatingHearts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

window.app = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
