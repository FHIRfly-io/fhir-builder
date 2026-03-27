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
 * Resource builders:
 *   fb.patient()              → PatientBuilder
 *   fb.encounter()            → EncounterBuilder
 *   fb.coverage()             → CoverageBuilder
 *   fb.observation()          → ObservationBuilder
 *   fb.condition()            → ConditionBuilder
 *   fb.diagnosticReport()     → DiagnosticReportBuilder
 *   fb.medicationStatement()  → MedicationStatementBuilder
 *   fb.medicationRequest()    → MedicationRequestBuilder
 *   fb.allergyIntolerance()   → AllergyIntoleranceBuilder
 *   fb.immunization()         → ImmunizationBuilder
 *   fb.procedure()            → ProcedureBuilder
 *   fb.explanationOfBenefit() → ExplanationOfBenefitBuilder
 *
 * Coming soon:
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
import { PatientBuilder } from "./patient-builder.js";
import { EncounterBuilder } from "./encounter-builder.js";
import { CoverageBuilder } from "./coverage-builder.js";
import { ObservationBuilder } from "./observation-builder.js";
import { ConditionBuilder } from "./condition-builder.js";
import { DiagnosticReportBuilder } from "./diagnostic-report-builder.js";
import { MedicationStatementBuilder } from "./medication-statement-builder.js";
import { MedicationRequestBuilder } from "./medication-request-builder.js";
import { AllergyIntoleranceBuilder } from "./allergy-intolerance-builder.js";
import { ImmunizationBuilder } from "./immunization-builder.js";
import { ProcedureBuilder } from "./procedure-builder.js";
import { ExplanationOfBenefitBuilder } from "./eob-builder.js";

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
  /** Create a new Patient builder. */
  patient(): PatientBuilder {
    return new PatientBuilder();
  }

  /** Create a new Encounter builder. */
  encounter(): EncounterBuilder {
    return new EncounterBuilder();
  }

  /** Create a new Coverage builder. */
  coverage(): CoverageBuilder {
    return new CoverageBuilder();
  }

  /** Create a new Observation builder. */
  observation(): ObservationBuilder {
    return new ObservationBuilder();
  }

  /** Create a new Condition builder. */
  condition(): ConditionBuilder {
    return new ConditionBuilder();
  }

  /** Create a new DiagnosticReport builder. */
  diagnosticReport(): DiagnosticReportBuilder {
    return new DiagnosticReportBuilder();
  }

  /** Create a new MedicationStatement builder. */
  medicationStatement(): MedicationStatementBuilder {
    return new MedicationStatementBuilder();
  }

  /** Create a new MedicationRequest builder. */
  medicationRequest(): MedicationRequestBuilder {
    return new MedicationRequestBuilder();
  }

  /** Create a new AllergyIntolerance builder. */
  allergyIntolerance(): AllergyIntoleranceBuilder {
    return new AllergyIntoleranceBuilder();
  }

  /** Create a new Immunization builder. */
  immunization(): ImmunizationBuilder {
    return new ImmunizationBuilder();
  }

  /** Create a new Procedure builder. */
  procedure(): ProcedureBuilder {
    return new ProcedureBuilder();
  }

  /** Create a new ExplanationOfBenefit builder. */
  explanationOfBenefit(): ExplanationOfBenefitBuilder {
    return new ExplanationOfBenefitBuilder();
  }

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
