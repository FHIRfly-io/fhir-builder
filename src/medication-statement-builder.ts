// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 MedicationStatement resources.
 *
 * ```typescript
 * const medStatement = new MedicationStatementBuilder()
 *   .status('active')
 *   .medicationByNDC('0069-0151-01', 'Atorvastatin 10mg')
 *   .subject('Patient/123')
 *   .dosage({ text: 'Take 1 tablet daily', route: { code: '26643006', display: 'Oral' } })
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  addCodingToCodeableConcept,
  buildCodeableConcept,
  buildDosage,
  buildPeriod,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type { ValidationIssue } from "./errors.js";
import type {
  Annotation,
  CodeableConcept,
  Coding,
  Dosage,
  DosageInput,
  Identifier,
  Period,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// MedicationStatement Resource Type
// ---------------------------------------------------------------------------

export type MedicationStatementStatus =
  | "active"
  | "completed"
  | "entered-in-error"
  | "intended"
  | "stopped"
  | "on-hold"
  | "unknown"
  | "not-taken";

export interface MedicationStatementResource extends Resource {
  resourceType: "MedicationStatement";
  status: MedicationStatementStatus;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject: Reference;
  context?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  dateAsserted?: string;
  informationSource?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  note?: Annotation[];
  dosage?: Dosage[];
  category?: CodeableConcept;
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class MedicationStatementBuilder extends ResourceBuilder<MedicationStatementResource> {
  constructor() {
    super("MedicationStatement");
    (this.resource as MedicationStatementResource).status = "active";
    (this.resource as MedicationStatementResource).subject = { reference: "" };
  }

  protected getValidationErrors(): ValidationIssue[] {
    const errors: ValidationIssue[] = [];
    if (!this.resource.subject?.reference) {
      errors.push({ field: "subject", message: "subject is required", severity: "error" });
    }
    return errors;
  }

  // --- Required Fields ---

  /** Set statement status (required). */
  status(status: MedicationStatementStatus): this {
    (this.resource as MedicationStatementResource).status = status;
    return this;
  }

  /** Set the patient subject (required). */
  subject(ref: Resource | string, display?: string): this {
    (this.resource as MedicationStatementResource).subject = buildReference(ref, display);
    return this;
  }

  // --- Medication (CodeableConcept) ---

  /** Set medication by code and system. */
  medicationCode(code: string, system: string, display?: string): this {
    this.clearChoiceType(["medicationCodeableConcept", "medicationReference"], "medicationCodeableConcept");
    this.resource.medicationCodeableConcept = buildCodeableConcept(code, system, display);
    return this;
  }

  /** Set medication by NDC code (shorthand). */
  medicationByNDC(ndcCode: string, display?: string): this {
    return this.medicationCode(ndcCode, CodeSystems.NDC, display);
  }

  /** Set medication by RxNorm code (shorthand). */
  medicationByRxNorm(rxcui: string, display?: string): this {
    return this.medicationCode(rxcui, CodeSystems.RXNORM, display);
  }

  /**
   * Add an additional coding to the medication (e.g., RxNorm crosswalk from enrichment).
   *
   * ```typescript
   * .medicationByNDC('0069-0151-01', 'Atorvastatin')
   * .addCoding({ system: CodeSystems.RXNORM, code: '83367', display: 'atorvastatin' })
   * ```
   */
  addCoding(coding: Coding): this {
    this.clearChoiceType(["medicationCodeableConcept", "medicationReference"], "medicationCodeableConcept");
    if (!this.resource.medicationCodeableConcept) {
      this.resource.medicationCodeableConcept = { coding: [] };
    }
    this.resource.medicationCodeableConcept = addCodingToCodeableConcept(
      this.resource.medicationCodeableConcept,
      coding
    );
    return this;
  }

  /** Set medication as a reference to a Medication resource. */
  medicationReference(ref: Resource | string, display?: string): this {
    this.clearChoiceType(["medicationCodeableConcept", "medicationReference"], "medicationReference");
    this.resource.medicationReference = buildReference(ref, display);
    return this;
  }

  // --- Context & Timing ---

  /** Set the encounter context. */
  context(ref: Resource | string, display?: string): this {
    this.resource.context = buildReference(ref, display);
    return this;
  }

  /** Set effective date/time. */
  effectiveDateTime(dateTime: string): this {
    this.clearChoiceType(["effectiveDateTime", "effectivePeriod"], "effectiveDateTime");
    this.resource.effectiveDateTime = dateTime;
    return this;
  }

  /** Set effective period. */
  effectivePeriod(start: string, end?: string): this {
    this.clearChoiceType(["effectiveDateTime", "effectivePeriod"], "effectivePeriod");
    this.resource.effectivePeriod = buildPeriod(start, end);
    return this;
  }

  /** Set date the statement was asserted. */
  dateAsserted(dateTime: string): this {
    this.resource.dateAsserted = dateTime;
    return this;
  }

  /** Set information source reference. */
  informationSource(ref: Resource | string, display?: string): this {
    this.resource.informationSource = buildReference(ref, display);
    return this;
  }

  // --- Reason ---

  /** Add a reason code. */
  reasonCode(code: string, system: string, display?: string): this {
    if (!this.resource.reasonCode) this.resource.reasonCode = [];
    this.resource.reasonCode.push(buildCodeableConcept(code, system, display));
    return this;
  }

  /** Add a reason reference. */
  reasonReference(ref: Resource | string, display?: string): this {
    if (!this.resource.reasonReference) this.resource.reasonReference = [];
    this.resource.reasonReference.push(buildReference(ref, display));
    return this;
  }

  // --- Notes ---

  /** Add a text note. */
  note(text: string): this {
    if (!this.resource.note) this.resource.note = [];
    this.resource.note.push({ text });
    return this;
  }

  // --- Category ---

  /** Set medication usage category. */
  category(code: string, system?: string, display?: string): this {
    this.resource.category = buildCodeableConcept(
      code,
      system ?? "http://terminology.hl7.org/CodeSystem/medication-statement-category",
      display
    );
    return this;
  }

  // --- Dosage ---

  /** Add a dosage instruction. */
  dosage(input: DosageInput): this {
    if (!this.resource.dosage) this.resource.dosage = [];
    this.resource.dosage.push(buildDosage(input));
    return this;
  }
}
