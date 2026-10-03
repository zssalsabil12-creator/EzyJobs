import { useEffect, useRef } from 'react';

interface Star {
  fx: number;
  fy: number;
  x: number;
  y: number;
  z: number;
  r: number;
  baseA: number;
  speed: number;
  phase: number;
  sprite: number;
  vx: number;
  vy: number;
  bright: boolean;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const SPRITE_COLORS: [number, number, number][] = [
  [232, 201, 122], // champagne gold
  [242, 237, 228], // pearl
  [224, 165, 140], // rose gold
  [150, 172, 222], // sapphire whisper
];

function makeSprite([r, g, b]: [number, number, number]) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.22, `rgba(${r},${g},${b},0.6)`);
  grad.addColorStop(0.55, `rgba(${r},${g},${b},0.16)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return c;
}

/**
 * سماء فلكية حية: نجوم متوهجة متلألئة على طبقات عمق،
 * شهب عابرة، سدم ذهبية منزلقة، وخطوط كوكبات خافتة —
 * كلها بتركيبة obsidian + gold + rose.
 */
export default function Starfield({
  className = '',
  density = 1,
  meteors = true,
}: {
  className?: string;
  density?: number;
  meteors?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const sprites = SPRITE_COLORS.map(makeSprite);

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let stars: Star[] = [];
    let links: [number, number][] = [];
    const meteorsLive: Meteor[] = [];
    let nextMeteor = performance.now() + 2500;
    const par = { x: 0, y: 0, tx: 0, ty: 0 };

    const seed = () => {
      const count = Math.min(250, Math.max(60, Math.floor(((w * h) / 8500) * density)));
      stars = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75;
        const bright = Math.random() < 0.1;
        return {
          fx: Math.random(),
          fy: Math.random(),
          x: 0,
          y: 0,
          z,
          r: (bright ? 1.9 + Math.random() * 1.3 : 0.6 + Math.random() * 1.3) * (0.5 + z * 0.7),
          baseA: 0.35 + Math.random() * 0.55,
          speed: 0.4 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
          sprite: weightedSprite(),
          vx: (Math.random() - 0.5) * 0.05 * z,
          vy: (Math.random() - 0.5) * 0.04 * z,
          bright,
        } as Star;
      });
      layout();
      // كوكبات: اربط النجوم الساطعة بأقرب جار ساطع
      const brightIdx = stars.map((s, i) => (s.bright ? i : -1)).filter((i) => i >= 0);
      links = [];
      for (const i of brightIdx) {
        let best = -1;
        let bestD = 170 * 170;
        for (const j of brightIdx) {
          if (i === j) continue;
          const dx = stars[i].fx - stars[j].fx;
          const dy = stars[i].fy - stars[j].fy;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = j;
          }
        }
        if (best >= 0) links.push([i, best]);
      }
    };

    const weightedSprite = () => {
      const roll = Math.random();
      if (roll < 0.42) return 0;
      if (roll < 0.68) return 1;
      if (roll < 0.88) return 2;
      return 3;
    };

    const layout = () => {
      for (const s of stars) {
        s.x = s.fx * w;
        s.y = s.fy * h;
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const spawnMeteor = () => {
      if (meteorsLive.length >= 2) return;
      const fromLeft = Math.random() < 0.5;
      const speed = 7 + Math.random() * 5;
      // زاوية انحدار ~30°: من اليمين-أعلى إلى اليسار-أسفل أو العكس
      const dir = fromLeft ? 1 : -1;
      const ang = 32 * (Math.PI / 180);
      meteorsLive.push({
        x: Math.random() * w * 0.9,
        y: -20 - Math.random() * h * 0.25,
        vx: Math.cos(ang) * speed * dir,
        vy: Math.abs(Math.sin(ang)) * speed,
        life: 1,
        maxLife: 0.9 + Math.random() * 0.5,
      });
      nextMeteor = performance.now() + 3500 + Math.random() * 5000;
    };

    const drawNebula = (t: number) => {
      const blobs = [
        { fx: 0.82 + Math.sin(t * 0.00006) * 0.04, fy: 0.12 + Math.cos(t * 0.00005) * 0.04, r: 0.42, c: '212,175,106', a: 0.075 },
        { fx: 0.1 + Math.cos(t * 0.00004) * 0.04, fy: 0.3 + Math.sin(t * 0.00007) * 0.05, r: 0.38, c: '58,86,150', a: 0.09 },
        { fx: 0.5 + Math.sin(t * 0.00005 + 2) * 0.05, fy: 0.95 + Math.cos(t * 0.00006) * 0.03, r: 0.4, c: '201,138,109', a: 0.06 },
      ];
      for (const b of blobs) {
        const bx = b.fx * w;
        const by = b.fy * h;
        const br = Math.max(w, h) * b.r;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, `rgba(${b.c},${b.a})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const t = reduced ? 0 : now;
      ctx.clearRect(0, 0, w, h);

      par.x += (par.tx - par.x) * 0.03;
      par.y += (par.ty - par.y) * 0.03;

      drawNebula(t);

      ctx.globalCompositeOperation = 'lighter';

      // خطوط الكوكبات
      ctx.lineWidth = 1;
      for (const [i, j] of links) {
        const a = stars[i];
        const b = stars[j];
        const ax = a.x + par.x * 16 * a.z;
        const ay = a.y + par.y * 16 * a.z;
        const bx = b.x + par.x * 16 * b.z;
        const by = b.y + par.y * 16 * b.z;
        ctx.strokeStyle = 'rgba(232,201,122,0.10)';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // النجوم
      for (const s of stars) {
        if (!reduced) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < -12) s.x = w + 12;
          if (s.x > w + 12) s.x = -12;
          if (s.y < -12) s.y = h + 12;
          if (s.y > h + 12) s.y = -12;
        }
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        const alpha = s.baseA * tw;
        if (alpha <= 0.02) continue;
        const px = s.x + par.x * 16 * s.z;
        const py = s.y + par.y * 16 * s.z;
        const pulse = reduced ? 1 : 1 + 0.18 * Math.sin(t * 0.001 * s.speed + s.phase);
        const size = Math.max(3, s.r * 7 * pulse);
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.drawImage(sprites[s.sprite], px - size / 2, py - size / 2, size, size);
        // وميض متقاطع للنجوم الساطعة
        if (s.bright && alpha > 0.4) {
          const L = s.r * 7;
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = 'rgba(242,237,228,0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - L, py);
          ctx.lineTo(px + L, py);
          ctx.moveTo(px, py - L);
          ctx.lineTo(px, py + L);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // الشهب
      if (meteors && !reduced) {
        if (now >= nextMeteor) spawnMeteor();
        for (let i = meteorsLive.length - 1; i >= 0; i--) {
          const m = meteorsLive[i];
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 1 / 60 / m.maxLife;
          if (m.life <= 0 || m.x < -200 || m.x > w + 200 || m.y > h + 200) {
            meteorsLive.splice(i, 1);
            continue;
          }
          const fade = Math.min(1, m.life * 2);
          const tx = m.x - m.vx * 9;
          const ty = m.y - m.vy * 9;
          const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
          g.addColorStop(0, `rgba(255,250,235,${0.9 * fade})`);
          g.addColorStop(0.3, `rgba(232,201,122,${0.5 * fade})`);
          g.addColorStop(1, 'rgba(232,201,122,0)');
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,255,255,${fade})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      par.tx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      par.ty = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    };
    const onLeave = () => {
      par.tx = 0;
      par.ty = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );

    resize();
    raf = requestAnimationFrame(frame);

    const parent = canvas.parentElement;
    parent?.addEventListener('pointermove', onMove);
    parent?.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', resize);
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      parent?.removeEventListener('pointermove', onMove);
      parent?.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, [density, meteors]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
