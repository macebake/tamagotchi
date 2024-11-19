import { useState, useEffect, useMemo } from 'react';

const Creature = ({ type = 'baby', mood = 'normal', sleeping = false }) => {
  const [animFrame, setAnimFrame] = useState(0);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [particlePhase, setParticlePhase] = useState(0);

  const eyeState = { left: 0, right: 0 };
  
  interface Pattern {
    x: number;
    y: number;
    size: number;
  }
  
  interface Crack {
    x1: number;
    y1: number;
    length: number;
    angle: number;
  }
  
  interface Tentacle {
    angle: number;
    length: number;
    width: number;
    curveIntensity: number;
  }
  
  interface CharacterColors {
    base: string;
    accent: string;
    glow: string;
  }
  
  interface CharacterShape {
    tentacles: Tentacle[];
    patterns: Pattern[];
    cracks: Crack[];
    base: string;
    accent: string;
    glow: string;
  }
  
  const characterShape = useMemo<CharacterShape>(() => {
    let colors: CharacterColors = { base: '#4A90E2', accent: '#2C3E50', glow: '#5DADE2' };
    let numTentacles = 2 + Math.floor(Math.random() * 2);
    let tentacles: Tentacle[] = [];
    let patterns: Pattern[] = [];
    let cracks: Crack[] = [];
  
    if (type === 'evil') {
      const evilSchemes = [
        { base: 'hsl(270, 70%, 20%)', glow: 'hsl(270, 90%, 40%)', accent: '#FF0066' },
        { base: 'hsl(345, 70%, 20%)', glow: 'hsl(345, 90%, 40%)', accent: '#FF0000' },
        { base: 'hsl(220, 70%, 20%)', glow: 'hsl(220, 90%, 40%)', accent: '#FF3300' },
        { base: 'hsl(160, 70%, 20%)', glow: 'hsl(160, 90%, 40%)', accent: '#FF0033' }
      ];
      colors = evilSchemes[Math.floor(Math.random() * evilSchemes.length)];
      numTentacles = 3;
      cracks = Array(2).fill(0).map(() => ({
        x1: -12 + Math.floor(Math.random() * 24),
        y1: -12 + Math.floor(Math.random() * 24),
        length: 6,
        angle: Math.random() * Math.PI * 2
      }));
    } else if (type === 'baby') {
      const babySchemes = [
        // Soft baby blue scheme
        { 
          base: 'hsl(200, 70%, 85%)',    // Light powder blue
          glow: 'hsl(210, 60%, 90%)',    // Softer sky blue
          accent: 'hsl(190, 65%, 75%)'   // Gentle aqua
        },
        // Gentle pink scheme
        { 
          base: 'hsl(350, 70%, 87%)',    // Baby pink
          glow: 'hsl(340, 60%, 90%)',    // Soft rose
          accent: 'hsl(355, 65%, 80%)'   // Light coral
        },
        // Soft mint scheme
        { 
          base: 'hsl(150, 60%, 85%)',    // Mint green
          glow: 'hsl(140, 50%, 90%)',    // Lighter sage
          accent: 'hsl(160, 55%, 80%)'   // Soft seafoam
        },
        // Gentle lavender scheme
        { 
          base: 'hsl(280, 50%, 87%)',    // Light lavender
          glow: 'hsl(290, 40%, 90%)',    // Softer lilac
          accent: 'hsl(270, 45%, 82%)'   // Gentle purple
        }
      ]
      colors = babySchemes[Math.floor(Math.random() * babySchemes.length)];
    } else if (type === 'good') {
      const goodSchemes = [
        { base: 'hsl(180, 70%, 80%)', glow: 'hsl(210, 70%, 75%)', accent: 'hsl(240, 80%, 85%)' },
        { base: 'hsl(280, 70%, 80%)', glow: 'hsl(310, 70%, 75%)', accent: 'hsl(340, 80%, 85%)' },
        { base: 'hsl(20, 70%, 80%)', glow: 'hsl(50, 70%, 75%)', accent: 'hsl(80, 80%, 85%)' }
      ];
      colors = goodSchemes[Math.floor(Math.random() * goodSchemes.length)];
      numTentacles = 4 + Math.floor(Math.random() * 3);
      patterns = Array(3).fill(0).map(() => ({
        x: -12 + Math.floor(Math.random() * 24),
        y: -12 + Math.floor(Math.random() * 24),
        size: 2 + Math.floor(Math.random() * 3)
      }));
    }
  
    // Create tentacles based on type
    if (type === 'good') {
      tentacles = Array(numTentacles).fill(0).map(() => ({
        angle: Math.random() * Math.PI * 2,
        length: 8 + Math.floor(Math.random() * 4),
        width: 2 + Math.floor(Math.random() * 2),
        curveIntensity: 0.2 + Math.random() * 0.3
      }));
    } else {
      // For evil and baby, provide a default curveIntensity
      tentacles = Array(numTentacles).fill(0).map((_, i) => ({
        angle: type === 'evil' 
          ? (i * ((2 * Math.PI) / numTentacles)) + (Math.random() * 0.5 - 0.25)
          : Math.random() * Math.PI * 2,
        length: type === 'evil' 
          ? 6 + Math.floor(Math.random() * 3)
          : 2 + Math.floor(Math.random() * 2),
        width: type === 'evil' ? 3 : 1,
        curveIntensity: 0.2 // default value for non-good types
      }));
    }
  
    return {
      tentacles,
      patterns,
      cracks,
      ...colors
    };
  }, [type]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimFrame(prev => (prev + 1) % 24);
      setParticlePhase(prev => (prev + 0.1) % (Math.PI * 2));
  
      if (type === 'evil' && Math.random() < 0.1) {
        setGlitchOffset({
          x: Math.floor(Math.random() * 3) - 1,
          y: Math.floor(Math.random() * 3) - 1
        });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 50);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [type]);

  const renderParticles = () => {
    if (type !== 'good') return null;
    
    return Array(8).fill(0).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2 + particlePhase;
      const distance = 20 + Math.sin((animFrame + i) * 0.5) * 4;
      const x = 32 + Math.cos(angle) * distance;
      const y = 32 + Math.sin(angle) * distance;
      
      return (
        <circle
          key={`particle-${i}`}
          cx={x}
          cy={y}
          r={1}
          fill={characterShape.glow}
          className="opacity-50"
        />
      );
    });
  };

  const renderBabyCore = () => (
    <g>
      {[[-1,-1], [0,-1], [1,-1],
        [-1,0],  [0,0],  [1,0],
        [-1,1],  [0,1],  [1,1]].map(([x, y], i) => (
        <rect
          key={`babycore-${i}`}
          x={34 + x * 4}
          y={34 + y * 4}
          width={4}
          height={4}
          fill={characterShape.base}
        />
      ))}
    </g>
  );
  
  const renderCore = () => {
    if (type === 'baby') return renderBabyCore();
  
    const pixels = [];
    const radius = 16;
    
    for (let x = -radius; x <= radius; x += 4) {
      for (let y = -radius; y <= radius; y += 4) {
        if (x*x + y*y <= radius*radius) {
          const px = 32 + x + (type === 'evil' ? glitchOffset.x : 0);
          const py = 32 + y + (type === 'evil' ? glitchOffset.y : 0);
          pixels.push(
            <g key={`core-${x}-${y}`}>
              <rect
                x={px}
                y={py}
                width={4}
                height={4}
                fill={characterShape.base}
              />
              {type === 'good' && characterShape.patterns.some(p => 
                Math.abs(x - p.x) < p.size && Math.abs(y - p.y) < p.size
              ) && (
                <rect
                  x={px + 1}
                  y={py + 1}
                  width={2}
                  height={2}
                  fill={characterShape.accent}
                />
              )}
            </g>
          );
        }
      }
    }
  
    if (type === 'evil') {
      characterShape.cracks.forEach((crack, i) => {
        const endX = crack.x1 + Math.cos(crack.angle) * crack.length;
        const endY = crack.y1 + Math.sin(crack.angle) * crack.length;
        pixels.push(
          <line
            key={`crack-${i}`}
            x1={32 + crack.x1}
            y1={32 + crack.y1}
            x2={32 + endX}
            y2={32 + endY}
            stroke={characterShape.glow}
            strokeWidth={1}
            className="opacity-30"
          />
        );
      });
    }
  
    return pixels;
  };
  
  const renderEyes = () => {
    if (type === 'baby') {
      return (
        <g>
          {sleeping ? (
            <>
              <rect x={32} y={34} width={2} height={1} fill="#FFFFFF" />
              <rect x={38} y={34} width={2} height={1} fill="#FFFFFF" />
            </>
          ) : (
            <>
              <rect x={32} y={34} width={2} height={2} fill="#FFFFFF" />
              <rect x={38} y={34} width={2} height={2} fill="#FFFFFF" />
              <rect x={32.5} y={34.5} width={1} height={1} fill={characterShape.accent} />
              <rect x={38.5} y={34.5} width={1} height={1} fill={characterShape.accent} />
              <path
                d={`M 34 37 ${
                  mood === 'happy' ? 'q 1 -0.5 2 0' : 
                  mood === 'sad' ? 'q 1 0.5 2 0' : 
                  'h 2'
                }`}
                stroke={characterShape.accent}
                fill="none"
                strokeWidth={0.5}
              />
            </>
          )}
        </g>
      );
    }
  
    const x1 = 22;
    const x2 = 34;
    const eyeWidth = 8;
    const pupilWidth = 4;
  
    if (type === 'evil') {
      const glowSize = Math.sin(animFrame * 0.5) * 1 + 2;
      return (
        <g>
          {sleeping ? (
            <>
              <rect x={x1} y={32} width={eyeWidth} height={1} fill={characterShape.glow} />
              <rect x={x2} y={32} width={eyeWidth} height={1} fill={characterShape.glow} />
            </>
          ) : (
            <>
              <rect x={x1} y={28} width={eyeWidth} height={eyeWidth} fill="#000000" />
              <rect x={x2} y={28} width={eyeWidth} height={eyeWidth} fill="#000000" />
              <rect
                x={x1 + 2}
                y={30}
                width={4}
                height={4}
                fill={characterShape.glow}
                className="opacity-50"
              />
              <rect
                x={x2 + 2}
                y={30}
                width={4}
                height={4}
                fill={characterShape.glow}
                className="opacity-50"
              />
              <rect 
                x={x1 + 2 + eyeState.left * 2}
                y={30}
                width={pupilWidth}
                height={pupilWidth}
                fill={characterShape.accent}
              />
              <rect 
                x={x2 + 2 + eyeState.right * 2}
                y={30}
                width={pupilWidth}
                height={pupilWidth}
                fill={characterShape.accent}
              />
              <circle
                cx={x1 + 4 + eyeState.left * 2}
                cy={32}
                r={glowSize}
                fill={characterShape.glow}
                className="opacity-30"
              />
              <circle
                cx={x2 + 4 + eyeState.right * 2}
                cy={32}
                r={glowSize}
                fill={characterShape.glow}
                className="opacity-30"
              />
            </>
          )}
          {!sleeping && (
            <path
              d={`M 28 40 
                ${mood === 'happy' ? 'l 2 -1 l 2 1 l 2 -1 l 2 1' : 
                 mood === 'sad' ? 'l 2 1 l 2 -1 l 2 1 l 2 -1' :
                 'l 2 0 l 2 1 l 2 -1 l 2 0'}`}
              stroke={characterShape.accent}
              fill="none"
              strokeWidth={1}
            />
          )}
        </g>
      );
    }
  
    // Good type eyes
    return (
      <g>
        {sleeping ? (
          <>
            <rect x={x1} y={32} width={eyeWidth} height={1} fill="#FFFFFF" />
            <rect x={x2} y={32} width={eyeWidth} height={1} fill="#FFFFFF" />
          </>
        ) : (
          <>
            <rect x={x1} y={28} width={eyeWidth} height={eyeWidth} fill="#FFFFFF" />
            <rect x={x2} y={28} width={eyeWidth} height={eyeWidth} fill="#FFFFFF" />
            <rect 
              x={x1 + 2 + eyeState.left * 2}
              y={30}
              width={pupilWidth}
              height={pupilWidth}
              fill={characterShape.accent}
            />
            <rect 
              x={x2 + 2 + eyeState.right * 2}
              y={30}
              width={pupilWidth}
              height={pupilWidth}
              fill={characterShape.accent}
            />
            <path
              d={`M 28 40 
                ${mood === 'happy' ? 'Q 32 38 36 40' : 
                 mood === 'sad' ? 'Q 32 42 36 40' :
                 'Q 32 40 36 40'}`}
              stroke={characterShape.accent}
              fill="none"
              strokeWidth={1}
            />
          </>
        )}
      </g>
    );
  };

  if (type === 'baby') {  
    return (
      <svg viewBox="0 0 64 64" className="w-20 h-20">
        <g transform={`translate(32, 32) scale(2) translate(-32, -32) translate(0, ${Math.sin(animFrame * 0.2) * 2})`}>
        {/* Baby tentacles with wiggle */}
          {characterShape.tentacles.map((tentacle, i) => {
            const wobble = Math.sin((animFrame * 0.2) + i * Math.PI) * 1;
            const baseX = 34 + Math.cos(tentacle.angle) * (8 + wobble);
            const baseY = 34 + Math.sin(tentacle.angle) * (8 + wobble);
            return (
              <rect
                key={`tentacle-${i}`}
                x={baseX - 2}
                y={baseY - 2}
                width={4}
                height={4}
                fill={characterShape.base}
              />
            );
          })}
          
          {/* 3x3 pixel core */}
          {[[-1,-1], [0,-1], [1,-1],
            [-1,0],  [0,0],  [1,0],
            [-1,1],  [0,1],  [1,1]].map(([x, y], i) => (
            <rect
              key={`core-${i}`}
              x={34 + x * 4}
              y={34 + y * 4}
              width={4}
              height={4}
              fill={characterShape.base}
            />
          ))}
          
          {/* Baby face */}
          {sleeping ? (
            <>
              <rect x={32} y={34} width={2} height={1} fill="#FFFFFF" />
              <rect x={38} y={34} width={2} height={1} fill="#FFFFFF" />
            </>
          ) : (
            <>
              <rect x={32} y={34} width={2} height={2} fill="#FFFFFF" />
              <rect x={38} y={34} width={2} height={2} fill="#FFFFFF" />
              <rect x={32.5} y={34.5} width={1} height={1} fill={characterShape.accent} />
              <rect x={38.5} y={34.5} width={1} height={1} fill={characterShape.accent} />
              <path
                d={`M 34 37 ${
                  mood === 'happy' ? 'q 1 -0.5 2 0' : 
                  mood === 'sad' ? 'q 1 0.5 2 0' : 
                  'h 2'
                }`}
                stroke={characterShape.accent}
                fill="none"
                strokeWidth={0.5}
              />
            </>
          )}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="w-20 h-20">
      {type === 'good' && renderParticles()}
      {characterShape.tentacles.map((tentacle, i) => {
        const baseX = 32 + Math.cos(tentacle.angle) * 16;
        const baseY = 32 + Math.sin(tentacle.angle) * 16;
        const waveOffset = Math.sin((animFrame / (type === 'good' ? 24 : 12)) * Math.PI * 2) * 
                          (type === 'good' ? tentacle.curveIntensity : 0.2);
        
        return (
          <g key={`tentacle-${i}`}>
            {Array(tentacle.length).fill(0).map((_, j) => {
              const distance = j * 4;
              const angle = tentacle.angle + waveOffset * (j / tentacle.length);
              const x = baseX + Math.cos(angle) * distance + (type === 'evil' ? glitchOffset.x : 0);
              const y = baseY + Math.sin(angle) * distance + (type === 'evil' ? glitchOffset.y : 0);
              const width = Math.max(2, tentacle.width * (1 - j/tentacle.length) * 4);
              
              return (
                <rect
                  key={`segment-${j}`}
                  x={x - width/2}
                  y={y - width/2}
                  width={width}
                  height={width}
                  fill={characterShape.base}
                  className={type === 'good' ? 'opacity-90' : undefined}
                />
              );
            })}
          </g>
        );
      })}
      
      {renderCore()}
      {renderEyes()}
    </svg>
  );
};

export default Creature;