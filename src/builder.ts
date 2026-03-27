// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Main entry point for building FHIR R4 resources.
 *
 * ```typescript
 * import { FHIRBuilder } from '@fhirfly-io/fhir-builder';
 *
 * const fb = new FHIRBuilder();
 * const patient = fb.patient().name('Jane', 'Doe').gender('female').build();
 * ```
 *
 * Resource builder methods will be added in subsequent tasks:
 *   fb.patient()              → PatientBuilder
 *   fb.observation()          → ObservationBuilder
 *   fb.condition()            → ConditionBuilder
 *   fb.encounter()            → EncounterBuilder
 *   fb.coverage()             → CoverageBuilder
 *   fb.medicationStatement()  → MedicationStatementBuilder
 *   fb.medicationRequest()    → MedicationRequestBuilder
 *   fb.allergyIntolerance()   → AllergyIntoleranceBuilder
 *   fb.immunization()         → ImmunizationBuilder
 *   fb.procedure()            → ProcedureBuilder
 *   fb.diagnosticReport()     → DiagnosticReportBuilder
 *   fb.explanationOfBenefit() → ExplanationOfBenefitBuilder
 *   fb.bundle()               → BundleBuilder
 */

import {
  buildCodeableConcept,
  buildCoding,
  buildHumanName,
  buildIdentifier,
  buildReference,
  buildPeriod,
  buildQuantity,
  generateId,
} from "./helpers.js";

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

export class FHIRBuilder {
  /** Generate a UUID v4 string. */
  generateId(): string {
    return generateId();
  }

  /** Build a CodeableConcept from a code, system, and optional display. */
  codeableConcept(
    code: string,
    system: string,
    display?: string,
    text?: string
  ): CodeableConcept {
    return buildCodeableConcept(code, system, display, text);
  }

  /** Build a Coding element. */
  coding(code: string, system: string, display?: string): Coding {
    return buildCoding(code, system, display);
  }

  /** Build a HumanName from strings or a full input object. */
  humanName(
    givenOrInput: string | HumanNameInput,
    family?: string,
    use?: NameUse
  ): HumanName {
    return buildHumanName(givenOrInput, family, use);
  }

  /** Build an Identifier element. */
  identifier(value: string, system: string, typeCode?: string): Identifier {
    return buildIdentifier(value, system, typeCode);
  }

  /** Build a Reference from a resource or a reference string. */
  reference(resourceOrRef: Resource | string, display?: string): Reference {
    return buildReference(resourceOrRef, display);
  }

  /** Build a Period element. */
  period(start?: string, end?: string): Period {
    return buildPeriod(start, end);
  }

  /** Build a Quantity element (defaults to UCUM system). */
  quantity(
    value: number,
    unit: string,
    systemOrCode?: string,
    code?: string
  ): Quantity {
    return buildQuantity(value, unit, systemOrCode, code);
  }
}
