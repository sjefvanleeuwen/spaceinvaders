class Enemy extends Entity {
    constructor(x, y, type) {
        super(x, y, 30, 30);
        this.type = type;
        this.direction = 1;
        this.frame = 0;
        this.sprites = Enemy.sprites[`type${type}`];
        
        // Add diving properties
        this.isDiving = false;
        this.originalX = x;
        this.originalY = y;
        this.originalDirection = 1;
        this.targetY = 0;
        this.diveSpeed = 3;
        this.hoverTime = 0;
        this.hoverDuration = 1500;
        this.minHoverHeight = 450;
        this.lastShot = 0;
        this.shootInterval = 800;
        this.returningToFormation = false;
        
        // Track relative position in formation
        this.formationX = x;  // Track formation position separately
        this.formationY = y;
        this.formationOffset = 0;
    }

    static sprites = {
        type1: [
            [
                '  ██  ',
                ' ████ ',
                '██████',
                '██  ██',
                '  ██  '
            ],
            [
                '  ██  ',
                ' ████ ',
                '██████',
                '  ██  ',
                '██  ██'
            ]
        ],
        type2: [
            [
                ' █  █ ',
                '  ██  ',
                ' ████ ',
                '██  ██',
                '█ ██ █'
            ],
            [
                ' █  █ ',
                '█ ██ █',
                ' ████ ',
                '██  ██',
                ' █  █ '
            ]
        ],
        type3: [
            [
                ' ████ ',
                '██████',
                '██  ██',
                ' ████ ',
                '█ ██ █'
            ],
            [
                ' ████ ',
                '██████',
                '██  ██',
                ' ████ ',
                '█    █'
            ]
        ]
    };

    draw(ctx) {
        const sprite = this.sprites[this.frame];
        const pixelSize = this.width / 6;

        ctx.fillStyle = '#fff';
        sprite.forEach((row, i) => {
            for (let j = 0; j < row.length; j++) {
                if (row[j] === '█') {
                    ctx.fillRect(
                        this.x + j * pixelSize,
                        this.y + i * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        });
    }

    updateFormationOffset(dx) {
        if (this.isDiving) {
            // Update both formation position and offset
            this.formationX += dx;
            this.formationOffset += dx;
        } else {
            // Just update formation position when in formation
            this.formationX = this.x;
            this.formationY = this.y;
        }
    }

    update(playerX, formationDirection) {
        if (!this.isDiving) {
            this.direction = formationDirection;
            this.formationX = this.x;
            this.formationY = this.y;
            return false;
        }

        const currentTime = Date.now();

        // Diving down
        if (this.y < this.targetY && this.hoverTime === 0) {
            this.y += this.diveSpeed;
            const dx = playerX - this.x;
            this.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.1, this.diveSpeed);
            
            if (this.y >= this.targetY) {
                this.hoverTime = currentTime;
            }
        }
        // Hovering and shooting
        else if (this.hoverTime > 0 && currentTime - this.hoverTime < this.hoverDuration) {
            const dx = playerX - this.x;
            this.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.05, 2);
            
            if (currentTime - this.lastShot > this.shootInterval) {
                return true;
            }
        }
        // Return to formation
        else if (this.hoverTime > 0) {
            // Calculate return path to current formation position
            const dx = this.formationX - this.x;
            const dy = this.formationY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.diveSpeed) {
                // Exactly match current formation position
                this.x = this.formationX;
                this.y = this.formationY;
                this.isDiving = false;
                this.hoverTime = 0;
                this.formationOffset = 0;
                this.direction = formationDirection;
            } else {
                // More precise return path with acceleration
                const progress = 1 - (distance / Math.sqrt(
                    Math.pow(this.targetY - this.formationY, 2) + 
                    Math.pow(this.x - this.formationX, 2)
                ));
                const speed = this.diveSpeed * (1 + progress * 2);
                this.x += (dx / distance) * speed;
                this.y += (dy / distance) * speed;
            }
        }

        return false;
    }

    startDive(playerX, barrierTop) {
        if (!this.isDiving) {
            this.isDiving = true;
            this.originalDirection = this.direction;
            this.targetY = Math.min(barrierTop - 50, this.minHoverHeight);
            this.hoverTime = 0;
            this.lastShot = Date.now();
            this.formationOffset = 0;
            // Store current formation position
            this.formationX = this.x;
            this.formationY = this.y;
        }
    }

    shoot() {
        this.lastShot = Date.now();
        return new Bullet(this.x + this.width/2, this.y + this.height, true);
    }
} 