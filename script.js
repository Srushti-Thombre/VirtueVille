// small parallax-like movement for hero background
(function(){
  const bg = document.querySelector('.hero-bg');
  if(!bg) return;

  // subtle mouse-follow transform
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12; // left-right
    const y = (e.clientY / window.innerHeight - 0.5) * 8; // up-down
    bg.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
  });

  // tiny floating loop so background isn't static on touch devices
  let t = 0;
  function loop(){
    t += 0.01;
    // small up/down
    const dy = Math.sin(t) * 2;
    bg.style.transform = bg.style.transform + ` translateY(${dy}px)`;
    requestAnimationFrame(loop);
  }
  // keep loop disabled by default because it stacks with mouse transform
  // if you want auto-float for all devices, uncomment next line:
  // requestAnimationFrame(loop);
})();
