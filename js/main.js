window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new GameEngine(canvas);
    game.start();
}); 