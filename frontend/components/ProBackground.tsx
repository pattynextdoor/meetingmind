import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;

  // Pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Round function for WebGL 1.0 compatibility
  float myRound(float v) {
    return floor(v + 0.5);
  }

  void main() {
    // Colors
    vec3 bg = vec3(1.0, 1.0, 1.0);
    vec3 gridColor = vec3(0.85, 0.88, 0.9); 
    vec3 packetColor = vec3(0.0, 0.7, 0.55); // Vibrant Teal
    vec3 nodeColor = vec3(0.1, 0.8, 0.6);    // Emerald

    // Normalized pixel coordinates
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    
    // Aspect ratio correction
    float aspect = resolution.x/resolution.y;
    uv.x *= aspect;
    
    // Mouse coords (flip Y and correct aspect)
    vec2 m = mouse/resolution.xy;
    m.y = 1.0 - m.y; 
    m.x *= aspect;

    // Grid scale
    float scale = 12.0; 
    vec2 gridPos = uv * scale;
    vec2 nearestNode = floor(gridPos + 0.5);
    
    // 1. Grid Lines
    float distX = abs(gridPos.x - myRound(gridPos.x));
    float distY = abs(gridPos.y - myRound(gridPos.y));
    
    float lineWidth = 0.03;
    float gridLines = 0.0;
    
    // Crisp lines
    gridLines += 1.0 - smoothstep(lineWidth-0.01, lineWidth+0.01, distX);
    gridLines += 1.0 - smoothstep(lineWidth-0.01, lineWidth+0.01, distY);
    gridLines = clamp(gridLines, 0.0, 1.0);
    
    // 2. Traversing Packets (Background simulation)
    float t = time * 1.0; 
    float flow = 0.0;
    
    // Horizontal
    if (distY < lineWidth * 3.0) {
        float rowId = myRound(gridPos.y);
        float rowHash = random(vec2(0.0, rowId));
        float dir = mod(rowId, 2.0) < 1.0 ? 1.0 : -1.0; 
        float speed = (rowHash * 0.5 + 0.5) * dir;
        
        float phase = fract(gridPos.x * 0.1 + t * speed + rowHash * 100.0);
        // Sharper, shorter packets
        float packet = smoothstep(0.0, 0.1, phase) * smoothstep(0.3, 0.1, phase);
        if (rowHash > 0.4) flow += packet;
    }
    
    // Vertical
    if (distX < lineWidth * 3.0) {
        float colId = myRound(gridPos.x);
        float colHash = random(vec2(colId, 0.0));
        float dir = mod(colId, 2.0) < 1.0 ? 1.0 : -1.0;
        float speed = (colHash * 0.5 + 0.5) * dir;
        
        float phase = fract(gridPos.y * 0.1 + t * speed + colHash * 100.0);
        float packet = smoothstep(0.0, 0.1, phase) * smoothstep(0.3, 0.1, phase);
        if (colHash > 0.4) flow += packet;
    }
    
    // 3. Nodes
    float distToNode = length(gridPos - nearestNode);
    float nodeSize = 0.14;
    float node = 1.0 - smoothstep(nodeSize-0.02, nodeSize+0.02, distToNode);
    
    // 4. Interaction / Reveal Logic
    float dMouse = length(uv - m);
    // Tighter reveal radius (0.3), soft edge
    float reveal = smoothstep(0.3, 0.0, dMouse);
    // Core intensity (near mouse is stronger)
    float core = smoothstep(0.15, 0.0, dMouse);
    
    // --- Composition ---
    vec3 color = bg;
    
    // Base State (Idle): Faint grid only
    float idleGrid = gridLines * 0.15;
    
    // Active State (Hover): Bright grid + Packets + Nodes
    float activeGrid = gridLines * 0.6;
    float activeFlow = flow * gridLines; // Flow confined to lines
    float activeNodes = node * (0.3 + flow * 1.5); // Nodes pulse with flow
    
    // Blend based on reveal
    // 1. Grid becomes stronger
    float finalGrid = mix(idleGrid, activeGrid, reveal);
    color = mix(color, gridColor, finalGrid);
    
    // 2. Flow appears
    color = mix(color, packetColor, activeFlow * reveal);
    
    // 3. Nodes appear
    color = mix(color, nodeColor, activeNodes * reveal);
    
    // 4. Mouse glow (Warmth)
    color = mix(color, vec3(1.0, 0.95, 0.8), core * 0.15);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const ProBackground = ({ className = "absolute inset-0 w-full h-full pointer-events-none", opacity = 1.0 }: { className?: string, opacity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const mouseLocation = gl.getUniformLocation(program, 'mouse');

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000;
      
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.uniform1f(timeLocation, currentTime);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ opacity }} />;
};
