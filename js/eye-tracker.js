/**
 * Her Eyes Only — Biometric Camera & Real-Time Eye Tracking Engine
 * Uses MediaPipe FaceMesh to track facial landmarks and render
 * futuristic neon green targeting rectangles around her eyes.
 */

class EyeTracker {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.faceMesh = null;
    this.cameraUtils = null;
    this.isTracking = false;
    this.isSimulated = false;
    this.animationFrameId = null;

    // Scan progress state
    this.scanProgress = 0; // 0 to 100
    this.isVerified = false;
    this.isDenied = false;
    this.consecutiveEyeContact = 0;

    // Callbacks
    this.onSuccess = null;
    this.onFailure = null;
    this.onProgress = null;

    // Landmark Indices for Left and Right Eyes (MediaPipe 468 FaceMesh)
    this.LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    this.RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    this.LEFT_IRIS_INDEX = 468;
    this.RIGHT_IRIS_INDEX = 473;
    this.NOSE_TIP_INDEX = 1;
  }

  async init(videoElement, canvasElement, callbacks = {}) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.onSuccess = callbacks.onSuccess;
    this.onFailure = callbacks.onFailure;
    this.onProgress = callbacks.onProgress;

    this.scanProgress = 0;
    this.isVerified = false;
    this.isDenied = false;
    this.consecutiveEyeContact = 0;

    // Attempt to start webcam and load FaceMesh
    try {
      await this.startCamera();
      await this.loadFaceMesh();
    } catch (err) {
      console.warn('Real camera/FaceMesh not available, falling back to simulated HUD:', err);
      this.startSimulatedScanner();
    }
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia not supported in this browser.');
    }

    const constraints = {
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
    
    await new Promise((resolve) => {
      if (this.video.readyState >= 2) {
        this.video.play().then(resolve).catch(resolve);
      } else {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve).catch(resolve);
        };
        setTimeout(resolve, 1200);
      }
    });

    // Match canvas dimensions to video feed
    this.updateCanvasSize();
    window.addEventListener('resize', () => this.updateCanvasSize());
  }

  updateCanvasSize() {
    if (!this.canvas) return;
    const w = (this.video && (this.video.videoWidth || this.video.clientWidth)) || this.canvas.clientWidth || 640;
    const h = (this.video && (this.video.videoHeight || this.video.clientHeight)) || this.canvas.clientHeight || 480;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  async loadFaceMesh() {
    if (typeof FaceMesh === 'undefined') {
      // If MediaPipe library script hasn't loaded, fallback to simulation
      throw new Error('MediaPipe FaceMesh script not available.');
    }

    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // Enables iris tracking
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults((results) => this.handleFaceMeshResults(results));

    this.isTracking = true;
    this.processVideoFrames();
  }

  processVideoFrames() {
    if (!this.isTracking) return;

    if (this.video && this.video.readyState >= 2 && !this.video.paused) {
      this.faceMesh.send({ image: this.video }).catch((e) => {
        // Suppress frame send errors during transitions
      });
    }

    this.animationFrameId = requestAnimationFrame(() => this.processVideoFrames());
  }

  handleFaceMeshResults(results) {
    if (this.isVerified || this.isDenied) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Front camera feed is mirrored, mirror canvas drawing
    this.ctx.save();
    this.ctx.translate(this.canvas.width, 0);
    this.ctx.scale(-1, 1);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Extract Left & Right eye bounding boxes
      const leftEyeBox = this.calculateEyeBoundingBox(landmarks, this.LEFT_EYE_INDICES, w, h);
      const rightEyeBox = this.calculateEyeBoundingBox(landmarks, this.RIGHT_EYE_INDICES, w, h);

      // Extract Iris / Pupil coordinates
      const leftIris = landmarks[this.LEFT_IRIS_INDEX] || landmarks[145];
      const rightIris = landmarks[this.RIGHT_IRIS_INDEX] || landmarks[374];

      const leftPupil = { x: leftIris.x * w, y: leftIris.y * h };
      const rightPupil = { x: rightIris.x * w, y: rightIris.y * h };

      // Gaze / Facing Camera Check: Nose tip should be roughly centered between the eyes
      const noseTip = landmarks[this.NOSE_TIP_INDEX];
      const isLookingForward = Math.abs(noseTip.x - (leftIris.x + rightIris.x) / 2) < 0.08;

      // Draw Green Eye Tracking Rectangles
      this.drawEyeTargetingBox(leftEyeBox, leftPupil, 'L_EYE // RETINAL_LOCK', isLookingForward);
      this.drawEyeTargetingBox(rightEyeBox, rightPupil, 'R_EYE // RETINAL_LOCK', isLookingForward);

      // Draw Interpupillary connecting laser line
      this.drawInterpupillaryLine(leftPupil, rightPupil);

      // Verification Progress Logic
      if (isLookingForward) {
        this.consecutiveEyeContact++;
        // Beep every few frames
        if (this.consecutiveEyeContact % 12 === 0 && window.soundController) {
          window.soundController.playScanBlip();
        }

        // Increase verification progress
        this.scanProgress = Math.min(100, this.scanProgress + 1.8);
      } else {
        this.consecutiveEyeContact = Math.max(0, this.consecutiveEyeContact - 1);
        this.scanProgress = Math.max(0, this.scanProgress - 0.5);
      }

      if (this.onProgress) {
        this.onProgress(this.scanProgress, {
          leftPupil,
          rightPupil,
          isLookingForward,
          confidence: (85 + (this.scanProgress * 0.149)).toFixed(2)
        });
      }

      // 100% Match Reached!
      if (this.scanProgress >= 100) {
        this.triggerSuccess(leftEyeBox, rightEyeBox, leftPupil, rightPupil);
      }
    } else {
      // No face detected in frame
      this.scanProgress = Math.max(0, this.scanProgress - 1);
      if (this.onProgress) {
        this.onProgress(this.scanProgress, { isLookingForward: false, confidence: '0.00' });
      }
    }

    this.ctx.restore();
  }

  calculateEyeBoundingBox(landmarks, indices, width, height) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    indices.forEach((idx) => {
      const pt = landmarks[idx];
      if (pt) {
        const px = pt.x * width;
        const py = pt.y * height;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    });

    // Add padding around eye for aesthetic sci-fi box
    const padX = (maxX - minX) * 0.45;
    const padY = (maxY - minY) * 0.75;

    return {
      x: Math.max(0, minX - padX),
      y: Math.max(0, minY - padY),
      width: (maxX - minX) + padX * 2,
      height: (maxY - minY) + padY * 2
    };
  }

  // Draw Futuristic Green Rectangles with Corner Brackets and Reticles
  drawEyeTargetingBox(box, pupil, label, isLocked) {
    const ctx = this.ctx;
    const { x, y, width, height } = box;
    const color = isLocked ? '#00ff66' : '#10b981';

    // Glowing Neon Shadow
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = isLocked ? 14 : 6;

    // Translucent Green Fill
    ctx.fillStyle = 'rgba(0, 255, 102, 0.08)';
    ctx.fillRect(x, y, width, height);

    // Main Bounding Box Stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // High-Tech Corner Brackets
    const tick = Math.min(12, width * 0.25);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#00ff66';

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x, y + tick);
    ctx.lineTo(x, y);
    ctx.lineTo(x + tick, y);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + width - tick, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + tick);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(x, y + height - tick);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + tick, y + height);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(x + width - tick, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - tick);
    ctx.stroke();

    // Pupil Crosshair Reticle
    if (pupil) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#00ff66';
      const arm = 6;
      ctx.beginPath();
      ctx.moveTo(pupil.x - arm, pupil.y);
      ctx.lineTo(pupil.x + arm, pupil.y);
      ctx.moveTo(pupil.x, pupil.y - arm);
      ctx.lineTo(pupil.x, pupil.y + arm);
      ctx.stroke();

      // Pupil mini circle
      ctx.beginPath();
      ctx.arc(pupil.x, pupil.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff66';
      ctx.fill();
    }

    // Tech Label Text above box
    ctx.shadowBlur = 0;
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    ctx.fillStyle = '#00ff66';
    ctx.fillText(label, x, y - 6);

    // Coordinate tag at bottom
    ctx.font = '8px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(0, 255, 102, 0.8)';
    ctx.fillText(`X:${Math.round(x)} Y:${Math.round(y)}`, x, y + height + 12);
  }

  drawInterpupillaryLine(leftPupil, rightPupil) {
    if (!leftPupil || !rightPupil) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(leftPupil.x, leftPupil.y);
    ctx.lineTo(rightPupil.x, rightPupil.y);
    ctx.stroke();

    // Distance Label in Center
    const midX = (leftPupil.x + rightPupil.x) / 2;
    const midY = (leftPupil.y + rightPupil.y) / 2;
    const dist = Math.round(Math.hypot(rightPupil.x - leftPupil.x, rightPupil.y - leftPupil.y));

    ctx.setLineDash([]);
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillStyle = '#00ff66';
    ctx.fillText(`IPD: ${dist}px // LOCK`, midX - 35, midY - 6);

    ctx.restore();
  }

  // Trigger Success Flow
  triggerSuccess(leftEyeBox, rightEyeBox, leftPupil, rightPupil) {
    this.isVerified = true;
    this.isTracking = false;

    if (window.soundController) {
      window.soundController.playEyeLockBeep();
      setTimeout(() => {
        window.soundController.playAccessGranted();
      }, 300);
    }

    // Render celebratory solid green boxes
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.canvas.width, 0);
    this.ctx.scale(-1, 1);

    if (leftEyeBox && rightEyeBox) {
      this.drawEyeTargetingBox(leftEyeBox, leftPupil, 'L_IRIS // 100% MATCH', true);
      this.drawEyeTargetingBox(rightEyeBox, rightPupil, 'R_IRIS // 100% MATCH', true);
    }
    this.ctx.restore();

    if (this.onSuccess) {
      this.onSuccess();
    }
  }

  // Trigger Access Denied Flow
  triggerDenied(customMessage) {
    this.isDenied = true;
    this.isTracking = false;

    if (window.soundController) {
      window.soundController.playAccessDenied();
    }

    // Flash Red Rectangles
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Draw red glitch targeting boxes
    ctxDrawRedBox(this.ctx, w * 0.28, h * 0.4, w * 0.18, h * 0.12, 'L_EYE // UNRECOGNIZED');
    ctxDrawRedBox(this.ctx, w * 0.54, h * 0.4, w * 0.18, h * 0.12, 'R_EYE // UNRECOGNIZED');
    this.ctx.restore();

    if (this.onFailure) {
      this.onFailure(customMessage);
    }

    function ctxDrawRedBox(ctx, x, y, width, height, label) {
      ctx.shadowColor = '#ff1a3d';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255, 26, 61, 0.15)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#ff1a3d';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, width, height);
      ctx.font = 'bold 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#ff1a3d';
      ctx.fillText(label, x, y - 8);
    }
  }

  // Reset Scanner for "Try Again"
  reset() {
    this.scanProgress = 0;
    this.isVerified = false;
    this.isDenied = false;
    this.consecutiveEyeContact = 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isSimulated) {
      this.startSimulatedScanner();
    } else {
      this.isTracking = true;
      this.processVideoFrames();
    }
  }

  // Fallback Simulation Mode (if camera not available)
  startSimulatedScanner() {
    this.isSimulated = true;
    this.isTracking = true;
    this.updateCanvasSize();

    let simTick = 0;
    const runSimulationLoop = () => {
      if (!this.isTracking || this.isVerified || this.isDenied) return;

      simTick += 0.04;
      const w = this.canvas.width || 640;
      const h = this.canvas.height || 480;

      this.ctx.clearRect(0, 0, w, h);

      // Center Eye coordinates with subtle floating movement
      const centerX = w / 2;
      const centerY = h / 2 + Math.sin(simTick * 1.5) * 6;
      const eyeSpacing = Math.min(140, w * 0.22);
      const boxW = Math.min(100, w * 0.16);
      const boxH = Math.min(65, h * 0.15);

      const leftBox = {
        x: centerX - eyeSpacing / 2 - boxW / 2 + Math.cos(simTick) * 3,
        y: centerY - boxH / 2,
        width: boxW,
        height: boxH
      };

      const rightBox = {
        x: centerX + eyeSpacing / 2 - boxW / 2 + Math.cos(simTick) * 3,
        y: centerY - boxH / 2,
        width: boxW,
        height: boxH
      };

      const leftPupil = { x: leftBox.x + leftBox.width / 2, y: leftBox.y + leftBox.height / 2 };
      const rightPupil = { x: rightBox.x + rightBox.width / 2, y: rightBox.y + rightBox.height / 2 };

      // Subtle biometric face wireframe
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(0, 255, 102, 0.18)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([6, 6]);
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, eyeSpacing * 0.95, boxH * 2.5, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      // Draw Green Eye Targeting Boxes
      this.drawEyeTargetingBox(leftBox, leftPupil, 'L_EYE // RETINAL_LOCK', true);
      this.drawEyeTargetingBox(rightBox, rightPupil, 'R_EYE // RETINAL_LOCK', true);
      this.drawInterpupillaryLine(leftPupil, rightPupil);

      // Simulation automatically increments scan progress smoothly
      this.scanProgress = Math.min(100, this.scanProgress + 0.9);

      if (Math.floor(this.scanProgress) % 15 === 0 && window.soundController) {
        window.soundController.playScanBlip();
      }

      if (this.onProgress) {
        this.onProgress(this.scanProgress, {
          leftPupil,
          rightPupil,
          isLookingForward: true,
          confidence: (88 + (this.scanProgress * 0.119)).toFixed(2)
        });
      }

      if (this.scanProgress >= 100) {
        this.triggerSuccess(leftBox, rightBox, leftPupil, rightPupil);
        return;
      }

      this.animationFrameId = requestAnimationFrame(runSimulationLoop);
    };

    this.animationFrameId = requestAnimationFrame(runSimulationLoop);
  }

  stop() {
    this.isTracking = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}

window.EyeTracker = EyeTracker;
