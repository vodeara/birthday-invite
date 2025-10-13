// Простой конфетти-генератор на canvas
(function(){
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let particles = [];
  let running = false;
  let aniId = null;

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  const colors = ['#ff6f61','#ffd166','#06d6a0','#4cc9f0','#9d4edd','#ff9a76','#ffd6e0'];

  function makeParticle(){
    return {
      x: rand(0,w),
      y: rand(-50, -10),
      vx: rand(-1.5,1.5),
      vy: rand(2,6),
      size: rand(6,14),
      rot: rand(0,360),
      velRot: rand(-6,6),
      color: pick(colors),
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      alpha: 1
    };
  }

  function initParticles(count=80){
    particles = [];
    for(let i=0;i<count;i++) particles.push(makeParticle());
  }

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }

  function update(){
    ctx.clearRect(0,0,w,h);
    for(let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03; // gravity
      p.rot += p.velRot;
      p.alpha -= 0.002;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      if (p.shape === 'rect'){
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      } else {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.ellipse(0,0,p.size/2, p.size*0.6, 0, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
    // удалить оффскрин/прозрачные
    particles = particles.filter(p => p.y < h + 50 && p.alpha > 0.01);
    // если много меньше - добавим ещё
    if (running && particles.length < 80){
      for(let i=0;i<5;i++) particles.push(makeParticle());
    }
  }

  function loop(){
    update();
    aniId = requestAnimationFrame(loop);
  }

  // API
  window.confettiStart = function(){
    if (running) return;
    running = true;
    resize();
    initParticles(140);
    loop();
  };
  window.confettiStop = function(){
    running = false;
    cancelAnimationFrame(aniId);
    // очистим плавно
    let fade = setInterval(()=>{
      for(let p of particles) p.alpha -= 0.08;
      particles = particles.filter(p => p.alpha > 0.02);
      ctx.clearRect(0,0,w,h);
      for(let p of particles){
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        else { ctx.beginPath(); ctx.ellipse(0,0,p.size/2, p.size*0.6, 0, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      if (particles.length === 0) {
        clearInterval(fade);
        ctx.clearRect(0,0,w,h);
      }
    }, 50);
  };
  window.confettiResize = resize;

  // очистка при навигации
  window.addEventListener('beforeunload', ()=>{ cancelAnimationFrame(aniId); });

})();
