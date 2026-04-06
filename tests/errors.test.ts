// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import { BuilderError, ValidationError } from "../src/index.js";
import type { ValidationIssue } from "../src/index.js";

describe("BuilderError", () => {
  it("should be an instance of Error", () => {
    const err = new BuilderError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(BuilderError);
    expect(err.name).toBe("BuilderError");
    expect(err.message).toBe("test");
  });
});

describe("ValidationError", () => {
  it("should be an instance of BuilderError", () => {
    const issues: ValidationIssue[] = [
      { field: "subject", message: "subject is required", severity: "error" },
    ];
    const err = new ValidationError("Condition", issues);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(BuilderError);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.name).toBe("ValidationError");
  });

  it("should have structured errors array and resourceType", () => {
    const issues: ValidationIssue[] = [
      { field: "subject", message: "subject is required", severity: "error" },
      { field: "code", message: "code is required", severity: "error" },
    ];
    const err = new ValidationError("Observation", issues);
    expect(err.resourceType).toBe("Observation");
    expect(err.errors).toHaveLength(2);
    expect(err.errors[0]?.field).toBe("subject");
    expect(err.errors[1]?.field).toBe("code");
  });

  it("should format message with field details", () => {
    const issues: ValidationIssue[] = [
      { field: "subject", message: "subject is required", severity: "error" },
    ];
    const err = new ValidationError("Condition", issues);
    expect(err.message).toContain("Condition validation failed");
    expect(err.message).toContain("subject: subject is required");
  });
});
