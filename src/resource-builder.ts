// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Abstract base class for FHIR R4 resource builders.
 *
 * Provides common fields shared by all resources: id, meta, extension.
 * Subclasses implement resource-specific setters and override `build()`.
 *
 * Every setter returns `this` for fluent chaining:
 * ```typescript
 * builder.id('123').meta('http://profile').build();
 * ```
 */

import type { Extension, Meta, Resource } from "./types.js";
import { generateId, cleanObject } from "./helpers.js";
import { ValidationError } from "./errors.js";
import type { ValidationIssue } from "./errors.js";

export abstract class ResourceBuilder<T extends Resource> {
  protected resource: Partial<T> & { resourceType: string };

  constructor(resourceType: string) {
    this.resource = { resourceType } as Partial<T> & { resourceType: string };
  }

  /**
   * Set the resource id. If not called, `build()` auto-generates a UUID.
   */
  id(id: string): this {
    this.resource.id = id;
    return this;
  }

  /**
   * Set the resource meta. Accepts a profile URI string or a full Meta object.
   *
   * ```typescript
   * builder.meta('http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient');
   * builder.meta({ profile: ['...'], versionId: '1' });
   * ```
   */
  meta(profileOrMeta: string | Meta): this {
    if (typeof profileOrMeta === "string") {
      this.resource.meta = { profile: [profileOrMeta] };
    } else {
      this.resource.meta = profileOrMeta;
    }
    return this;
  }

  /**
   * Add an extension to the resource.
   */
  extension(ext: Extension): this {
    if (!this.resource.extension) {
      this.resource.extension = [];
    }
    this.resource.extension.push(ext);
    return this;
  }

  /**
   * Override in subclasses to return validation issues for required fields.
   * Called by `build()` before constructing the resource.
   */
  protected getValidationErrors(): ValidationIssue[] {
    return [];
  }

  /**
   * Clear all choice-type fields except the one being kept.
   * Used internally by setters to enforce FHIR choice-type mutual exclusion.
   */
  protected clearChoiceType(fields: string[], keep: string): void {
    for (const field of fields) {
      if (field !== keep) {
        delete (this.resource as Record<string, unknown>)[field];
      }
    }
  }

  /**
   * Build the FHIR resource. Auto-generates an id if none was set.
   * Validates required fields and throws `ValidationError` if any are missing.
   * Returns a clean object with no undefined/null values.
   */
  build(): T {
    const issues = this.getValidationErrors();
    const errors = issues.filter((i) => i.severity === "error");
    if (errors.length > 0) {
      throw new ValidationError(this.resource.resourceType, errors);
    }
    if (!this.resource.id) {
      this.resource.id = generateId();
    }
    return cleanObject(this.resource as Record<string, unknown>) as T;
  }

  /**
   * Build the resource and serialize to a JSON string.
   */
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }
}
