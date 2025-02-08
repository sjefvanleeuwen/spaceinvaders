class UFO extends Entity {
    constructor(canvas, direction) {
        super(
            direction > 0 ? -60 : canvas.width + 60, // Start further outside canvas due to wider size
            30, // Height position
            60, // Width (doubled from 30)
            15  // Height
        );
        this.direction = direction;
        this.speed = 2;
        this.points = 1000;
    }

    update() {
        this.x += this.direction * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = '#ffff00'; // Changed to yellow
        
        // Draw saucer body
        ctx.beginPath();
        ctx.ellipse(
            this.x, 
            this.y + 10,
            this.width/2,
            this.height/3,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw dome
        ctx.beginPath();
        ctx.ellipse(
            this.x,
            this.y,
            this.width/3,
            this.height/2,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    isOffscreen(canvas) {
        return (this.direction > 0 && this.x > canvas.width + 60) || 
               (this.direction < 0 && this.x < -60);
    }
} 