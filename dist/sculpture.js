(() => {
  'use strict';
  const canvas = document.querySelector('#sculpture');
  const wrap = canvas.parentElement;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!gl) return;
  const vertex = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uModel;
    uniform mat4 uProjection;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main(){
      vec4 world = uModel * vec4(aPosition, 1.0);
      vNormal = mat3(uModel) * aNormal;
      vPosition = world.xyz;
      gl_Position = uProjection * vec4(world.xyz + vec3(0.0, 0.0, -10.7), 1.0);
    }
  `;
  const fragment = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main(){
      vec3 n = normalize(vNormal);
      vec3 eye = normalize(vec3(0.0, 0.0, 10.7) - vPosition);
      vec3 key = normalize(vec3(-3.0, 5.0, 6.0));
      vec3 fill = normalize(vec3(4.0, 0.0, 2.0));
      vec3 rimLight = normalize(vec3(1.0, 3.0, -2.0));
      float diffuse = max(dot(n, key), 0.0);
      float fillDiffuse = max(dot(n, fill), 0.0);
      float edge = pow(1.0 - max(dot(n, eye), 0.0), 3.0);
      float gloss = pow(max(dot(n, normalize(key + eye)), 0.0), 45.0);
      float broad = pow(max(dot(n, normalize(fill + eye)), 0.0), 12.0);
      vec3 color = vec3(0.022, 0.085, 0.77) * (0.21 + diffuse * 0.96 + fillDiffuse * 0.33);
      color += vec3(0.15, 0.41, 1.0) * broad * 0.7;
      color += vec3(0.79, 0.9, 1.0) * gloss * 0.8;
      color += vec3(0.14, 0.48, 1.0) * edge * (0.18 + 0.6 * max(dot(n, rimLight), 0.0));
      float ribbon = pow(max(0.0, 1.0 - abs(dot(n, normalize(vec3(-0.6, 1.0, 0.5))) - 0.62) * 17.0), 2.0);
      color += vec3(0.18, 0.43, 0.95) * ribbon * 0.25;
      gl_FragColor = vec4(pow(color, vec3(0.82)), 1.0);
    }
  `;
  function shader(type, source) {
    const object = gl.createShader(type);
    gl.shaderSource(object, source);
    gl.compileShader(object);
    if (!gl.getShaderParameter(object, gl.COMPILE_STATUS)) throw new Error('Visual shader could not compile');
    return object;
  }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  } catch { return; }
  gl.useProgram(program);
  const normalize = v => { const length = Math.hypot(...v); return v.map(x => x / (length || 1)); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const point = t => [(2 + .72 * Math.cos(3 * t)) * Math.cos(2 * t), (2 + .72 * Math.cos(3 * t)) * Math.sin(2 * t), 1.13 * Math.sin(3 * t)];
  const positions = [], normals = [], indices = [];
  const rings = 360, segments = 24, radius = .38;
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings * Math.PI * 2;
    const center = point(t), before = point(t - .001), after = point(t + .001);
    const tangent = normalize(after.map((x, i) => x - before[i]));
    const normal = normalize(cross(tangent, [0, 0, 1]));
    const binormal = normalize(cross(tangent, normal));
    for (let segment = 0; segment <= segments; segment++) {
      const a = segment / segments * Math.PI * 2;
      const n = normal.map((v, i) => v * Math.cos(a) + binormal[i] * Math.sin(a));
      positions.push(...center.map((x, i) => x + n[i] * radius));
      normals.push(...n);
      if (ring < rings && segment < segments) {
        const i = ring * (segments + 1) + segment;
        indices.push(i, i + segments + 1, i + 1, i + 1, i + segments + 1, i + segments + 2);
      }
    }
  }
  function attribute(name, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  }
  attribute('aPosition', positions);
  attribute('aNormal', normals);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  const modelLocation = gl.getUniformLocation(program, 'uModel');
  const projectionLocation = gl.getUniformLocation(program, 'uProjection');
  const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  function multiply(a, b) {
    const out = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return out;
  }
  function rotationX(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function rotationY(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function rotationZ(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.6);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const f = 1 / Math.tan(.67 / 2), aspect = canvas.width / canvas.height, near = .1, far = 100;
    gl.uniformMatrix4fv(projectionLocation, false, new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]));
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true, pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, frameId = 0, previous = 0, elapsed = 0;
  function render(time) {
    frameId = 0;
    if (!inView || document.hidden) { previous = 0; return; }
    const delta = previous ? Math.min(time - previous, 60) : 0;
    previous = time;
    if (!reduced.matches) elapsed += delta / 1000;
    smoothX += (pointerX - smoothX) * .045;
    smoothY += (pointerY - smoothY) * .045;
    const model = multiply(rotationZ(-.55), multiply(rotationY(.38 + elapsed * .12 + smoothX * .15), rotationX(.62 + smoothY * .12)));
    gl.uniformMatrix4fv(modelLocation, false, new Float32Array(model));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    if (!reduced.matches) frameId = requestAnimationFrame(render);
  }
  function start() { if (!frameId && inView && !document.hidden) frameId = requestAnimationFrame(render); }
  function stop() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; previous = 0; }
  window.addEventListener('pointermove', event => { if (!reduced.matches && event.pointerType !== 'touch') { pointerX = event.clientX / window.innerWidth - .5; pointerY = event.clientY / window.innerHeight - .5; } }, { passive: true });
  window.addEventListener('resize', () => { resize(); start(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  reduced.addEventListener('change', () => { stop(); start(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView) start(); else stop(); }).observe(wrap);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); stop(); wrap.classList.remove('ready'); });
  resize();
  start();
  wrap.classList.add('ready');
})();
