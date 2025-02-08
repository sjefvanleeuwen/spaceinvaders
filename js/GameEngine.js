class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameOver = false;
        this.score = 0;
        this.keysPressed = {};
        this.enemyShootingFrequency = 1000;
        this.animInterval = 500;
        this.isRunning = false;
        
        this.scoreElement = document.getElementById('scoreValue');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        
        this.ufoSpawnInterval = 20000; // Time between UFO spawns (20 seconds)
        this.lastUfoSpawn = 0;
        this.ufo = null;
        
        this.divingAlienInterval = 5000; // Time between diving aliens
        this.lastDivingAlien = 0;
        
        this.sound = new SoundEngine();
        this.ufoSound = null;  // Track UFO sound for cleanup
        
        this.initialDelay = 2000; // 2 seconds delay before shooting starts
        this.divingDelay = 3000;  // 3 seconds before first dive
        this.levelStartTime = Date.now();
        this.maxDivingAliens = 1; // Start with 1 diving alien
        this.divingCycleCount = 0; // Track number of diving cycles
        
        // Setup event listeners once
        this.setupEventListeners();
        this.initializeGame();
    }

    initializeGame() {
        this.player = new Player(this.canvas);
        this.starField = new StarField(this.canvas);
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = this.createEnemies();
        this.barriers = this.createBarriers();
        this.lastEnemyShot = 0;
        this.lastAnimTime = 0;
        this.ufo = null;
        this.lastUfoSpawn = 0;
        this.levelStartTime = Date.now();
        this.maxDivingAliens = 1;
        this.divingCycleCount = 0;
    }

    createEnemies() {
        const enemies = [];
        const rows = 5;
        const enemiesPerRow = 10;
        const spacing = 60;
        const startX = 50;
        const startY = 50;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < enemiesPerRow; col++) {
                enemies.push(new Enemy(
                    startX + col * spacing,
                    startY + row * spacing,
                    Math.min(Math.floor(row/2) + 1, 3)
                ));
            }
        }
        return enemies;
    }

    createBarriers() {
        const barriers = [];
        const barrierCount = 4;
        const spacing = this.canvas.width / (barrierCount + 1);
        
        for (let i = 0; i < barrierCount; i++) {
            barriers.push(new Barrier(
                spacing * (i + 1) - 40,
                this.canvas.height - 150,
                80,
                60
            ));
        }
        return barriers;
    }

    setupEventListeners() {
        // Use bound methods to maintain context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (this.gameOver && e.key === 'Enter') {
            this.resetGame();
            return;
        }
        this.keysPressed[e.key] = true;
    }

    handleKeyUp(e) {
        this.keysPressed[e.key] = false;
    }

    handleInput() {
        if (this.keysPressed['ArrowLeft']) {
            this.player.move(-1);
        }
        if (this.keysPressed['ArrowRight']) {
            this.player.move(1);
        }
        if (this.keysPressed[' ']) {
            const bullet = this.player.shoot();
            if (bullet) {
                this.bullets.push(bullet);
                this.sound.playerShoot();
            }
        }
    }

    handleEnemyShooting() {
        const currentTime = Date.now();
        if (currentTime - this.levelStartTime < this.initialDelay) {
            return;
        }

        if (currentTime - this.lastEnemyShot > this.enemyShootingFrequency && this.enemies.length > 0) {
            const shootingCandidates = [];
            const columns = {};

            this.enemies.forEach(enemy => {
                const column = Math.floor(enemy.x + enemy.width/2);
                if (!columns[column] || enemy.y > columns[column].y) {
                    columns[column] = enemy;
                }
            });

            shootingCandidates.push(...Object.values(columns));
            
            let bestShooter = null;
            let smallestXDiff = Infinity;

            shootingCandidates.forEach(enemy => {
                const xDiff = Math.abs((enemy.x + enemy.width/2) - this.player.x);
                if (xDiff < smallestXDiff) {
                    smallestXDiff = xDiff;
                    bestShooter = enemy;
                }
            });

            const selectedShooter = Math.random() < 0.7 ? 
                bestShooter : 
                shootingCandidates[Math.floor(Math.random() * shootingCandidates.length)];

            if (selectedShooter) {
                this.enemyBullets.push(selectedShooter.shoot());
                this.sound.enemyShoot();
                this.lastEnemyShot = currentTime;
            }
        }
    }

    moveEnemies() {
        let touchedEdge = false;
        let dx = 0;

        this.enemies.forEach(enemy => {
            if (!enemy.isDiving) {
                const newX = enemy.x + enemy.direction * 0.5;
                if (newX <= 0 || newX + enemy.width >= this.canvas.width) {
                    touchedEdge = true;
                }
            }
        });

        if (touchedEdge) {
            this.enemies.forEach(enemy => {
                enemy.direction *= -1;
                enemy.y += 5;
            });
        } else {
            dx = 0.5 * this.enemies[0].direction;
            this.enemies.forEach(enemy => {
                if (!enemy.isDiving) {
                    enemy.x += dx;
                } else {
                    enemy.updateFormationOffset(dx);
                }
            });
        }
    }

    animateEnemies() {
        const currentTime = Date.now();
        if (currentTime - this.lastAnimTime > this.animInterval) {
            if (this.enemies.length > 0 && !this.gameOver) {
                this.sound.alienPulse();
            }
            
            this.enemies.forEach(enemy => {
                enemy.frame = enemy.frame === 0 ? 1 : 0;
            });
            
            this.lastAnimTime = currentTime;
        }
    }

    handleUFO() {
        const currentTime = Date.now();
        if (!this.ufo && currentTime - this.lastUfoSpawn > this.ufoSpawnInterval) {
            const direction = Math.random() < 0.5 ? 1 : -1;
            this.ufo = new UFO(this.canvas, direction);
            this.ufoSound = this.sound.ufoSound();  // Start UFO sound
            this.lastUfoSpawn = currentTime;
        }

        if (this.ufo) {
            this.ufo.update();
            if (this.ufo.isOffscreen(this.canvas)) {
                if (this.ufoSound) {
                    this.ufoSound.stop();  // Stop UFO sound
                    this.ufoSound = null;
                }
                this.ufo = null;
            }
        }
    }

    handleDivingAliens() {
        const currentTime = Date.now();
        
        // Add initial diving delay
        if (currentTime - this.levelStartTime < this.divingDelay) {
            return;
        }

        // Check if it's time for a new diving alien
        if (currentTime - this.lastDivingAlien > this.divingAlienInterval && 
            this.enemies.length > 0) {
            
            // Count current diving aliens
            const currentlyDiving = this.enemies.filter(enemy => enemy.isDiving).length;
            
            // Only proceed if we haven't reached max diving aliens
            if (currentlyDiving < this.maxDivingAliens) {
                // Find aliens that aren't already diving
                const availableAliens = this.enemies.filter(enemy => !enemy.isDiving);
                
                if (availableAliens.length > 0) {
                    // Find the alien closest to the player's x position
                    let closestAlien = availableAliens[0];
                    let smallestDiff = Math.abs(this.player.x - availableAliens[0].x);
                    
                    availableAliens.forEach(alien => {
                        const diff = Math.abs(this.player.x - alien.x);
                        if (diff < smallestDiff) {
                            smallestDiff = diff;
                            closestAlien = alien;
                        }
                    });
                    
                    const barrierTop = Math.min(
                        ...this.barriers.map(barrier => 
                            Math.min(...barrier.segments.map(seg => seg.y))
                        )
                    );
                    
                    closestAlien.startDive(this.player.x, barrierTop);
                    this.lastDivingAlien = currentTime;

                    // If this was the last allowed diver, increment cycle
                    if (currentlyDiving + 1 >= this.maxDivingAliens) {
                        this.divingCycleCount++;
                        // Update max diving aliens based on cycle
                        if (this.divingCycleCount % 3 === 0) {
                            this.maxDivingAliens = 1;
                        } else if (this.divingCycleCount % 3 === 1) {
                            this.maxDivingAliens = 2;
                        } else {
                            this.maxDivingAliens = 3;
                        }
                    }
                }
            }
        }

        // Update diving aliens
        this.enemies.forEach(enemy => {
            if (enemy.isDiving) {
                const formationDirection = this.enemies.find(e => !e.isDiving)?.direction || 1;
                const shouldShoot = enemy.update(this.player.x, formationDirection);
                if (shouldShoot) {
                    this.enemyBullets.push(enemy.shoot());
                }
            }
        });
    }

    checkCollisions() {
        // Player bullets with enemies, barriers, and UFO
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Check UFO collision first
            if (this.ufo && bullet.collidesWith(this.ufo)) {
                this.bullets.splice(i, 1);
                this.score += this.ufo.points;
                this.scoreElement.textContent = this.score;
                if (this.ufoSound) {
                    this.ufoSound.stop();  // Stop UFO sound on hit
                    this.ufoSound = null;
                }
                this.ufo = null;
                continue;  // Skip other collision checks for this bullet
            }

            // Check enemy collisions
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (bullet.collidesWith(this.enemies[j])) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 10;
                    this.scoreElement.textContent = this.score;
                    this.sound.explosion();
                    break;  // Bullet is gone, stop checking enemies
                }
            }

            // Check barrier collisions if bullet still exists
            if (this.bullets[i]) {
                this.barriers.forEach(barrier => {
                    barrier.segments = barrier.segments.filter(segment => {
                        if (bullet.collidesWith(segment)) {
                            this.bullets.splice(i, 1);
                            return !segment.damage();
                        }
                        return true;
                    });
                });
            }
        }

        // Enemy bullets with player and barriers
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            // Check player collision
            if (bullet.collidesWith(this.player)) {
                this.handleGameOver();
            }

            // Check barrier collisions
            this.barriers.forEach(barrier => {
                barrier.segments = barrier.segments.filter(segment => {
                    if (bullet.collidesWith(segment)) {
                        this.enemyBullets.splice(bulletIndex, 1);
                        return !segment.damage();
                    }
                    return true;
                });
            });
        });
    }

    handleGameOver() {
        this.gameOver = true;
        this.isRunning = false;
        this.gameOverScreen.style.display = 'block';
        this.finalScoreElement.textContent = this.score;
        
        // Stop UFO sound if it's playing
        if (this.ufoSound) {
            this.ufoSound.stop();
            this.ufoSound = null;
        }
        
        // Reset the audio context
        this.sound = new SoundEngine();
    }

    resetGame() {
        // Stop any existing sounds
        if (this.ufoSound) {
            this.ufoSound.stop();
            this.ufoSound = null;
        }
        
        // Reset the audio engine
        this.sound = new SoundEngine();
        
        this.gameOver = false;
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.gameOverScreen.style.display = 'none';
        
        // Clear pressed keys
        this.keysPressed = {};
        
        // Reinitialize game components
        this.initializeGame();
        
        // Restart game loop
        this.start();
    }

    checkLevelComplete() {
        if (this.enemies.length === 0) {
            setTimeout(() => {
                // Reset UFO timing
                this.lastUfoSpawn = Date.now();
                
                // Stop UFO if it exists
                if (this.ufoSound) {
                    this.ufoSound.stop();
                    this.ufoSound = null;
                }
                if (this.ufo) {
                    this.ufo = null;
                }

                // Clear all bullets
                this.bullets = [];
                this.enemyBullets = [];

                // Reset barriers to full health
                this.barriers = this.createBarriers();

                // Create new wave of enemies starting at the top
                this.enemies = this.createEnemies();
                
                // Ensure all new enemies have consistent direction
                const direction = 1;
                this.enemies.forEach(enemy => {
                    enemy.direction = direction;
                });
                
                // Reset timers
                this.lastDivingAlien = Date.now();
                this.lastAnimTime = Date.now();
                this.lastEnemyShot = Date.now();
                
                // Slightly increase difficulty
                this.enemyShootingFrequency = Math.max(
                    this.enemyShootingFrequency * 0.9, // 10% faster shooting
                    500 // Minimum time between shots
                );
                this.animInterval = Math.max(
                    this.animInterval * 0.9, // 10% faster movement
                    200 // Minimum animation interval
                );

                // Reset level start time for new wave
                this.levelStartTime = Date.now();

                // Reset diving-related properties
                this.maxDivingAliens = 1;
                this.divingCycleCount = 0;
            }, 1000); // 1 second delay before next wave
        }
    }

    update() {
        this.starField.update();
        this.handleInput();
        this.handleEnemyShooting();
        this.moveEnemies();
        this.animateEnemies();
        this.handleUFO();
        this.handleDivingAliens();

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return !bullet.isOffscreen(this.canvas);
        });

        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return !bullet.isOffscreen(this.canvas);
        });

        this.checkCollisions();
        this.checkLevelComplete();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw game objects
        this.starField.draw(this.ctx);
        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.barriers.forEach(barrier => barrier.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw UFO if it exists
        if (this.ufo) {
            this.ufo.draw(this.ctx);
        }
    }

    gameLoop() {
        if (this.gameOver || !this.isRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
        }
    }
} 