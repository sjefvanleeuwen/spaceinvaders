class Player extends Entity {
    constructor(canvas) {
        super(canvas.width / 2, canvas.height - 30, 50, 30);
        this.speed = 5;
        this.canShoot = true;
        this.shootCooldown = 250;
        this.canvas = canvas;
    }

    draw(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
    }

    move(direction) {
        const newX = this.x + (direction * this.speed);
        if (newX >= this.width/2 && newX <= this.canvas.width - this.width/2) {
            this.x = newX;
        }
    }

    shoot() {
        if (!this.canShoot) return null;
        
        this.canShoot = false;
        setTimeout(() => this.canShoot = true, this.shootCooldown);
        
        return new Bullet(this.x, this.y, false);
    }
} 