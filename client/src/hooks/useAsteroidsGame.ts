import { useEffect, useRef, useState, useCallback } from 'react';

// Types
interface Vector {
  x: number;
  y: number;
}

interface GameObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: string;
}

interface Asteroid extends GameObject {
  size: 'large' | 'medium' | 'small';
  rotation: number;
  rotationSpeed: number;
}

interface Bullet extends GameObject {
  life: number;
}

interface Ship extends GameObject {
  angle: number;
  isThrusting: boolean;
  invulnerableTime: number;
}

interface GameState {
  ship: Ship;
  asteroids: Asteroid[];
  bullets: Bullet[];
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
  wave: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_RADIUS = 15;
const SHIP_SPEED = 5;
const SHIP_ROTATION_SPEED = 0.2;
const BULLET_SPEED = 7;
const BULLET_LIFE = 60;
const ASTEROID_SPEED = 1;
const INVULNERABLE_TIME = 120;

export const useAsteroidsGame = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const [gameState, setGameState] = useState<GameState>({
    ship: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: SHIP_RADIUS,
      angle: 0,
      isThrusting: false,
      invulnerableTime: INVULNERABLE_TIME,
      id: 'ship',
    },
    asteroids: [],
    bullets: [],
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    isPaused: false,
    wave: 1,
  });

  const keysPressed = useRef<Record<string, boolean>>({});
  const gameLoopRef = useRef<number | undefined>(undefined);
  const gameStateRef = useRef<GameState>(gameState);

  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);



  // Start new game
  const startGame = useCallback(() => {
    const asteroids: Asteroid[] = [];
    const asteroidCount = 3 + 1;
    for (let i = 0; i < asteroidCount; i++) {
      asteroids.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
        vy: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
        radius: 40,
        size: 'large',
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        id: `asteroid-${i}-${Date.now()}`,
      });
    }
    setGameState((prev) => ({
      ...prev,
      ship: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 0,
        radius: SHIP_RADIUS,
        angle: 0,
        isThrusting: false,
        invulnerableTime: INVULNERABLE_TIME,
        id: 'ship',
      },
      asteroids: asteroids,
      bullets: [],
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
      isPaused: false,
      wave: 1,
    }));
  }, []);

  // Handle key down
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.key.toLowerCase()] = true;

    if (e.key === ' ') {
      e.preventDefault();
      // Fire bullet
      setGameState((prev) => {
        if (prev.gameOver || prev.isPaused) return prev;

        const angle = prev.ship.angle;
        const bulletX = prev.ship.x + Math.cos(angle) * SHIP_RADIUS;
        const bulletY = prev.ship.y + Math.sin(angle) * SHIP_RADIUS;

        return {
          ...prev,
          bullets: [
            ...prev.bullets,
            {
              x: bulletX,
              y: bulletY,
              vx: Math.cos(angle) * BULLET_SPEED + prev.ship.vx,
              vy: Math.sin(angle) * BULLET_SPEED + prev.ship.vy,
              radius: 2,
              life: BULLET_LIFE,
              id: `bullet-${Date.now()}`,
            },
          ],
        };
      });
    }

    if (e.key === 'p' || e.key === 'P') {
      setGameState((prev) => ({
        ...prev,
        isPaused: !prev.isPaused,
      }));
    }

    if (e.key === 'Enter') {
      setGameState((prev) => {
        if (prev.gameOver) {
          const newAsteroids: Asteroid[] = [];
          const asteroidCount = 3 + 1;
          for (let i = 0; i < asteroidCount; i++) {
            newAsteroids.push({
              x: Math.random() * CANVAS_WIDTH,
              y: Math.random() * CANVAS_HEIGHT,
              vx: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
              vy: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
              radius: 40,
              size: 'large',
              rotation: 0,
              rotationSpeed: (Math.random() - 0.5) * 0.1,
              id: `asteroid-${i}-${Date.now()}`,
            });
          }
          return {
            ...prev,
            ship: {
              x: CANVAS_WIDTH / 2,
              y: CANVAS_HEIGHT / 2,
              vx: 0,
              vy: 0,
              radius: SHIP_RADIUS,
              angle: 0,
              isThrusting: false,
              invulnerableTime: INVULNERABLE_TIME,
              id: 'ship',
            },
            asteroids: newAsteroids,
            bullets: [],
            score: 0,
            lives: 3,
            level: 1,
            gameOver: false,
            isPaused: false,
            wave: 1,
          };
        }
        return prev;
      });
    }
  }, []);

  // Handle key up
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.key.toLowerCase()] = false;
  }, []);

  // Update game state
  const updateGameState = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver || prev.isPaused) return prev;

      let newState = { ...prev };

      // Update ship
      const ship = { ...newState.ship };
      const keys = keysPressed.current;

      if (keys['arrowleft'] || keys['a']) {
        ship.angle -= SHIP_ROTATION_SPEED;
      }
      if (keys['arrowright'] || keys['d']) {
        ship.angle += SHIP_ROTATION_SPEED;
      }

      ship.isThrusting = keys['arrowup'] || keys['w'];
      if (ship.isThrusting) {
        ship.vx += Math.cos(ship.angle) * 0.5;
        ship.vy += Math.sin(ship.angle) * 0.5;
      }

      // Apply friction
      ship.vx *= 0.99;
      ship.vy *= 0.99;

      // Limit speed
      const speed = Math.sqrt(ship.vx ** 2 + ship.vy ** 2);
      if (speed > SHIP_SPEED) {
        ship.vx = (ship.vx / speed) * SHIP_SPEED;
        ship.vy = (ship.vy / speed) * SHIP_SPEED;
      }

      // Update position
      ship.x += ship.vx;
      ship.y += ship.vy;

      // Wrap around screen
      if (ship.x < 0) ship.x = CANVAS_WIDTH;
      if (ship.x > CANVAS_WIDTH) ship.x = 0;
      if (ship.y < 0) ship.y = CANVAS_HEIGHT;
      if (ship.y > CANVAS_HEIGHT) ship.y = 0;

      // Update invulnerability
      if (ship.invulnerableTime > 0) {
        ship.invulnerableTime--;
      }

      newState.ship = ship;

      // Update bullets
      newState.bullets = newState.bullets
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.vx,
          y: bullet.y + bullet.vy,
          life: bullet.life - 1,
        }))
        .filter((bullet) => bullet.life > 0 && bullet.x >= 0 && bullet.x <= CANVAS_WIDTH && bullet.y >= 0 && bullet.y <= CANVAS_HEIGHT);

      // Update asteroids
      newState.asteroids = newState.asteroids.map((asteroid) => {
        const newX = (asteroid.x + asteroid.vx + CANVAS_WIDTH) % CANVAS_WIDTH;
        const newY = (asteroid.y + asteroid.vy + CANVAS_HEIGHT) % CANVAS_HEIGHT;
        return {
          ...asteroid,
          x: newX,
          y: newY,
          rotation: asteroid.rotation + asteroid.rotationSpeed,
        };
      });

      // Check collisions between bullets and asteroids
      let newScore = newState.score;
      const asteroidsToRemove = new Set<string>();
      const bulletsToRemove = new Set<string>();

      newState.bullets.forEach((bullet) => {
        newState.asteroids.forEach((asteroid) => {
          const dx = bullet.x - asteroid.x;
          const dy = bullet.y - asteroid.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < asteroid.radius + bullet.radius) {
            bulletsToRemove.add(bullet.id);
            asteroidsToRemove.add(asteroid.id);

            // Add points
            if (asteroid.size === 'large') newScore += 20;
            if (asteroid.size === 'medium') newScore += 50;
            if (asteroid.size === 'small') newScore += 100;
          }
        });
      });

      // Remove destroyed asteroids and create smaller ones
      const newAsteroids: Asteroid[] = [];
      newState.asteroids.forEach((asteroid) => {
        if (!asteroidsToRemove.has(asteroid.id)) {
          newAsteroids.push(asteroid);
        } else {
          // Create smaller asteroids
          if (asteroid.size === 'large') {
            for (let i = 0; i < 2; i++) {
              newAsteroids.push({
                ...asteroid,
                size: 'medium',
                radius: 25,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                id: `asteroid-${asteroid.id}-${i}`,
              });
            }
          } else if (asteroid.size === 'medium') {
            for (let i = 0; i < 2; i++) {
              newAsteroids.push({
                ...asteroid,
                size: 'small',
                radius: 12,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                id: `asteroid-${asteroid.id}-${i}`,
              });
            }
          }
        }
      });

      newState.asteroids = newAsteroids;
      newState.bullets = newState.bullets.filter((b) => !bulletsToRemove.has(b.id));
      newState.score = newScore;

      // Check if all asteroids destroyed
      if (newState.asteroids.length === 0) {
          newState.level++;
        newState.wave++;
        const newAsteroidsCount = 3 + newState.level;
        const newAsteroidsArr: Asteroid[] = [];
        for (let i = 0; i < newAsteroidsCount; i++) {
          newAsteroidsArr.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            vx: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
            vy: (Math.random() - 0.5) * ASTEROID_SPEED * 2,
            radius: 40,
            size: 'large',
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            id: `asteroid-${i}-${Date.now()}`,
          });
        }
        newState.asteroids = newAsteroidsArr;
      }

      // Check collision between ship and asteroids
      if (newState.ship.invulnerableTime <= 0) {
        newState.asteroids.forEach((asteroid) => {
          const dx = newState.ship.x - asteroid.x;
          const dy = newState.ship.y - asteroid.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < asteroid.radius + newState.ship.radius) {
            newState.lives--;
            if (newState.lives <= 0) {
              newState.gameOver = true;
            } else {
              newState.ship.x = CANVAS_WIDTH / 2;
              newState.ship.y = CANVAS_HEIGHT / 2;
              newState.ship.vx = 0;
              newState.ship.vy = 0;
              newState.ship.invulnerableTime = INVULNERABLE_TIME;
            }
          }
        });
      }

      return newState;
    });
  }, []);

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw ship
    const ship = state.ship;
    if (ship.invulnerableTime <= 0 || Math.floor(ship.invulnerableTime / 10) % 2 === 0) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);

      // Ship glow
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -12);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-10, 12);
      ctx.closePath();
      ctx.stroke();

      // Thrust flame
      if (ship.isThrusting) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-5, -8);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-5, 8);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    state.bullets.forEach((bullet) => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw asteroids
    state.asteroids.forEach((asteroid) => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);

      // Asteroid glow
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;

      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const variation = 0.8 + Math.random() * 0.4;
        const x = Math.cos(angle) * asteroid.radius * variation;
        const y = Math.sin(angle) * asteroid.radius * variation;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw pause overlay
    if (state.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 48px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    // Draw game over overlay
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 48px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.fillStyle = '#00ffff';
      ctx.font = '24px Courier New';
      ctx.fillText(`FINAL SCORE: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.fillText('Press ENTER to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGameState();
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateGameState, draw]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    gameState,
    startGame,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  };
};
