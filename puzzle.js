/* ============================================================
   GATITOS ENAMORADOS — puzzle.js
   400 piezas, gatos realistas, dificultad alta 💕
   ============================================================ */
'use strict';

// ── Configuración fija ─────────────────────────────────────────
const CFG = {
  COLS:     12,          // 12×12 = 144 piezas (Perfect kittens grid)
  ROWS:     12,
  IMAGE:    'cats.png',
  SNAP:     22,
  TRAY_SZ:  90,          // Larger for sticker silhouettes
  SAVE_KEY: 'cutecat_v7',
  HINTS:    3,
};

const WORDS = ["Eres mi vida", "Te amo", "Preciosa", "Mi todo", "Geraldine", "Miauu ❤️", "Eterna", "Mi sol", "Encantadora"];

// ════════════════════════════════════════════════════════════════
// MOTOR DE SONIDO Y VIBRACIÓN
// ════════════════════════════════════════════════════════════════
class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  _init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  playClick() {
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gn  = this.ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
    gn.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gn); gn.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.11);
    // Haptic
    if (navigator.vibrate) navigator.vibrate(25);
  }
}
const SE = new SoundEngine();

// ════════════════════════════════════════════════════════════════
// FONDO ROMÁNTICO ANIMADO
// ════════════════════════════════════════════════════════════════
class RomanticBg {
  constructor() {
    this.cv  = document.getElementById('bg-canvas');
    this.ctx = this.cv.getContext('2d');
    this.pts = [];
    this._resize();
    this._spawn(80);
    window.addEventListener('resize', () => this._resize());
    this._loop();
  }
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.cv.width  = window.innerWidth * dpr;
    this.cv.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // MUST scale the context
  }


  _spawn(n) {
    const COLS = ['#ff6b9d','#ff8fbe','#fce4ec','#f59e0b','#c084fc','#e879f9','#ffd6e7','#ff4081'];
    for (let i = 0; i < n; i++) this.pts.push({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vy: -(0.12 + Math.random() * 0.5),
      vx: (Math.random() - .5) * 0.25,
      sz: 5 + Math.random() * 16,
      a:  Math.random() * .6,
      da: .003 + Math.random() * .005,
      sw: Math.random() * Math.PI * 2,
      t:  Math.random() < .55 ? 'heart' : 'dot',
      c:  COLS[Math.floor(Math.random() * COLS.length)],
    });
  }
  _drawHeart(ctx, x, y, sz, color, alpha) {
    const s = sz / 10;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 2.5);
    ctx.bezierCurveTo(x + s*5, y - s*2, x + s*9, y + s, x, y - s*3);
    ctx.bezierCurveTo(x - s*9, y + s, x - s*5, y - s*2, x, y + s*2.5);
    ctx.fill(); ctx.restore();
  }
  _loop() {
    const { cv, ctx } = this;
    ctx.clearRect(0, 0, cv.width, cv.height);
    // gradient bg
    const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
    g.addColorStop(0, '#18042a'); g.addColorStop(.5, '#2e0844'); g.addColorStop(1, '#18042a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    const now = Date.now() / 1000;
    for (const p of this.pts) {
      p.y += p.vy; p.x += p.vx + Math.sin(now + p.sw) * .15;
      p.a += (p.a < .6 ? p.da : -p.da);
      if (p.a < 0 || p.y < -30) { p.y = cv.height + 20; p.x = Math.random() * cv.width; p.a = 0; }
      const al = Math.min(p.a, .55);
      if (p.t === 'heart') this._drawHeart(ctx, p.x, p.y, p.sz, p.c, al);
      else {
        ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * .3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
    requestAnimationFrame(() => this._loop());
  }
}

// ════════════════════════════════════════════════════════════════
// OREJAS DE MADERA  (canvas triangulares)
// ════════════════════════════════════════════════════════════════
function drawPaw(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rotation);
  const c = '#e6c072', c2 = 'rgba(255,170,200,0.4)';
  // Main pad
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, size*.6, size*.45, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(0, 0, size*.4, size*.3, 0, 0, Math.PI*2); ctx.fill();
  // Toes
  const toeY = -size * 0.45;
  for (let i = -1; i <= 1; i++) {
    const tx = i * size * 0.45;
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(tx, toeY, size*.22, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(tx, toeY, size*.12, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function buildCatEars(frameEl, fw, fh) {
  const wrap = document.getElementById('board-wrap');
  if (!wrap) return;
  wrap.querySelectorAll('.ear, .paw-canvas').forEach(e => e.remove());

  const earW = Math.round(fw * 0.21), earH = Math.round(fw * 0.14);


  const xOff = Math.round(fw * .12);


  function mkEar(left) {
    const wrap2 = document.createElement('div');
    wrap2.className = 'ear';
    const cv = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    cv.width = earW * dpr; cv.height = earH * dpr;
    cv.style.width = earW + 'px'; cv.style.height = earH + 'px';

    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const g = ctx.createLinearGradient(earW/2, earH, earW/2, 0);
    g.addColorStop(0, '#a07030'); g.addColorStop(.45, '#e6c072'); g.addColorStop(1, '#f8e5b5');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, earH); ctx.lineTo(earW/2, 0); ctx.lineTo(earW, earH); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,170,200,.4)'; ctx.beginPath(); ctx.moveTo(earW*.22, earH*.9); ctx.lineTo(earW/2, earH*.12); ctx.lineTo(earW*.78, earH*.9); ctx.closePath(); ctx.fill();
    wrap2.appendChild(cv);
    wrap2.style.cssText = `position:absolute;pointer-events:none;z-index:30;${left?`left:${xOff}px`:`right:${xOff}px`};top:-${earH}px;filter:drop-shadow(-2px -4px 8px rgba(0,0,0,.55));`;
    return wrap2;
  }


  // Draw 4 paws - Optimized for HD and visibility
  const pcv = document.createElement('canvas');
  pcv.className = 'paw-canvas';
  const dpr = window.devicePixelRatio || 1;
  const pw_ = fw + 160, ph_ = fh + 160; 
  pcv.width = pw_ * dpr; pcv.height = ph_ * dpr;
  pcv.style.width = pw_ + 'px'; pcv.style.height = ph_ + 'px';

  const pctx = pcv.getContext('2d');
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  pctx.imageSmoothingQuality = 'high';

  // Adjusted coordinates for better center-relative positioning
  const psz = fw * 0.08, pdist = fw * 0.44;
  const mcx = pw_ / 2, mcy = ph_ / 2;
  
  // Bottom paws - anchored to board radius
  drawPaw(pctx, mcx - pdist, mcy + fh/2 - psz*0.2, psz, -0.4);
  drawPaw(pctx, mcx + pdist, mcy + fh/2 - psz*0.2, psz, 0.4);
  // Top paws
  drawPaw(pctx, mcx - pdist * 0.85, mcy - fh/2 + psz*0.2, psz * 0.82, -0.1);
  drawPaw(pctx, mcx + pdist * 0.85, mcy - fh/2 + psz*0.2, psz * 0.82, 0.1);

  pcv.style.cssText = `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:25;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5));`;



  
  wrap.appendChild(mkEar(true));
  wrap.appendChild(mkEar(false));
  wrap.appendChild(pcv);
}


// ════════════════════════════════════════════════════════════════
// CLASE PRINCIPAL DEL PUZZLE
// ════════════════════════════════════════════════════════════════
class CatPuzzle {
  constructor() {
    this.cols    = CFG.COLS;
    this.rows    = CFG.ROWS;
    this.total   = this.cols * this.rows;  // 240
    this.placed  = 0;
    this.hintsLeft = CFG.HINTS;
    this.pieces  = [];
    this.edgesH  = []; // Horizontal boundaries (vertical lines)
    this.edgesV  = []; // Vertical boundaries (horizontal lines)
    this.startTs = null;
    this.elapsed = 0;
    this._tmrId  = null;
    this._drag   = null;
    this._ghost  = null;
    this._ox = 0; this._oy = 0;
    this._srcImg = null;

    try {
      this._generateEdges();
      this._layout();
      this._loadImage();
    } catch(e) {
      console.error(e);
      document.getElementById('s-total').textContent = 'ERR';
    }
  }

  // ── Layout ─────────────────────────────────────────────────────
  _layout() {
    const area = document.getElementById('board-area');
    const aw = area.clientWidth;
    const ah = area.clientHeight;
    const isMobile = window.innerWidth < 640 || window.innerHeight > window.innerWidth;

    // Board scaling - Significantly smaller on mobile to leave air around it
    const spaceForEars = ah * (isMobile ? 0.08 : 0.18);
    const aw2 = aw * (isMobile ? 0.78 : 0.92);
    const ah2 = (ah - spaceForEars) * (isMobile ? 0.65 : 0.85); 
    
    const szX = aw2 / this.cols;
    const szY = ah2 / this.rows;
    const sz  = Math.min(szX, szY);
    
    this.pw = Math.max(8, Math.floor(sz));
    this.ph = Math.max(8, Math.floor(sz));




    this.bw = this.pw * this.cols;
    this.bh = this.ph * this.rows;

    // Frame (oval)
    const frame = document.getElementById('cat-frame');
    const pad   = Math.round(this.bw * 0.028);
    const fw    = this.bw + pad * 2;
    const fh    = this.bh + pad * 2;
    frame.style.width  = fw + 'px';
    frame.style.height = fh + 'px';

    buildCatEars(frame, fw, fh);


    // Board canvas positioned inside frame - HD SUPPORT
    const cv = document.getElementById('board-cv');
    const dpr = window.devicePixelRatio || 1;
    cv.width  = this.bw * dpr; 
    cv.height = this.bh * dpr;
    cv.style.cssText = `position:absolute;left:${pad}px;top:${pad}px;width:${this.bw}px;height:${this.bh}px;`;

    // Slots overlay (same position)
    const sl = document.getElementById('slots');
    sl.style.cssText = `position:absolute;left:${pad}px;top:${pad}px;width:${this.bw}px;height:${this.bh}px;overflow:hidden;`;

    // Dynamic tray size for mobile - Reduced for 2-row grid
    this.traySz = isMobile ? Math.min(45, Math.floor(window.innerHeight * 0.06)) : CFG.TRAY_SZ;




    document.getElementById('s-total').textContent = this.total;
    document.getElementById('hints-left').textContent = this.hintsLeft;
  }


  _drawEmptyBoard(cv) {
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Scale for HD
    // Parchment background

    const g = ctx.createLinearGradient(0, 0, this.bw, this.bh);
    g.addColorStop(0, '#f0e2d0'); g.addColorStop(.5, '#ead8c2'); g.addColorStop(1, '#e4d2bb');
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.bw, this.bh);
    // Heart pattern (very subtle)
    ctx.fillStyle = 'rgba(190,85,120,.05)';
    for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
      if ((r * this.cols + c) % 7 !== 0) continue;
      const x = c * this.pw + this.pw / 2, y = r * this.ph + this.ph / 2, s = this.pw * .14;
      ctx.beginPath();
      ctx.moveTo(x, y + s * 2.5);
      ctx.bezierCurveTo(x+s*4, y-s*2, x+s*8, y+s, x, y-s*3);
      ctx.bezierCurveTo(x-s*8, y+s, x-s*4, y-s*2, x, y+s*2.5);
      ctx.fill();
    }
    // grid lines - Ultra-sharp and slightly bolder for HD
    ctx.strokeStyle = 'rgba(100,50,30,0.22)'; 
    ctx.lineWidth = dpr > 1 ? 1.6 : 1.2;

    for (let c = 0; c <= this.cols; c++) { ctx.beginPath(); ctx.moveTo(c*this.pw,0); ctx.lineTo(c*this.pw,this.bh); ctx.stroke(); }
    for (let r = 0; r <= this.rows; r++) { ctx.beginPath(); ctx.moveTo(0,r*this.ph); ctx.lineTo(this.bw,r*this.ph); ctx.stroke(); }
  }



  // ── Load source image ────────────────────────────────────────
  _loadImage() {
    this._srcImg = new Image();
    this._srcImg.crossOrigin = 'anonymous';
    this._srcImg.onload = () => {
      const cv = document.getElementById('board-cv');
      this._drawEmptyBoard(cv);
      this._buildSlots();
      this._createPieces();
      this._renderTray();
      this._bindEvents();
      this._loadSave();
      // HD Verification
      console.log("%c PUZZLE HD LOADED v5.2 %c", "background:#ff6b9d;color:#fff;font-weight:bold;padding:4px", "");
      setTimeout(() => {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:rgba(255,107,157,0.9);color:white;padding:5px 15px;border-radius:20px;font-size:12px;z-index:999999;pointer-events:none;';
        d.textContent = 'Modo HD Activado 🐱✨';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 4000);
      }, 500);
    };

    this._srcImg.onerror = () => {
      console.error('Error loading image');
      document.getElementById('s-total').textContent = '⚠️';
    };
    this._srcImg.src = CFG.IMAGE;
  }

  // ── Jigsaw Edge Logic ────────────────────────────────────────
  _generateEdges() {
    this.edgesH = Array.from({ length: this.rows }, () => Array(this.cols + 1).fill(0));
    this.edgesV = Array.from({ length: this.rows + 1 }, () => Array(this.cols).fill(0));
    // Fill internal edges with random tab directions
    for (let r = 0; r < this.rows; r++) {
      for (let c = 1; c < this.cols; c++) this.edgesH[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
    for (let r = 1; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) this.edgesV[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  // Draw piece path with cat-ear tabs
  _getPiecePath(pw, ph, r, c) {
    const p = new Path2D();
    const s = pw * 0.35; // Larger cat-head tabs for "sticker" look
    const curve = pw * 0.15; // Edge waviness
    
    p.moveTo(0, 0);
    // Top
    if (this.edgesV[r][c] !== 0) {
      this._drawCatTab(p, pw/2, 0, s, this.edgesV[r][c] === 1 ? 0 : Math.PI);
    } else {
      p.quadraticCurveTo(pw/2, -curve, pw, 0);
    }
    p.lineTo(pw, 0);
    // Right
    if (this.edgesH[r][c+1] !== 0) {
      this._drawCatTab(p, pw, ph/2, s, this.edgesH[r][c+1] === 1 ? Math.PI/2 : -Math.PI/2);
    } else {
      p.quadraticCurveTo(pw + curve, ph/2, pw, ph);
    }
    p.lineTo(pw, ph);
    // Bottom
    if (this.edgesV[r+1][c] !== 0) {
      this._drawCatTab(p, pw/2, ph, s, this.edgesV[r+1][c] === 1 ? Math.PI : 0);
    } else {
      p.quadraticCurveTo(pw/2, ph + curve, 0, ph);
    }
    p.lineTo(0, ph);
    // Left
    if (this.edgesH[r][c] !== 0) {
      this._drawCatTab(p, 0, ph/2, s, this.edgesH[r][c] === 1 ? -Math.PI/2 : Math.PI/2);
    } else {
      p.quadraticCurveTo(-curve, ph/2, 0, 0);
    }
    p.lineTo(0, 0);
    p.closePath();
    return p;
  }

  _drawCatTab(p, x, y, s, rot) {
    // A much cuter, very rounded kitten head "sticker" silhouette
    const r = s * 0.45; 
    const cx = x + Math.cos(rot - Math.PI/2) * s * 0.6;
    const cy = y + Math.sin(rot - Math.PI/2) * s * 0.6;
    
    // Smooth ears
    const ea1 = rot - 0.7, ea2 = rot - 2.4;
    const et1x = cx + Math.cos(ea1) * s * 1.0, et1y = cy + Math.sin(ea1) * s * 1.0;
    const et2x = cx + Math.cos(ea2) * s * 1.0, et2y = cy + Math.sin(ea2) * s * 1.0;
    
    // Arrival
    p.lineTo(cx + Math.cos(rot - 2.8) * r, cy + Math.sin(rot - 2.8) * r);
    // Cheek to Ear
    p.quadraticCurveTo(et2x, et2y, cx + Math.cos(rot - 1.9) * r, cy + Math.sin(rot - 1.9) * r);
    // Top head
    p.arc(cx, cy, r, rot - 1.9, rot - 1.2);
    // Ear to Cheek
    p.quadraticCurveTo(et1x, et1y, cx + Math.cos(rot - 0.3) * r, cy + Math.sin(rot - 0.3) * r);
  }

  // Draw piece [col,row] of source image into canvas context at (dx,dy)
  _blitPiece(ctx, col, row, dx, dy, dw, dh, isTray = false) {
    const iw = this._srcImg.naturalWidth, ih = this._srcImg.naturalHeight;
    const sw = iw / this.cols, sh = ih / this.rows;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    
    ctx.save();
    // Gutters for the stickers
    const m = Math.round(dw * 0.5);
    if (isTray) ctx.translate(dx + m, dy + m);
    else ctx.translate(dx, dy);
    
    const path = this._getPiecePath(dw, dh, row, col);
    if (isTray) {
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    }
    
    ctx.clip(path);
    
    // Calculate source crop with buffer to include neighboring areas (for ears)
    const b = 0.45; // 45% buffer
    const sx = col * sw - sw * b, sy = row * sh - sh * b;
    const sSizeW = sw * (1 + b * 2), sSizeH = sh * (1 + b * 2);
    
    // Draw centered on the cell
    ctx.drawImage(this._srcImg,
      sx, sy, sSizeW, sSizeH,
      -dw * b, -dh * b, dw * (1 + b * 2), dh * (1 + b * 2)
    );
    
    // Sticker border
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = isTray ? 8 : 4;
    ctx.stroke(path);
    
    // Definition line
    ctx.strokeStyle = 'rgba(255,130,180,0.3)';
    ctx.lineWidth = isTray ? 2 : 1;
    ctx.stroke(path);
    
    ctx.restore();
  }

  // ── Pieces ──────────────────────────────────────────────────
  _createPieces() {
    this.pieces = [];
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        this.pieces.push({ id: r * this.cols + c, col: c, row: r, placed: false, el: null });
    shuffle(this.pieces);
  }

  // ── Slots ────────────────────────────────────────────────────
  _buildSlots() {
    const sl = document.getElementById('slots'); sl.innerHTML = '';
    for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
      const d = document.createElement('div');
      d.className = 'slot'; d.id = `sl-${c}-${r}`;
      d.style.cssText = `left:${c*this.pw}px;top:${r*this.ph}px;width:${this.pw}px;height:${this.ph}px;`;
      sl.appendChild(d);
    }
  }

  // ── Tray rendering ───────────────────────────────────────────
  _renderTray() {
    const tray = document.getElementById('tray'); tray.innerHTML = '';
    const tw = this.traySz, th = this.traySz; 
    const dpr = window.devicePixelRatio || 1;

    for (const p of this.pieces.filter(x => !x.placed)) {
      const g = Math.round(tw * 0.8); // Gutters for large sticker silhouettes
      const cv = document.createElement('canvas');
      
      const realW = tw + g;
      const realH = th + g;
      
      cv.width = realW * dpr; 
      cv.height = realH * dpr;
      cv.style.width = realW + 'px';
      cv.style.height = realH + 'px';
      
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      
      this._blitPiece(ctx, p.col, p.row, g/2, g/2, tw, th, true);


      const wrap = document.createElement('div');
      wrap.className = 'piece'; wrap.dataset.pid = p.id;
      wrap.style.width = realW + 'px'; wrap.style.height = realH + 'px';
      wrap.appendChild(cv);
      p.el = wrap; tray.appendChild(wrap);

    }
    this._updateCounters();
  }


  // ── Drag events ──────────────────────────────────────────────
  _bindEvents() {
    document.addEventListener('pointerdown', e => this._dn(e), { passive: false });
    document.addEventListener('pointermove', e => this._mv(e), { passive: false });
    document.addEventListener('pointerup',   e => this._up(e), { passive: false });
    document.getElementById('btn-shuffle').onclick = () => this._shuffleTray();
    document.getElementById('btn-hint').onclick    = () => this._hint();
    document.getElementById('btn-reset').onclick   = () => this._reset();
    document.getElementById('btn-again')?.addEventListener('click', () => this._reset());
    document.getElementById('btn-info')?.addEventListener('click', () => this._openModal());
  }

  _dn(e) {
    const el = e.target.closest('.piece'); if (!el) return;
    const pid = parseInt(el.dataset.pid);
    const p = this.pieces.find(x => x.id === pid && !x.placed); if (!p) return;
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);

    const r = el.getBoundingClientRect();
    this._ox = e.clientX - r.left; this._oy = e.clientY - r.top;

    // Ghost — larger for visibility
    const gSz = Math.max(this.pw * 2.2, CFG.TRAY_SZ * 1.5);
    const over = gSz * 0.45;
    const gcv = p.el.querySelector('canvas').cloneNode(true);
    const gctx = gcv.getContext('2d');
    const dpr  = window.devicePixelRatio || 1;
    
    // Ensure the clone has high-res support
    const realSz = gSz + over*2;
    gcv.width = realSz * dpr;
    gcv.height = realSz * dpr;
    gcv.style.width = realSz + 'px';
    gcv.style.height = realSz + 'px';
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._blitPiece(gctx, p.col, p.row, 0, 0, gSz, gSz, true);



    const ghost = document.createElement('div');
    ghost.id = 'ghost'; ghost.style.cssText = `
      position:fixed;z-index:99999;pointer-events:none;
      left:${r.left}px;top:${r.top}px;
      width:${realSz}px;height:${realSz}px;
      transform:scale(1.15);

      filter: drop-shadow(0 20px 50px rgba(0,0,0,0.8));
      opacity:.95;
    `;
    ghost.appendChild(gcv);
    document.body.appendChild(ghost);
    this._ghost = ghost;
    el.style.opacity = '.15';
    this._drag = { p, el };
    if (!this.startTs) this.startTs = Date.now();
  }

  _mv(e) {
    if (!this._ghost) return; e.preventDefault();
    const gw = this._ghost.offsetWidth, gh = this._ghost.offsetHeight;
    this._ghost.style.left = (e.clientX - gw / 2) + 'px';
    this._ghost.style.top  = (e.clientY - gh / 2) + 'px';
    this._highlightSlot(e.clientX, e.clientY);
  }

  _up(e) {
    if (!this._ghost || !this._drag) return; e.preventDefault();
    const { p, el } = this._drag;
    const gr = this._ghost.getBoundingClientRect();
    const gcx = gr.left + gr.width / 2;
    const gcy = gr.top  + gr.height / 2;
    this._ghost.remove(); this._ghost = null;
    el.style.opacity = '1';
    document.querySelectorAll('.slot.hl').forEach(s => s.classList.remove('hl'));

    // Find matching slot
    const target = document.getElementById(`sl-${p.col}-${p.row}`);
    if (target) {
      const sr = target.getBoundingClientRect();
      const scx = sr.left + sr.width / 2, scy = sr.top + sr.height / 2;
      if (Math.hypot(gcx - scx, gcy - scy) < CFG.SNAP) {
        this._place(p, el);
        this._drag = null; return;
      }
    }
    // Wrong slot — shake the ghost location
    this._wrongAnim(el);
    this._drag = null;
  }

  _wrongAnim(el) {
    el.style.animation = 'wrongShake .35s ease';
    setTimeout(() => el.style.animation = '', 360);
  }

  _highlightSlot(cx, cy) {
    document.querySelectorAll('.slot.hl').forEach(s => s.classList.remove('hl'));
    // Only highlight if close enough
    const threshold = CFG.SNAP + 50;
    let best = null, bd = Infinity;
    document.querySelectorAll('.slot:not(.ok)').forEach(s => {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(cx - (r.left + r.width/2), cy - (r.top + r.height/2));
      if (d < bd) { bd = d; best = s; }
    });
    if (best && bd < threshold) best.classList.add('hl');
  }

  // ── Place piece ───────────────────────────────────────────────
  _place(piece, trayEl) {
    piece.placed = true;
    this.placed++;
    trayEl?.remove();

    // Draw into board canvas
    const cv  = document.getElementById('board-cv');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._blitPiece(ctx, piece.col, piece.row, piece.col * this.pw, piece.row * this.ph, this.pw, this.ph);
    ctx.restore();


    const sl = document.getElementById(`sl-${piece.col}-${piece.row}`);
    if (sl) { sl.classList.add('ok'); sl.classList.remove('slot', 'hl'); }

    this._snapEffect(piece.col, piece.row);
    this._updateCounters();
    this._save();
    SE.playClick(); // Play sound and vibrate
    this._showWord(piece.col, piece.row);
    if (this.placed === this.total) setTimeout(() => this._victory(), 750);
  }

  _showWord(col, row) {
    const bv = document.getElementById('board-cv').getBoundingClientRect();
    const cx = bv.left + col * this.pw + this.pw / 2;
    const cy = bv.top  + row * this.ph + this.ph / 2;
    
    const word = document.createElement('div');
    word.className = 'romantic-word';
    word.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];
    word.style.cssText = `
      position:fixed; z-index:10001; pointer-events:none;
      left:${cx}px; top:${cy}px; transform:translate(-50%, -50%);
      color: #ffd6e7; font-family: 'Playfair Display', serif;
      font-weight: bold; font-size: 1.4rem; text-shadow: 0 2px 10px rgba(255,107,157,0.8);
      animation: wordPopup 1.2s ease-out forwards;
    `;

    document.body.appendChild(word);
    setTimeout(() => word.remove(), 1300);
  }

  _snapEffect(col, row) {
    const bv  = document.getElementById('board-cv').getBoundingClientRect();
    const cx  = bv.left + col * this.pw + this.pw / 2;
    const cy  = bv.top  + row * this.ph + this.ph / 2;
    const sz  = Math.max(this.pw, this.ph) * 3.5;

    const ring = document.createElement('div');
    ring.style.cssText = `
      position:fixed;z-index:9998;pointer-events:none;border-radius:50%;
      width:${sz}px;height:${sz}px;left:${cx-sz/2}px;top:${cy-sz/2}px;
      background:radial-gradient(circle,rgba(255,107,157,.45) 0%,transparent 70%);
      animation:snapRing .5s ease-out forwards;
    `;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 520);

    const h = document.createElement('div');
    h.style.cssText = `position:fixed;z-index:9999;pointer-events:none;font-size:14px;left:${cx}px;top:${cy-8}px;animation:floatHrt .75s ease-out forwards;`;
    h.textContent = '💕'; document.body.appendChild(h);
    setTimeout(() => h.remove(), 760);

    if (!document.getElementById('snap-kf')) {
      const s = document.createElement('style'); s.id = 'snap-kf';
      s.textContent = `
        @keyframes snapRing{from{transform:scale(0);opacity:1}to{transform:scale(1);opacity:0}}
        @keyframes floatHrt{from{transform:translateY(0) scale(1);opacity:1}to{transform:translateY(-50px) scale(1.5);opacity:0}}
        @keyframes wrongShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
      `;
      document.head.appendChild(s);
    }
  }

  // ── Shuffle ───────────────────────────────────────────────────
  _shuffleTray() {
    const tray = document.getElementById('tray');
    const kids = [...tray.children];
    shuffle(kids); kids.forEach(k => tray.appendChild(k));
    tray.style.opacity = '.1'; setTimeout(() => tray.style.opacity = '1', 180);
  }

  // ── Hint (limited to CFG.HINTS uses) ─────────────────────────
  _hint() {
    const btn = document.getElementById('btn-hint');
    if (this.hintsLeft <= 0) {
      btn.classList.add('hbtn-shake');
      setTimeout(() => btn.classList.remove('hbtn-shake'), 500);
      return;
    }
    const unp = this.pieces.filter(p => !p.placed); if (!unp.length) return;
    this.hintsLeft--;
    document.getElementById('hints-left').textContent = this.hintsLeft;
    // Gray out button when exhausted
    if (this.hintsLeft === 0) {
      btn.style.cssText += ';opacity:.35;cursor:not-allowed;filter:grayscale(1);';
      btn.title = 'Sin pistas disponibles';
    }

    const p = unp[Math.floor(Math.random() * unp.length)];

    // Highlight piece in tray
    if (p.el) { p.el.classList.add('hint'); setTimeout(() => p.el?.classList.remove('hint'), 3500); }

    // Show image preview in target slot
    const sl = document.getElementById(`sl-${p.col}-${p.row}`);
    if (sl) {
      const mc = document.createElement('canvas');
      mc.width = this.pw; mc.height = this.ph;
      this._blitPiece(mc.getContext('2d'), p.col, p.row, 0, 0, this.pw, this.ph);
      sl.style.background = 'rgba(255,107,157,.3)';
      sl.style.border     = '2px dashed #ff6b9d';
      sl.style.zIndex     = '5';
      mc.style.cssText    = 'opacity:.55;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      sl.appendChild(mc);
      setTimeout(() => { sl.style.background=''; sl.style.border=''; sl.style.zIndex=''; mc.remove(); }, 3500);
    }
  }

  // ── Instructions modal ─────────────────────────────────────────
  _openModal() {
    const modal = document.getElementById('modal-instructions');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.getElementById('btn-modal-close').onclick = () => modal.classList.add('hidden');
  }

  _showInstructions() {
    const seen = localStorage.getItem('catpuzzle_instructions_seen');
    if (!seen) {
      this._openModal();
      // Mark as seen so it won't auto-show again (can still reopen via ?)
      const orig = document.getElementById('btn-modal-close').onclick;
      document.getElementById('btn-modal-close').onclick = () => {
        document.getElementById('modal-instructions').classList.add('hidden');
        localStorage.setItem('catpuzzle_instructions_seen', '1');
      };
    }
  }

  // ── Timer ─────────────────────────────────────────────────────
  _startTimer() {
    clearInterval(this._tmrId);
    this._tmrId = setInterval(() => {
      if (!this.startTs) return;
      this.elapsed = Math.floor((Date.now() - this.startTs) / 1000);
      const m = Math.floor(this.elapsed / 60), s = this.elapsed % 60;
      document.getElementById('s-time').textContent = `${m}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  // ── Save / Load ───────────────────────────────────────────────
  _save() {
    try {
      localStorage.setItem(CFG.SAVE_KEY, JSON.stringify({
        placed:  this.pieces.filter(p => p.placed).map(p => p.id),
        startTs: this.startTs,
        hints:   this.hintsLeft,
      }));
    } catch (e) {}
  }
  _loadSave() {
    try {
      const raw = localStorage.getItem(CFG.SAVE_KEY); if (!raw) return;
      const st = JSON.parse(raw);
      if (st.startTs) this.startTs = st.startTs;
      if (typeof st.hints === 'number') {
        this.hintsLeft = st.hints;
        document.getElementById('hints-left').textContent = this.hintsLeft;
      }
      (st.placed || []).forEach(id => {
        const p = this.pieces.find(x => x.id === id && !x.placed);
        if (p) this._place(p, p.el);
      });
    } catch (e) {}
  }

  // ── Reset ─────────────────────────────────────────────────────
  _reset() {
    clearInterval(this._tmrId);
    try { localStorage.removeItem(CFG.SAVE_KEY); } catch (e) {}
    document.getElementById('victory').classList.add('hidden');
    if (this._vLoop) { cancelAnimationFrame(this._vLoop); this._vLoop = null; }
    this.placed = 0; this.startTs = null; this.elapsed = 0; this.hintsLeft = CFG.HINTS;
    document.getElementById('s-placed').textContent = '0';
    document.getElementById('s-time').textContent   = '0:00';
    document.getElementById('hints-left').textContent = this.hintsLeft;
    this._layout();
    const cv = document.getElementById('board-cv');
    this._drawEmptyBoard(cv);
    this._buildSlots();
    this._createPieces();
    this._renderTray();
    this._startTimer();
  }

  // ── Counters ───────────────────────────────────────────────────
  _updateCounters() {
    document.getElementById('s-placed').textContent = this.placed;
    document.getElementById('tray-sub').textContent = `${this.total - this.placed} restantes`;
    const pct = Math.round(this.placed / this.total * 100);
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = pct + '%';
  }

  // ════════════════════════════════════════════════════════════
  // VICTORIA ÉPICA ROMÁNTICA 💕💕💕
  // ════════════════════════════════════════════════════════════
  _victory() {
    clearInterval(this._tmrId);
    const m = Math.floor(this.elapsed / 60), s = this.elapsed % 60;
    document.getElementById('v-time').textContent  = `${m}:${s.toString().padStart(2, '0')}`;
    document.getElementById('v-pcs').textContent   = this.total;
    document.getElementById('victory').classList.remove('hidden');
    this._vicAnim();
  }

  _vicAnim() {
    const cv  = document.getElementById('vic-cv');
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    cv.width  = window.innerWidth * dpr;
    cv.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);


    const particles = [];
    const COLS = ['#ff6b9d','#ff8fbe','#fce4ec','#f59e0b','#c084fc','#ffd6e7','#ff4081','#fff'];

    function spawnBurst(n, ox, oy) {
      for (let i = 0; i < n; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const speed  = 2 + Math.random() * 8;
        particles.push({
          x: ox || cv.width / 2, y: oy || cv.height / 2,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
          sz: 7 + Math.random() * 22, a: 1, da: .01 + Math.random() * .012,
          rot: Math.random() * Math.PI * 2, dr: (Math.random() - .5) * .1,
          c:  COLS[Math.floor(Math.random() * COLS.length)],
          t:  ['heart','heart','petal','star'][Math.floor(Math.random() * 4)],
        });
      }
    }

    function drawHeart(ctx, x, y, sz, c, a) {
      const s = sz / 10; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c;
      ctx.translate(x, y); ctx.rotate(Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, s*2.5);
      ctx.bezierCurveTo(s*5,-s*2,s*9,s,0,-s*3);
      ctx.bezierCurveTo(-s*9,s,-s*5,-s*2,0,s*2.5);
      ctx.fill(); ctx.restore();
    }

    function drawStar(ctx, x, y, sz, c, a, rot) {
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c;
      ctx.translate(x, y); ctx.rotate(rot);
      const pts = 5, r1 = sz/2, r2 = sz/4;
      ctx.beginPath();
      for (let i = 0; i < pts*2; i++) {
        const angle = (i * Math.PI) / pts - Math.PI/2;
        const r = i % 2 === 0 ? r1 : r2;
        i === 0 ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r)
                : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }

    let fr = 0;
    const burstSpots = [
      [cv.width*.25, cv.height*.3], [cv.width*.75, cv.height*.3],
      [cv.width*.5,  cv.height*.6], [cv.width*.1,  cv.height*.7],
      [cv.width*.9,  cv.height*.5],
    ];

    const loop = () => {
      this._vLoop = requestAnimationFrame(loop);
      fr++;
      ctx.clearRect(0, 0, cv.width, cv.height);

      if (fr < 8) spawnBurst(40, cv.width/2, cv.height/2); // mega burst
      if (fr % 10 === 0 && fr < 200) {
        const spot = burstSpots[Math.floor(Math.random() * burstSpots.length)];
        spawnBurst(15, spot[0], spot[1]);
      }
      if (fr % 4 === 0) spawnBurst(5); // continuous rain

      const t = fr / 60;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(t * 1.5 + i * .5) * 1.2;
        p.y += p.vy; p.vy += .06;
        p.rot += p.dr; p.a -= p.da;
        if (p.a <= 0 || p.y > cv.height + 50) { particles.splice(i, 1); continue; }
        const al = Math.min(p.a, 1);
        if (p.t === 'heart')  drawHeart(ctx, p.x, p.y, p.sz, p.c, al);
        else if (p.t === 'star') drawStar(ctx, p.x, p.y, p.sz, p.c, al, p.rot);
        else { // petal
          ctx.save(); ctx.globalAlpha = al * .8; ctx.fillStyle = p.c;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.beginPath(); ctx.ellipse(0, 0, p.sz/4, p.sz/2, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
        }
      }

      // "Te Amo" text
      if (fr >= 15 && fr <= 180) {
        const fadeIn  = Math.min((fr - 15) / 20, 1);
        const fadeOut = fr > 160 ? Math.max(0, 1 - (fr - 160) / 20) : 1;
        const alpha   = fadeIn * fadeOut;
        const wave    = Math.sin(t * 2.5) * 10;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${Math.min(cv.width * .11, 108)}px 'Playfair Display', serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ff6b9d'; ctx.shadowBlur = 55;
        const gg = ctx.createLinearGradient(cv.width/2-220, 0, cv.width/2+220, 0);
        gg.addColorStop(0, '#ff8fbe'); gg.addColorStop(.5, '#ffd6e7'); gg.addColorStop(1, '#f59e0b');
        ctx.fillStyle = gg;
        ctx.fillText('Te Amo 💕', cv.width / 2, cv.height / 2 - 80 + wave);
        ctx.restore();
      }

      // Expanding light ring
      if (fr < 30) {
        const rr = (fr / 30) * Math.max(cv.width, cv.height) * .8;
        const al2 = (1 - fr / 30) * .45;
        ctx.save(); ctx.globalAlpha = al2;
        const rg = ctx.createRadialGradient(cv.width/2, cv.height/2, 0, cv.width/2, cv.height/2, rr);
        rg.addColorStop(0, '#ff6b9d'); rg.addColorStop(1, 'transparent');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cv.width/2, cv.height/2, rr, 0, Math.PI*2); ctx.fill(); ctx.restore();
      }
    };
    loop();
  }
}

// ── Shuffle helper ────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── Boot ──────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Inject dynamic keyframe styles
  const st = document.createElement('style');
  st.textContent = `
    #ghost { image-rendering: high-quality; }
    .piece.hint { animation: hintPulse .85s ease-in-out 4; }
    @keyframes hintPulse {
      0%,100% { box-shadow: 2px 4px 12px rgba(0,0,0,.55); }
      50%      { box-shadow: 0 0 0 3px #ff6b9d, 0 0 28px 8px rgba(255,107,157,.65); }
    }
    @keyframes hbtnShake {
      0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)}
    }
    .hbtn-shake { animation: hbtnShake .45s ease; }

    @keyframes wordPopup {
      0% { opacity: 0; transform: translate(-50%, -20%) scale(0.5); }
      20% { opacity: 1; transform: translate(-50%, -100%) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -180%) scale(1); }
    }
  `;
  document.head.appendChild(st);

  new RomanticBg();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    window._pz = new CatPuzzle();
    window._pz._showInstructions();
  }));
});

window.addEventListener('resize', () => {
  clearTimeout(window._rzTmr);
  window._rzTmr = setTimeout(() => {
    if (window._pz) window._pz = new CatPuzzle();
  }, 300);
});
