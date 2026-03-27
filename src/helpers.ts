// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Helper functions for building FHIR R4 data type elements.
 *
 * These are the low-level building blocks used by resource builders.
 * They can also be used directly for advanced use cases.
 */

import type {
  CodeableConcept,
  Coding,
  HumanName,
  HumanNameInput,
  Identifier,
  NameUse,
  Period,
  Quantity,
  Reference,
  Resource,
} from "./types.js";
import { CodeSystems } from "./code-systems.js";

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

/**
 * Generate a UUID v4 string (no external dependency).
 *
 * Uses crypto.randomUUID() when available (Node 19+, modern browsers),
 * falls back to a manual implementation for Node 18.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for Node 18 without global crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if a string is a valid UUID v4 format.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUUID(value: string): boolean {
  return UUID_RE.test(value);
}

// ---------------------------------------------------------------------------
// CodeableConcept / Coding
// ---------------------------------------------------------------------------

/**
 * Build a CodeableConcept from a code, system, and optional display.
 *
 * ```typescript
 * buildCodeableConcept('E11.9', CodeSystems.ICD10CM, 'Type 2 diabetes mellitus');
 * ```
 */
export function buildCodeableConcept(
  code: string,
  system: string,
  display?: string,
  text?: string
): CodeableConcept {
  const coding: Coding = { system, code };
  if (display) coding.display = display;
  const cc: CodeableConcept = { coding: [coding] };
  if (text) cc.text = text;
  return cc;
}

/**
 * Build a Coding element.
 */
export function buildCoding(
  code: string,
  system: string,
  display?: string
): Coding {
  const coding: Coding = { system, code };
  if (display) coding.display = display;
  return coding;
}

/**
 * Add a coding to an existing CodeableConcept (immutably).
 * Returns a new CodeableConcept with the additional coding appended.
 */
export function addCodingToCodeableConcept(
  cc: CodeableConcept,
  coding: Coding
): CodeableConcept {
  return {
    ...cc,
    coding: [...(cc.coding ?? []), coding],
  };
}

// ---------------------------------------------------------------------------
// HumanName
// ---------------------------------------------------------------------------

/**
 * Build a HumanName from given/family strings or a full input object.
 *
 * ```typescript
 * buildHumanName('Jane', 'Doe');
 * buildHumanName({ given: ['Jane', 'Marie'], family: 'Doe', use: 'official' });
 * ```
 */
export function buildHumanName(
  givenOrInput: string | HumanNameInput,
  family?: string,
  use?: NameUse
): HumanName {
  if (typeof givenOrInput === "string") {
    const name: HumanName = {
      family: family ?? "",
      given: [givenOrInput],
    };
    if (use) name.use = use;
    return name;
  }

  const input = givenOrInput;
  const name: HumanName = {
    family: input.family,
    given: Array.isArray(input.given) ? input.given : [input.given],
  };
  if (input.use) name.use = input.use;
  if (input.prefix) {
    name.prefix = Array.isArray(input.prefix) ? input.prefix : [input.prefix];
  }
  if (input.suffix) {
    name.suffix = Array.isArray(input.suffix) ? input.suffix : [input.suffix];
  }
  return name;
}

// ---------------------------------------------------------------------------
// Identifier
// ---------------------------------------------------------------------------

/**
 * Build an Identifier element.
 *
 * ```typescript
 * buildIdentifier('12345', 'http://my-hospital.org/mrn');
 * buildIdentifier('12345', 'http://my-hospital.org/mrn', 'MR');  // with type code
 * ```
 */
export function buildIdentifier(
  value: string,
  system: string,
  typeCode?: string
): Identifier {
  const id: Identifier = { system, value };
  if (typeCode) {
    id.type = {
      coding: [{ system: CodeSystems.IDENTIFIER_TYPE, code: typeCode }],
    };
  }
  return id;
}

// ---------------------------------------------------------------------------
// Reference
// ---------------------------------------------------------------------------

/**
 * Build a Reference from a resource or a reference string.
 *
 * ```typescript
 * buildReference(patientResource);           // { reference: "Patient/uuid" }
 * buildReference('Patient/123');             // { reference: "Patient/123" }
 * buildReference(patientResource, 'Jane');   // { reference: "Patient/uuid", display: "Jane" }
 * ```
 */
export function buildReference(
  resourceOrRef: Resource | string,
  display?: string
): Reference {
  let refString: string;
  if (typeof resourceOrRef === "string") {
    refString = resourceOrRef;
  } else {
    const r = resourceOrRef;
    refString = r.id
      ? `${r.resourceType}/${r.id}`
      : r.resourceType;
  }
  const ref: Reference = { reference: refString };
  if (display) ref.display = display;
  return ref;
}

// ---------------------------------------------------------------------------
// Period
// ---------------------------------------------------------------------------

/**
 * Build a Period element.
 *
 * ```typescript
 * buildPeriod('2024-01-01', '2024-12-31');
 * buildPeriod('2024-01-01');  // open-ended
 * ```
 */
export function buildPeriod(start?: string, end?: string): Period {
  const period: Period = {};
  if (start) period.start = start;
  if (end) period.end = end;
  return period;
}

// ---------------------------------------------------------------------------
// Quantity
// ---------------------------------------------------------------------------

/**
 * Build a Quantity element with UCUM system as default.
 *
 * ```typescript
 * buildQuantity(120, 'mmHg');                     // uses UCUM system
 * buildQuantity(120, 'mmHg', 'mm[Hg]');          // explicit UCUM code
 * buildQuantity(5, 'tablets', 'http://custom');   // custom system
 * ```
 */
export function buildQuantity(
  value: number,
  unit: string,
  systemOrCode?: string,
  code?: string
): Quantity {
  const q: Quantity = { value, unit };
  if (code) {
    // Both system and code provided
    q.system = systemOrCode;
    q.code = code;
  } else if (systemOrCode) {
    // Single arg: if it looks like a URI, it's a system; otherwise it's a UCUM code
    if (systemOrCode.startsWith("http") || systemOrCode.startsWith("urn")) {
      q.system = systemOrCode;
    } else {
      q.system = CodeSystems.UCUM;
      q.code = systemOrCode;
    }
  }
  return q;
}

// ---------------------------------------------------------------------------
// Utility: Clean Object
// ---------------------------------------------------------------------------

/**
 * Remove undefined and null values from an object (deep).
 * Recursively cleans nested objects and array elements.
 * Used to produce clean FHIR JSON without `undefined` fields.
 */
export function cleanObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = cleanValue(value);
    }
  }
  return result as T;
}

function cleanValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => cleanValue(item));
  }
  if (typeof value === "object") {
    return cleanObject(value as Record<string, unknown>);
  }
  return value;
}
