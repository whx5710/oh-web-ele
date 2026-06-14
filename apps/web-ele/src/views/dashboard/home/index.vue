<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

/**
 * 动效方案切换：
 * - 'network' : 粒子网络连线（现代科技感，适合数据/管理平台）
 * - 'aura'    : 流光几何光环（精致律动感，适合品牌/展示型首页）
 */
const scheme = ref<'aura' | 'network'>('network');

const canvasRef = ref<HTMLCanvasElement | null>(null);
const mounted = ref(false);

let ctx: CanvasRenderingContext2D | null = null;
let canvasWidth = 0;
let canvasHeight = 0;
let dpr = 1;

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let mouseVelocity = 0;
let rafId: null | number = null;

/* ───────── 主题色工具 ───────── */
function getCssVar(varName: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/* ═══════════════════════════════════════
   方案 A：Particle Network（粒子网络）
   ═══════════════════════════════════════ */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

let particles: Particle[] = [];

function initNetwork() {
  particles = [];
  const area = canvasWidth * canvasHeight;
  const count = Math.min(Math.max(Math.floor(area / 12_000), 40), 100);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.5 + 1,
      alpha: Math.random() * 0.5 + 0.3,
    });
  }
}

function drawNetwork() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const primary = getCssVar('--primary');
  const destructive = getCssVar('--destructive');
  const c = (hsl: string, a: number) => `hsl(${hsl} / ${a})`;

  // 鼠标平滑跟随
  currentX += (mouseX - currentX) * 0.1;
  currentY += (mouseY - currentY) * 0.1;

  const maxDist = 130;
  const mouseRadius = 160;

  // 更新粒子位置 & 鼠标排斥
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvasWidth) p.vx *= -1;
    if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

    const dx = p.x - currentX;
    const dy = p.y - currentY;
    const dist = Math.hypot(dx, dy);
    if (dist < mouseRadius && dist > 0) {
      const force = (mouseRadius - dist) / mouseRadius;
      p.x += (dx / dist) * force * 2.5;
      p.y += (dy / dist) * force * 2.5;
    }
  }

  // 绘制连线（粒子间 + 鼠标）
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i++) {
    const pi = particles[i] as Particle;
    for (let j = i + 1; j < particles.length; j++) {
      const pj = particles[j] as Particle;
      const dx = pi.x - pj.x;
      const dy = pi.y - pj.y;
      const dist = Math.hypot(dx, dy);
      if (dist < maxDist) {
        const a = (1 - dist / maxDist) * 0.2;
        ctx.strokeStyle = c(primary, a);
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.stroke();
      }
    }

    const dx = pi.x - currentX;
    const dy = pi.y - currentY;
    const dist = Math.hypot(dx, dy);
    if (dist < maxDist * 1.5) {
      const a = (1 - dist / (maxDist * 1.5)) * 0.35;
      ctx.strokeStyle = c(primary, a);
      ctx.beginPath();
      ctx.moveTo(pi.x, pi.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    }
  }

  // 绘制粒子
  for (const p of particles) {
    ctx.beginPath();
    ctx.fillStyle = c(primary, p.alpha);
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 鼠标核心发光点
  ctx.beginPath();
  ctx.fillStyle = c(destructive, 0.9);
  ctx.shadowBlur = 15;
  ctx.shadowColor = c(destructive, 0.5);
  ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

/* ═══════════════════════════════════════
   方案 B：Geometric Aura（几何光环）
   ═══════════════════════════════════════ */
const trail: Array<{ age: number; x: number; y: number; }> = [];
const maxTrail = 30;
let breath = 0;
let rotation = 0;

function drawPolygon(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  angle: number,
  color: string,
  lineWidth: number,
) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  for (let i = 0; i <= sides; i++) {
    const theta = angle + (i * 2 * Math.PI) / sides;
    const px = cx + radius * Math.cos(theta);
    const py = cy + radius * Math.sin(theta);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawStar(
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
  color: string,
  lineWidth: number,
  rotate: number,
) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const theta = rotate + i * step;
    const px = cx + r * Math.cos(theta);
    const py = cy + r * Math.sin(theta);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawAura() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const primary = getCssVar('--primary');
  const destructive = getCssVar('--destructive');
  const c = (hsl: string, a: number) => `hsl(${hsl} / ${a})`;

  currentX += (mouseX - currentX) * 0.12;
  currentY += (mouseY - currentY) * 0.12;

  const dx = mouseX - currentX;
  const dy = mouseY - currentY;
  mouseVelocity = mouseVelocity * 0.85 + Math.hypot(dx, dy) * 0.15;

  // 更新轨迹
  trail.push({ x: currentX, y: currentY, age: 0 });
  if (trail.length > maxTrail) trail.shift();
  for (const t of trail) t.age++;

  // 绘制发光拖尾
  if (trail.length > 1) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1] as (typeof trail)[0];
      const cur = trail[i] as (typeof trail)[0];
      const ageRatio = cur.age / maxTrail;
      const width = (1 - ageRatio) * 8 + 1;
      const alpha = (1 - ageRatio) * 0.5;
      ctx.beginPath();
      ctx.strokeStyle = c(primary, alpha);
      ctx.lineWidth = width;
      ctx.shadowBlur = (1 - ageRatio) * 25 + 5;
      ctx.shadowColor = c(primary, alpha * 0.6);
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 呼吸动画
  breath += 0.03;
  const breatheScale = 1 + Math.sin(breath) * 0.06;

  // 旋转受鼠标速度影响
  rotation += 0.004 + Math.min(mouseVelocity * 0.002, 0.04);

  const cx = currentX;
  const cy = currentY;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(breatheScale, breatheScale);

  // 外层八角星（极慢旋转）
  ctx.save();
  ctx.rotate(rotation * 0.3);
  drawStar(0, 0, 8, 90, 50, c(primary, 0.2), 1.5, 0);
  ctx.restore();

  // 中层方形（反向旋转）
  ctx.save();
  ctx.rotate(-rotation * 0.5);
  drawPolygon(0, 0, 75, 4, Math.PI / 4, c(primary, 0.35), 2);
  ctx.restore();

  // 内层六边形（同向快旋）
  ctx.save();
  ctx.rotate(rotation * 0.8);
  drawPolygon(0, 0, 48, 6, 0, c(primary, 0.5), 1.5);
  ctx.restore();

  // 六边形顶点装饰点
  for (let i = 0; i < 6; i++) {
    const theta = rotation * 0.8 + (i * 2 * Math.PI) / 6;
    const px = 48 * Math.cos(theta);
    const py = 48 * Math.sin(theta);
    ctx.beginPath();
    ctx.fillStyle = c(primary, 0.7);
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 核心发光点
  ctx.beginPath();
  ctx.fillStyle = c(destructive, 0.95);
  ctx.shadowBlur = 25;
  ctx.shadowColor = c(destructive, 0.6);
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

/* ───────── 核心循环 ───────── */
function resize() {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (scheme.value === 'network') initNetwork();
}

function drawFrame() {
  if (!ctx) return;
  if (scheme.value === 'network') {
    drawNetwork();
  } else {
    drawAura();
  }
  rafId = requestAnimationFrame(drawFrame);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();

  const handleResize = () => resize();
  window.addEventListener('resize', handleResize);

  const rect = canvas.getBoundingClientRect();
  currentX = rect.width / 2;
  currentY = rect.height / 2;
  mouseX = currentX;
  mouseY = currentY;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvasRef.value?.getBoundingClientRect();
    if (!rect) return;
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  };

  window.addEventListener('mousemove', handleMouseMove);
  mounted.value = true;
  rafId = requestAnimationFrame(drawFrame);

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    if (rafId !== null) cancelAnimationFrame(rafId);
  });
});
</script>

<template>
  <Page auto-content-height content-class="!p-0 overflow-hidden">
    <div class="home-container">
      <canvas ref="canvasRef" class="geometry-canvas"></canvas>
      <div class="slogan-wrapper">
        <h1 class="slogan">逐光而行，未来可期</h1>
        <p class="slogan-en">Chase the light, embrace the future.</p>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.home-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  font-family:
    'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
}

.geometry-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.slogan-wrapper {
  position: relative;
  z-index: 1;
  padding: 40px 60px;
  text-align: center;
  user-select: none;
  background: hsl(var(--background) / 40%);
  border: 1px solid hsl(var(--border) / 10%);
  border-radius: 20px;
  backdrop-filter: blur(8px);
  animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.slogan {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  line-height: 1.3;
  color: hsl(var(--foreground));
  letter-spacing: 6px;
  text-shadow: 0 2px 12px hsl(var(--foreground) / 8%);
}

.slogan-en {
  margin-top: 18px;
  font-size: 18px;
  font-weight: 300;
  color: hsl(var(--muted-foreground));
  letter-spacing: 2px;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
