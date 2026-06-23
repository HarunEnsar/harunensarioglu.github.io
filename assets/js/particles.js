/* Advanced Tech/Neural Network Particle Animation */
(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  let dataPackets = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let pulse = { active: false, x: 0, y: 0, radius: 0, maxRadius: 350, alpha: 1 };
  
  const MAX_DIST = 160;
  const MOUSE_RADIUS = 200;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', () => { resize(); init(); });

  // Use window-level events so canvas z-index doesn't block interaction
  window.addEventListener('mousemove', e => { 
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left; 
    mouse.y = e.clientY - rect.top; 
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  
  // Pulse on click anywhere on hero section
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      pulse.active = true;
      pulse.x = e.clientX - rect.left;
      pulse.y = e.clientY - rect.top;
      pulse.radius = 0;
      pulse.alpha = 1;
    });
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.baseR = Math.random() * 2 + 1;
      this.r = this.baseR;
      this.colorType = Math.random() > 0.65 ? 'purple' : 'cyan';
      this.type = Math.random() > 0.85 ? 'square' : 'circle';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0) { this.x = 0; this.vx *= -1; }
      if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -1; }
      if (this.y < 0) { this.y = 0; this.vy *= -1; }
      if (this.y > canvas.height) { this.y = canvas.height; this.vy *= -1; }

      // Mouse magnetic pull
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.x += dx * force * 0.025;
          this.y += dy * force * 0.025;
          this.r = this.baseR + force * 2;
        } else {
          this.r += (this.baseR - this.r) * 0.1;
        }
      } else {
        this.r += (this.baseR - this.r) * 0.1;
      }

      // Pulse wave push
      if (pulse.active) {
        const dx = this.x - pulse.x;
        const dy = this.y - pulse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveFront = Math.abs(dist - pulse.radius);
        if (waveFront < 25 && dist > 0) {
          const strength = (25 - waveFront) / 25;
          this.vx += (dx / dist) * strength * 1.5;
          this.vy += (dy / dist) * strength * 1.5;
        }
      }
      // Speed limit
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 3) { this.vx = (this.vx / speed) * 3; this.vy = (this.vy / speed) * 3; }
    }

    draw() {
      const isCyan = this.colorType === 'cyan';
      const color = isCyan ? '0, 229, 255' : '124, 58, 237';
      ctx.shadowColor = `rgba(${color}, 0.9)`;
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(${color}, 0.85)`;
      ctx.beginPath();
      if (this.type === 'circle') {
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      } else {
        ctx.rect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function init() {
    resize();
    particles = [];
    dataPackets = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 11000), 130);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          let opacity = (1 - dist / MAX_DIST) * 0.25;

          // Boost connection brightness near mouse
          if (mouse.active) {
            const mx = (p1.x + p2.x) / 2 - mouse.x;
            const my = (p1.y + p2.y) / 2 - mouse.y;
            const md = Math.sqrt(mx * mx + my * my);
            if (md < MOUSE_RADIUS) opacity += (1 - md / MOUSE_RADIUS) * 0.4;
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${Math.min(opacity, 0.6)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Random data packet spawning
          if (Math.random() > 0.997 && dataPackets.length < 25) {
            dataPackets.push({
              p1, p2,
              reverse: Math.random() > 0.5,
              progress: 0,
              speed: Math.random() * 0.03 + 0.015
            });
          }
        }
      }
    }
  }

  function drawDataPackets() {
    for (let i = dataPackets.length - 1; i >= 0; i--) {
      const pk = dataPackets[i];
      pk.progress += pk.speed;
      if (pk.progress >= 1) { dataPackets.splice(i, 1); continue; }

      const t = pk.reverse ? 1 - pk.progress : pk.progress;
      const x = pk.p1.x + (pk.p2.x - pk.p1.x) * t;
      const y = pk.p1.y + (pk.p2.y - pk.p1.y) * t;

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawPulse() {
    if (!pulse.active) return;
    pulse.radius += 14;
    pulse.alpha = Math.max(0, 1 - pulse.radius / pulse.maxRadius);
    
    // Outer ring
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 229, 255, ${pulse.alpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner ring  
    if (pulse.radius > 30) {
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124, 58, 237, ${pulse.alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (pulse.radius >= pulse.maxRadius) pulse.active = false;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPulse();
    drawLines();
    drawDataPackets();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  init();
  animate();
})();
