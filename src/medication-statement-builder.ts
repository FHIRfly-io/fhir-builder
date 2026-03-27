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
  buildPeriod,
  buildQuantity,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type {
  Annotation,
  CodeableConcept,
  Coding,
  DosageInput,
  Identifier,
  Period,
  Quantity,
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

export interface Dosage {
  text?: string;
  route?: CodeableConcept;
  doseAndRate?: { doseQuantity?: Quantity }[];
  timing?: { repeat?: { frequency?: number; period?: number; periodUnit?: string } };
  asNeededBoolean?: boolean;
}

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
    this.resource.effectiveDateTime = dateTime;
    return this;
  }

  /** Set effective period. */
  effectivePeriod(start: string, end?: string): this {
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
    const d: Dosage = {};
    if (input.text) d.text = input.text;
    if (input.route) {
      d.route = buildCodeableConcept(
        input.route.code,
        input.route.system ?? CodeSystems.SNOMED,
        input.route.display
      );
    }
    if (input.doseQuantity) {
      d.doseAndRate = [{
        doseQuantity: buildQuantity(
          input.doseQuantity.value,
          input.doseQuantity.unit,
          input.doseQuantity.system,
          input.doseQuantity.code
        ),
      }];
    }
    if (input.timing) {
      d.timing = {
        repeat: {
          ...(input.timing.frequency !== undefined && { frequency: input.timing.frequency }),
          ...(input.timing.period !== undefined && { period: input.timing.period }),
          ...(input.timing.periodUnit && { periodUnit: input.timing.periodUnit }),
        },
      };
    }
    if (input.asNeeded !== undefined) {
      d.asNeededBoolean = input.asNeeded;
    }
    this.resource.dosage.push(d);
    return this;
  }
}
