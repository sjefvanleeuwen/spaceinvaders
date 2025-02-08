# Space Invaders Game

A classic Space Invaders game built through prompting with Claude 3.5 Sonnet. The game features retro-style graphics, sound effects, and progressive difficulty.

## Development Journey with Claude

This game was developed through a series of prompts with Claude. Here'\''s the key development steps:

1. Core Game Development
   - Created base Entity class for game objects
   - Implemented player movement and shooting
   - Added enemy formation and movement patterns
   - Created collision detection system

2. Sound System Evolution
   - Started with basic alien movement sound
   - Refined to 55Hz base frequency
   - Added 4-semitone descending pattern
   - Implemented noise-based shooting sounds
   - Created modulated UFO sound
   - Added explosion sound effects

3. Game Mechanics Enhancement
   - Added diving aliens with 1->2->3 cycling pattern
   - Implemented level progression
   - Created destructible barriers
   - Added UFO bonus enemy
   - Implemented starfield background
   - Added initial delay before enemies shoot

4. Build System Development
   - Started with multiple script files
   - Created Node.js build script
   - Added minification
   - Implemented basic code obfuscation
   - Created single self-contained HTML output

## Quick Start

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the game:

```bash
npm run build
```

4. Open `dist/spaceinvaders.html` in a browser

## Project Structure
```
.
├── index.html          # Main game HTML
├── js/
│   ├── Entity.js      # Base class for game objects
│   ├── Player.js      # Player ship implementation
│   ├── Enemy.js       # Enemy aliens implementation
│   ├── Barrier.js     # Destructible barriers
│   ├── Bullet.js      # Projectile handling
│   ├── StarField.js   # Background star animation
│   ├── UFO.js         # Bonus UFO enemy
│   ├── SoundEngine.js # Web Audio implementation
│   ├── GameEngine.js  # Main game logic
│   └── main.js        # Entry point
├── build.js           # Build script
└── package.json       # Project configuration
```

## Features

### Game Mechanics
- Classic Space Invaders gameplay
- Progressive difficulty with each wave
- Destructible barriers that reset each wave
- Diving aliens with cycling patterns (1->2->3->1)
- UFO bonus enemy with unique sound
- Score tracking system
- Game over and restart functionality

### Sound System
The game uses Web Audio API for all sound effects:
- Alien movement: 55Hz base frequency with 4-semitone descent pattern
- Shooting: Noise-based effects with frequency sweeps
- UFO: Modulated oscillators for distinctive sound
- Explosions: Noise burst effects

### Visual Effects
- Animated starfield background
- Enemy formation movement
- Diving alien patterns
- Destructible barrier visualization
- UFO bonus enemy animation

## Build System

The project uses a custom build script that:
- Combines all JavaScript files
- Minifies code and HTML
- Applies basic code obfuscation
- Creates a single, self-contained HTML file

## Controls
- Left/Right Arrow Keys: Move player
- Spacebar: Shoot
- Enter: Restart game (after game over)

## Development

For development:
1. Edit source files in `js/` directory
2. Open `index.html` directly in browser for testing
3. Use build script for distribution:
```bash
npm run build
```

## Credits
- Developed through prompting with Anthropic'\''s Claude 3.5 Sonnet
- Inspired by the classic Space Invaders arcade game
- Built using vanilla JavaScript and Web Audio API

## License
MIT License