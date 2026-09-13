# Her Eyes Only ♡ — 1-Year Anniversary Web Experience

A high-tech secret agent biometric lockscreen that opens into a tactile pink romantic anniversary scrapbook, decryptable only when she looks into the camera.

---

## ✨ Features

### 🔒 Stage 1: Secret Agent Lock Screen
- **Spy-thriller terminal HUD**: Monospace telemetry logs, CRT scanlines, rotating radar reticle, classified badges, and laser sweeps.
- **Biometric Challenge**: *"TOP SECRET: CLEARANCE LEVEL — 1-YEAR ANNIVERSARY / Her Eyes Only."*

### 👁️ Stage 2: Camera Viewfinder & Real-Time Eye Tracking
- **Webcam Integration**: Mirror-view front camera feed with low-latency client-side landmark tracking.
- **Biometric Eye Rectangles**: Real-time **neon green bounding boxes** rendered around both eyes with targeting brackets, crosshairs, interpupillary distance, and coordinate telemetry.
- **Gaze Detection**: Confirms she is looking into the camera to fill the biometric authorization meter (0% → 100%).
- **Humorous Access Denied**: Testable state that triggers a red glitch flash with:  
  *`"❌ ACCESS DENIED: Nice try, stranger! But you are not the love of his life."`*
- **Biometric Match Transition**: Flashes emerald green with sound effect and triggers a vault door unlock wipe.

### 🌸 Stage 3: The Reveal (Tactile Pink Scrapbook)
- **Smooth Continuous Scrolling**: 4 full-height sections designed with distressed craft paper textures, realistic torn deckle edges, washi tape, and 3D wax seals:
  1. **Hero Section**: Headline *"365 Days of Us ♡"*, quote, polaroid, and **live ticking elapsed counter** (Days, Hours, Minutes, Seconds together).
  2. **Timeline Section**: Numbered milestones (First Date, First Trip, 6 Months, 1 Year Today) with photos and date badges.
  3. **Polaroid Gallery**: Filterable category pills (*All, Dates, Trips, Everyday, Random*), tilted polaroid cards, and click-to-zoom Lightbox modal.
  4. **Anniversary Letter**: Parchment paper letter with cursive handwriting, botanical illustrations, and deep 3D wax seal stamp.
- **Ambient Romantic Music Player**: Built-in Web Audio ambient music synthesizer playing gentle arpeggiated piano chords with play/pause and animated equalizer bars.
- **Confetti & Petal Explosion**: Soft pastel flower petals and heart particles bursting on unlock.

---

## 🛠️ Project Structure

```
her-eyes-only/
├── index.html            # Core single-page application
├── css/
│   └── styles.css        # HUD animations, deckle torn edges, washi tape, 3D wax seal
├── js/
│   ├── config.js         # Easily customize names, anniversary date, milestones, photos & letter
│   ├── audio.js          # Web Audio synth for sci-fi HUD sounds & romantic piano melody
│   ├── eye-tracker.js    # MediaPipe FaceMesh & neon green eye targeting canvas engine
│   └── app.js            # Stage transitions, live counter ticker, lightbox & confetti
└── README.md
```

---

## 🚀 How to Run Locally

Because browser camera APIs (`getUserMedia`) require either `localhost` or `HTTPS`, run a local static server:

```bash
# Using Python
python3 -m http.server 8080

# Or using Node
npx serve .
```

Then open your browser to:
```
http://localhost:8080
```

---

## 💌 How to Personalize

Open `js/config.js` and customize:
1. **Couple details**:
   ```javascript
   partnerName: "Her Name",
   anniversaryDate: "2024-03-12T19:00:00", // Start date of your relationship
   ```
2. **Timeline Milestones**: Add your favorite dates, captions, and photos.
3. **Gallery**: Add your personal polaroid pictures.
4. **Letter**: Personalize your anniversary letter text and sign-off.

---

## 🌐 Free Deployment (For Phone / QR Code)

To send her a live link or print a QR code for a card:
1. **GitHub Pages**: Push this repository to GitHub and enable GitHub Pages in repo Settings → Pages (`main` branch / root).
2. **Vercel / Netlify**: Import your GitHub repo into Vercel or Netlify for instant free HTTPS deployment.
