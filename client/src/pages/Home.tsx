import { useEffect, useRef } from 'react';
import { useAsteroidsGame } from '@/hooks/useAsteroidsGame';

/**
 * Design Philosophy: Neon Cyberpunk Arcade
 * - Vibrant neon colors (cyan, magenta, yellow) on dark background
 * - Glow effects and retro arcade aesthetic
 * - Monospace typography for authentic arcade feel
 */
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, startGame, CANVAS_WIDTH, CANVAS_HEIGHT } = useAsteroidsGame(canvasRef);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] flex flex-col items-center justify-center p-4 font-mono">
      {/* Background grid effect */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.1) 25%, rgba(0, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.1) 75%, rgba(0, 255, 255, 0.1) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px',
      }} />

      {/* Main container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-400 to-yellow-400 drop-shadow-lg" style={{
            textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.6)',
            letterSpacing: '0.1em',
          }}>
            ASTEROIDS
          </h1>
          <p className="text-cyan-400 text-sm mt-2" style={{
            textShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
          }}>
            CLASSIC ARCADE GAME
          </p>
        </div>

        {/* Game canvas with neon border */}
        <div className="relative" style={{
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1)',
          border: '3px solid rgba(0, 255, 255, 0.8)',
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block bg-black"
          />
        </div>

        {/* Game info panels */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          {/* Score */}
          <div className="bg-black border-2 border-magenta-500 p-4 text-center" style={{
            boxShadow: '0 0 15px rgba(255, 0, 255, 0.4)',
          }}>
            <div className="text-magenta-400 text-xs uppercase tracking-widest mb-2" style={{
              textShadow: '0 0 10px rgba(255, 0, 255, 0.6)',
            }}>
              Score
            </div>
            <div className="text-yellow-400 text-3xl font-bold" style={{
              textShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
            }}>
              {gameState.score.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Level */}
          <div className="bg-black border-2 border-cyan-500 p-4 text-center" style={{
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
          }}>
            <div className="text-cyan-400 text-xs uppercase tracking-widest mb-2" style={{
              textShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
            }}>
              Level
            </div>
            <div className="text-cyan-300 text-3xl font-bold" style={{
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
            }}>
              {gameState.level}
            </div>
          </div>

          {/* Lives */}
          <div className="bg-black border-2 border-yellow-500 p-4 text-center" style={{
            boxShadow: '0 0 15px rgba(255, 255, 0, 0.4)',
          }}>
            <div className="text-yellow-400 text-xs uppercase tracking-widest mb-2" style={{
              textShadow: '0 0 10px rgba(255, 255, 0, 0.6)',
            }}>
              Lives
            </div>
            <div className="text-yellow-300 text-3xl font-bold" style={{
              textShadow: '0 0 10px rgba(255, 255, 0, 0.8)',
            }}>
              {gameState.lives}
            </div>
          </div>
        </div>

        {/* Controls info */}
        <div className="w-full max-w-2xl bg-black border-2 border-cyan-500 p-4" style={{
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
        }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-cyan-400 uppercase text-xs tracking-widest mb-2" style={{
                textShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
              }}>
                Movement
              </div>
              <div className="text-gray-300 space-y-1">
                <div>↑ W - Thrust</div>
                <div>← → A D - Rotate</div>
              </div>
            </div>
            <div>
              <div className="text-magenta-400 uppercase text-xs tracking-widest mb-2" style={{
                textShadow: '0 0 8px rgba(255, 0, 255, 0.6)',
              }}>
                Actions
              </div>
              <div className="text-gray-300 space-y-1">
                <div>SPACE - Shoot</div>
                <div>P - Pause / ENTER - Restart</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game status message */}
        {gameState.gameOver && (
          <div className="w-full max-w-2xl bg-black border-3 border-yellow-500 p-6 text-center" style={{
            boxShadow: '0 0 30px rgba(255, 255, 0, 0.6), inset 0 0 20px rgba(255, 255, 0, 0.1)',
            animation: 'pulse 1s infinite',
          }}>
            <div className="text-yellow-400 text-2xl font-bold uppercase" style={{
              textShadow: '0 0 20px rgba(255, 255, 0, 0.8)',
            }}>
              Game Over!
            </div>
            <div className="text-cyan-400 text-sm mt-2">
              Press ENTER to restart
            </div>
          </div>
        )}

        {gameState.isPaused && !gameState.gameOver && (
          <div className="w-full max-w-2xl bg-black border-3 border-magenta-500 p-6 text-center" style={{
            boxShadow: '0 0 30px rgba(255, 0, 255, 0.6), inset 0 0 20px rgba(255, 0, 255, 0.1)',
            animation: 'pulse 0.5s infinite',
          }}>
            <div className="text-magenta-400 text-2xl font-bold uppercase" style={{
              textShadow: '0 0 20px rgba(255, 0, 255, 0.8)',
            }}>
              Paused
            </div>
            <div className="text-cyan-400 text-sm mt-2">
              Press P to resume
            </div>
          </div>
        )}
      </div>

      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
      }} />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
