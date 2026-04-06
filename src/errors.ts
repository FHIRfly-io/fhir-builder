// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Error types for FHIR resource validation.
 *
 * Thrown by `build()` when required fields are missing or invalid.
 */

/** A single validation issue found during build(). */
export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

/** Base error class for all builder errors. */
export class BuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuilderError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown by `build()` when a resource fails validation.
 *
 * Contains structured error details in the `errors` array.
 *
 * ```typescript
 * try {
 *   new ConditionBuilder().build();
 * } catch (e) {
 *   if (e instanceof ValidationError) {
 *     console.log(e.resourceType); // "Condition"
 *     console.log(e.errors);       // [{ field: "subject", message: "subject is required", severity: "error" }]
 *   }
 * }
 * ```
 */
export class ValidationError extends BuilderError {
  readonly resourceType: string;
  readonly errors: ValidationIssue[];

  constructor(resourceType: string, errors: ValidationIssue[]) {
    const details = errors.map((e) => `  - ${e.field}: ${e.message}`).join("\n");
    super(`${resourceType} validation failed:\n${details}`);
    this.name = "ValidationError";
    this.resourceType = resourceType;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
