class Barrier {
    constructor(x, y, width, height) {
        this.segments = [];
        this.createSegments(x, y, width, height);
    }

    createSegments(x, y, width, height) {
        const segmentSize = 10;
        for (let row = 0; row < height/segmentSize; row++) {
            for (let col = 0; col < width/segmentSize; col++) {
                if (row === 0 && (col < 2 || col > width/segmentSize - 3)) continue;
                if (row === 1 && (col < 1 || col > width/segmentSize - 2)) continue;
                
                this.segments.push(new BarrierSegment(
                    x + col * segmentSize,
                    y + row * segmentSize,
                    segmentSize
                ));
            }
        }
    }

    draw(ctx) {
        this.segments.forEach(segment => segment.draw(ctx));
    }
}

class BarrierSegment extends Entity {
    constructor(x, y, size) {
        super(x, y, size, size);
        this.health = 2;
    }

    draw(ctx) {
        ctx.fillStyle = `rgb(0, ${255 * (this.health/2)}, 0)`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    damage() {
        this.health--;
        return this.health <= 0;
    }
} 