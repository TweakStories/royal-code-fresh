/**
 * @file libs/shared/domain/src/lib/common/vector.model.ts
 * @Version 1.0.0
 * @Author ChallengerAppDevAI
 * @Description Defines a standard 3D vector model. This is a fundamental
 *              data structure used throughout 3D operations for representing
 *              positions, rotations (as Euler angles), scales, and directions.
 */

/**
 * @Interface Vector3
 * @Description Represents a 3D vector or point with x, y, and z coordinates.
 *              Crucial for positioning, rotation, and scaling in 3D space.
 *              Units are typically interpreted by the context (e.g., meters for position,
 *              radians for rotation).
 */
export interface Vector3 {
  /** @property {number} x - The x-component of the vector. */
  x: number;
  /** @property {number} y - The y-component of the vector. */
  y: number;
  /** @property {number} z - The z-component of the vector. */
  z: number;
}