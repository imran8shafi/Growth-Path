import { fragmentShader } from './magic-rings-shader';

// A small GL host for the upstream shader; Expo GL and browser WebGL expose these APIs.
export function createRingRenderer(gl: WebGLRenderingContext, endFrame: () => void = () => {}) {
  const shaders: WebGLShader[] = [];
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader unavailable');
    shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Ring shader could not compile');
    return shader;
  };
  const program = gl.createProgram();
  let buffer: WebGLBuffer | null = null;
  const dispose = () => { if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); shaders.forEach((s) => gl.deleteShader(s)); };
  try {
    if (!program) throw new Error('GL program unavailable');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }'));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Ring program could not link');
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const loc = (name: string) => gl.getUniformLocation(program, name);
    const time = loc('uTime'); const resolution = loc('uResolution');
    Object.entries({ uAttenuation: 12, uLineThickness: 2, uBaseRadius: .18, uRadiusStep: .08, uScaleRate: .12, uOpacity: .55, uNoiseAmount: .015, uRotation: .7, uRingGap: 1.5, uFadeIn: .7, uFadeOut: .5, uMouseInfluence: 0, uHoverAmount: 0, uHoverScale: 1, uParallax: 0, uBurst: 0, uCoverageAlpha: 0 }).forEach(([name, value]) => gl.uniform1f(loc(name), value));
    gl.uniform1i(loc('uRingCount'), 5); gl.uniform2f(loc('uMouse'), 0, 0);
    gl.uniform3f(loc('uColor'), .33, .84, 1); gl.uniform3f(loc('uColorTwo'), .55, .49, 1);
    gl.clearColor(0, 0, 0, 0);
    return {
      draw(seconds: number) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(program);
        gl.uniform2f(resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.uniform1f(time, seconds * .45); gl.drawArrays(gl.TRIANGLES, 0, 6); gl.flush(); endFrame();
      }, dispose,
    };
  } catch (error) { dispose(); throw error; }
}
