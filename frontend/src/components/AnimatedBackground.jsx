import { useEffect, useRef } from "react";

export default function AnimatedBackground({ style }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W, H, t = 0;

    const NAVY  = [26,  46,  107];
    const STEEL = [77,  102, 128];
    const TEAL  = [15,  168, 217];

    function rgba(c, a) {
      return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }

    const BLOBS = [
      { cx: 0.12, cy: 0.18, r: 0.30, col: TEAL,  a: 0.045, spd: 0.00008 },
      { cx: 0.82, cy: 0.14, r: 0.24, col: NAVY,  a: 0.038, spd: 0.00006 },
      { cx: 0.52, cy: 0.78, r: 0.32, col: STEEL, a: 0.030, spd: 0.00007 },
      { cx: 0.88, cy: 0.62, r: 0.22, col: TEAL,  a: 0.026, spd: 0.00009 },
      { cx: 0.25, cy: 0.65, r: 0.20, col: NAVY,  a: 0.028, spd: 0.00005 },
    ];

    function drawBlobs() {
      for (const b of BLOBS) {
        const cx = (b.cx + Math.sin(t * b.spd * 60) * 0.06) * W;
        const cy = (b.cy + Math.cos(t * b.spd * 40) * 0.05) * H;
        const r  = b.r * Math.min(W, H);
        const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,   rgba(b.col, b.a));
        g.addColorStop(0.5, rgba(b.col, b.a * 0.4));
        g.addColorStop(1,   rgba(b.col, 0));
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    const LINES = 18;
    function drawContours() {
      for (let i = 0; i < LINES; i++) {
        const y0    = (H / (LINES + 1)) * (i + 1);
        const amp   = 28 + i * 3;
        const freq  = 0.0018 + i * 0.00012;
        const spd   = 0.00025 * (i % 2 === 0 ? 1 : -1);
        const col   = i % 3 === 0 ? TEAL : i % 3 === 1 ? NAVY : STEEL;
        const alpha = Math.max(0.006, 0.055 - i * 0.001);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = y0
            + Math.sin(x * freq + t * spd * 60 + i * 0.8) * amp
            + Math.sin(x * freq * 1.7 - t * spd * 40) * (amp * 0.45);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(col, alpha);
        ctx.lineWidth   = 1.2;
        ctx.stroke();
      }
    }

    const DOTS = [];
    function initDots() {
      DOTS.length = 0;
      const count = Math.floor((W * H) / 18000);
      for (let i = 0; i < count; i++) {
        const col = i % 3 === 0 ? TEAL : i % 3 === 1 ? NAVY : STEEL;
        DOTS.push({
          x:   Math.random() * W,
          y:   Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r:   Math.random() * 1.8 + 0.6,
          col,
          a:   Math.random() * 0.18 + 0.07,
        });
      }
    }

    function updateDots() {
      for (const d of DOTS) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
      }
    }

    function drawDots() {
      for (const d of DOTS) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(d.col, d.a);
        ctx.fill();
      }
    }

    const CONNECT = 90;
    function drawConnections() {
      for (let i = 0; i < DOTS.length; i++) {
        for (let j = i + 1; j < DOTS.length; j++) {
          const dx   = DOTS[i].x - DOTS[j].x;
          const dy   = DOTS[i].y - DOTS[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT) {
            ctx.beginPath();
            ctx.moveTo(DOTS[i].x, DOTS[i].y);
            ctx.lineTo(DOTS[j].x, DOTS[j].y);
            ctx.strokeStyle = rgba(NAVY, 0.07 * (1 - dist / CONNECT));
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initDots();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function loop(ts) {
      t = ts;
      ctx.clearRect(0, 0, W, H);
      drawBlobs();
      drawContours();
      updateDots();
      drawConnections();
      drawDots();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
