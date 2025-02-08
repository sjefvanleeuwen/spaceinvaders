class StarField {
    constructor(canvas, starCount = 100) {
        this.canvas = canvas;
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new Star(canvas));
        }
    }

    update() {
        this.stars.forEach(star => star.update());
    }

    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => star.draw(ctx));
    }
}

class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = 0;
        this.speed = 0.5 + Math.random() * 2;
        this.size = Math.random() * 2;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.canvas.height) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
} 