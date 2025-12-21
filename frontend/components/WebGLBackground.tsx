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

  // Simple hash function for noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Normalize mouse position
    vec2 mouseUV = mouse / resolution.xy;
    // Fix Y coordinate for mouse (webgl vs screen coords)
    mouseUV.y = 1.0 - mouseUV.y;
    
    // Calculate distance to mouse for interaction
    float mouseDist = distance(uv, mouseUV);
    float mouseInfluence = smoothstep(0.5, 0.0, mouseDist);
    
    float t = time * 0.15;
    
    // Create organic movement with multiple sine waves
    // Add mouse influence to the wave phases
    float v1 = sin(uv.x * 2.0 + t + mouseInfluence * 2.0);
    float v2 = sin(uv.y * 3.0 + t * 1.2 - mouseInfluence);
    float v3 = sin((uv.x + uv.y) * 2.5 - t * 0.8 + mouseInfluence * 0.5);
    float v4 = sin(length(uv - 0.5) * 5.0 + t * 0.5);
    
    float wave = (v1 + v2 + v3 + v4) * 0.25;
    
    // Clear zone mask around mouse
    // Tightened radius for the clear effect
    float clearMask = smoothstep(0.02, 0.25, mouseDist);

    // Add high-frequency noise for texture - SIGNIFICANTLY increased intensity
    float noise = hash(uv * 100.0 + time * 0.1) * 0.25 * clearMask;
    float grain = hash(uv * 400.0 + t) * 0.15 * clearMask;
    
    // Theme colors: Stone, Emerald, and a hint of Purple for depth
    vec3 baseColor = vec3(0.98, 0.98, 0.97); // #faf9f7 equivalent
    vec3 accent1 = vec3(0.85, 0.93, 0.88);   // Very pale emerald
    vec3 accent2 = vec3(0.92, 0.90, 0.95);   // Very pale purple
    
    // Boost accents near mouse
    vec3 interactionColor = vec3(0.9, 1.0, 0.95); // Bright highlight
    
    vec3 color = baseColor;
    
    // Mix in accents based on the wave interference
    color = mix(color, accent1, smoothstep(-0.5, 0.5, wave));
    color = mix(color, accent2, smoothstep(0.2, 0.8, wave));
    
    // Add mouse interaction highlight
    color = mix(color, interactionColor, mouseInfluence * 0.3);
    
    // Add texture/grain
    color -= noise; // Darken slightly with noise for depth
    color -= grain; // Fine grain
    
    // Add subtle vignette
    float dist = length(uv - 0.5);
    color = mix(color, baseColor, dist * 0.4);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const WebGLBackground = ({ className = "absolute inset-0 w-full h-full pointer-events-none", opacity = 0.8 }: { className?: string, opacity?: number }) => {
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

    // Helper to compile shaders
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

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up full-screen quad
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ]);

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
      
      // Handle resize
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

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{ opacity }}
    />
  );
};
