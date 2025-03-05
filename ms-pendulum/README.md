# Market Sentiment Pendulum

A dynamic visualization of market sentiment using a physics-based pendulum.

## Live Demo

[View the live demo](https://ms-pendulum.vercel.app/)

## Physics Implementation

The pendulum in this project uses a simplified physics model to create realistic motion:

### Key Physics Principles

1. **Simple Harmonic Motion**: The pendulum follows the principles of simple harmonic motion, where the restoring force is proportional to displacement.

2. **Spring Force**: A virtual spring pulls the pendulum toward the target angle:

   ```typescript
   const springForce = (targetAngle - currentAngle) * SPRING_CONSTANT;
   ```

3. **Gravity**: Simulated gravity affects the pendulum based on its angle:

   ```typescript
   const gravityForce = Math.sin(currentAngle * (Math.PI / 180)) * GRAVITY;
   ```

4. **Damping**: Air resistance gradually reduces the pendulum's velocity:

   ```typescript
   velocity *= DAMPING;
   ```

5. **Numerical Integration**: The position is updated each frame using basic Euler integration:
   ```typescript
   currentAngle += velocity;
   ```

### Physics Constants

- `SPRING_CONSTANT = 0.003`: Controls how strongly the pendulum is pulled toward the target position
- `DAMPING = 0.98`: Controls how quickly the pendulum loses energy (1.0 = no damping)
- `GRAVITY = 0.2`: Controls the effect of gravity on the pendulum's swing

### Implementation Details

The physics simulation runs in a requestAnimationFrame loop for smooth animation. When market sentiment changes, the target angle is updated, and a small impulse is added to the pendulum's velocity to initiate movement.

The pendulum's motion is determined by:

1. The current market sentiment (target position)
2. Physical forces (spring, gravity, damping)
3. User interaction (clicking on the sentiment scale)

This creates a natural, continuous motion that responds to changes in market sentiment while maintaining the appearance of a physical object governed by real-world physics.

## Technologies Used

- Next.js
- TypeScript
- Framer Motion
- SCSS Modules

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT
