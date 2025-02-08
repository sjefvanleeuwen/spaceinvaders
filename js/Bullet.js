class Bullet extends Entity {
    constructor(x, y, isEnemy) {
        super(x, y, 4, 10);
        this.isEnemy = isEnemy;
        this.speed = isEnemy ? 5 : 7;
    }

    update() {
        this.y += this.isEnemy ? this.speed : -this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.isEnemy ? '#ff6666' : '#fff';
        ctx.fillRect(
            this.x - this.width/2,
            this.y,
            this.width,
            this.height
        );
    }

    isOffscreen(canvas) {
        return this.y < 0 || this.y > canvas.height;
    }
} 