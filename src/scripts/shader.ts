// 모션 3층 — 히어로 배경 셰이더(OGL). 천천히 흐르는 어두운 금속 광택.
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uBright;
  uniform vec2 uRes;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uRes.x / uRes.y;
    float t = uTime * 0.035;
    // 비스듬히 흐르는 금속 띠
    float n = fbm(uv * 1.6 + vec2(t, -t * 0.6));
    float band = sin((uv.x * 1.2 + uv.y * 2.2) * 3.0 + n * 4.0 + t * 6.0);
    float sheen = smoothstep(0.55, 1.0, band) * (0.35 + 0.65 * n);
    vec3 metal = vec3(0.16, 0.17, 0.19);
    vec3 amber = vec3(1.0, 0.54, 0.12);
    vec3 col = metal * sheen * (0.55 + uBright * 0.6);
    col += amber * sheen * 0.025 * uBright;
    // 가장자리로 갈수록 약하게 (배경 격자 위에 screen 합성)
    float vig = smoothstep(1.25, 0.25, length(vUv - vec2(0.6, 0.45)));
    col *= mix(0.3, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createHeroShader(canvas: HTMLCanvasElement, host: HTMLElement, getBright: () => number): void {
  const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false });
  const gl = renderer.gl;
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: { uTime: { value: 0 }, uBright: { value: 0 }, uRes: { value: [1, 1] } },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  function resize(): void {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    program.uniforms.uRes.value = [width, height];
  }
  resize();
  new ResizeObserver(resize).observe(host);

  // 화면 밖이거나 탭이 숨겨지면 멈춤
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);

  let bright = 0;
  function frame(t: number): void {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    bright += (getBright() - bright) * 0.05;
    program.uniforms.uTime.value = t * 0.001;
    program.uniforms.uBright.value = bright;
    renderer.render({ scene: mesh });
  }
  requestAnimationFrame(frame);
}
