// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * @fhirfly-io/fhir-builder
 *
 * Fluent TypeScript builder for FHIR R4 resources.
 * Free, offline, open source.
 */

// Main entry point
export { FHIRBuilder } from "./builder.js";

// Base class for resource builders
export { ResourceBuilder } from "./resource-builder.js";

// Code system constants
export { CodeSystems } from "./code-systems.js";
export type { CodeSystem } from "./code-systems.js";

// Helper functions
export {
  generateId,
  buildCodeableConcept,
  buildCoding,
  addCodingToCodeableConcept,
  buildHumanName,
  buildIdentifier,
  buildReference,
  buildPeriod,
  buildQuantity,
  cleanObject,
} from "./helpers.js";

// Types
export type {
  Meta,
  Extension,
  Coding,
  CodeableConcept,
  HumanName,
  NameUse,
  Address,
  ContactPoint,
  Identifier,
  Reference,
  Period,
  Quantity,
  Range,
  Annotation,
  Narrative,
  Resource,
  AdministrativeGender,
  HumanNameInput,
  AddressInput,
  DosageInput,
} from "./types.js";
