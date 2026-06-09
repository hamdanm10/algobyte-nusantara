import { Controller } from "@hotwired/stimulus";

const PLANE_COUNT = 7;
const TRAIL_LENGTH = 80;
const STEER_FACTOR = 0.018;
const TARGET_THRESHOLD = 50;
const HOME_DRIFT_CHANCE = 0.3;

const SVG_NS = "http://www.w3.org/2000/svg";
const PLANE_SVG = `
  <path d="M 22 0 L -14 -16 L -8 0 L -14 16 Z" fill="white" stroke="#6b7280" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
  <line x1="-8" y1="0" x2="-14" y2="-16" stroke="#6b7280" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
  <line x1="22" y1="0" x2="-8" y2="0" stroke="#6b7280" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
`;

export default class extends Controller {
  connect() {
    requestAnimationFrame(() => {
      this.planes = Array.from({ length: PLANE_COUNT }, (_, i) =>
        this.#createPlane(i),
      );
      this.tick();
    });
  }

  disconnect() {
    cancelAnimationFrame(this.raf);
  }

  tick() {
    const pageWidth = window.innerWidth;
    const pageHeight = document.body.scrollHeight;

    for (const p of this.planes) {
      this.#steer(p);
      this.#move(p);
      this.#checkTarget(p, pageWidth, pageHeight);
      this.#render(p);
    }

    this.raf = requestAnimationFrame(() => this.tick());
  }

  #steer(p) {
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    p.vx += ((dx / dist) * p.speed - p.vx) * STEER_FACTOR;
    p.vy += ((dy / dist) * p.speed - p.vy) * STEER_FACTOR;

    const s = Math.hypot(p.vx, p.vy);
    if (s > 0) {
      p.vx = (p.vx / s) * p.speed;
      p.vy = (p.vy / s) * p.speed;
    }
  }

  #move(p) {
    p.x += p.vx;
    p.y += p.vy;
  }

  #checkTarget(p, pageWidth, pageHeight) {
    const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
    if (dist < TARGET_THRESHOLD) this.#pickTarget(p, pageWidth, pageHeight);
  }

  #pickTarget(p, pageWidth, pageHeight) {
    const band = window.innerHeight * 0.5;
    const top = Math.max(60, p.homeY - band);
    const bot = Math.min(pageHeight - 60, p.homeY + band);

    p.targetX = 60 + Math.random() * (pageWidth - 120);
    p.targetY = top + Math.random() * (bot - top);

    if (Math.random() < HOME_DRIFT_CHANCE) {
      const drift = (Math.random() - 0.5) * window.innerHeight * 0.4;
      p.homeY = Math.max(100, Math.min(pageHeight - 100, p.homeY + drift));
    }
  }

  #render(p) {
    const angle = Math.atan2(p.vy, p.vx) * (180 / Math.PI);

    p.history.push(`${p.x},${p.y}`);
    if (p.history.length > TRAIL_LENGTH) p.history.shift();

    p.trail.setAttribute("points", p.history.join(" "));
    p.plane.setAttribute(
      "transform",
      `translate(${p.x} ${p.y}) rotate(${angle})`,
    );
  }

  #createPlane(index) {
    const pageWidth = window.innerWidth;
    const pageHeight = document.body.scrollHeight;

    const homeY = pageHeight * ((index + 0.5) / PLANE_COUNT);
    const x = 60 + Math.random() * (pageWidth - 120);
    const y = homeY + (Math.random() - 0.5) * window.innerHeight * 0.3;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 1.8;

    return {
      ...this.#createSVGElements(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      homeY,
      targetX: 60 + Math.random() * (pageWidth - 120),
      targetY: homeY + (Math.random() - 0.5) * window.innerHeight * 0.4,
      history: [],
    };
  }

  #createSVGElements() {
    const trail = document.createElementNS(SVG_NS, "polyline");
    Object.entries({
      fill: "none",
      stroke: "#9ca3af",
      "stroke-width": "1.5",
      "stroke-dasharray": "4 8",
      "stroke-linecap": "round",
      opacity: "0.45",
      points: "",
    }).forEach(([k, v]) => trail.setAttribute(k, v));
    this.element.appendChild(trail);

    const plane = document.createElementNS(SVG_NS, "g");
    plane.setAttribute("opacity", "0.45");
    plane.innerHTML = PLANE_SVG;
    this.element.appendChild(plane);

    return { trail, plane };
  }
}
