// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Condition resources.
 *
 * ```typescript
 * const condition = new ConditionBuilder()
 *   .clinicalStatus('active')
 *   .verificationStatus('confirmed')
 *   .icd10('E11.9', 'Type 2 diabetes mellitus')
 *   .subject('Patient/123')
 *   .onsetDateTime('2020-03-15')
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  buildCodeableConcept,
  buildPeriod,
  buildQuantity,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type {
  Annotation,
  CodeableConcept,
  Identifier,
  Period,
  Quantity,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// Condition Resource Type
// ---------------------------------------------------------------------------

export type ConditionClinicalStatus =
  | "active"
  | "recurrence"
  | "relapse"
  | "inactive"
  | "remission"
  | "resolved";

export type ConditionVerificationStatus =
  | "unconfirmed"
  | "provisional"
  | "differential"
  | "confirmed"
  | "refuted"
  | "entered-in-error";

export interface ConditionStage {
  summary?: CodeableConcept;
  assessment?: Reference[];
}

export interface ConditionEvidence {
  code?: CodeableConcept[];
  detail?: Reference[];
}

export interface ConditionResource extends Resource {
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  category?: CodeableConcept[];
  severity?: CodeableConcept;
  code?: CodeableConcept;
  bodySite?: CodeableConcept[];
  subject: Reference;
  encounter?: Reference;
  onsetDateTime?: string;
  onsetAge?: Quantity;
  onsetPeriod?: Period;
  onsetString?: string;
  abatementDateTime?: string;
  abatementAge?: Quantity;
  abatementString?: string;
  recordedDate?: string;
  recorder?: Reference;
  asserter?: Reference;
  stage?: ConditionStage[];
  evidence?: ConditionEvidence[];
  note?: Annotation[];
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class ConditionBuilder extends ResourceBuilder<ConditionResource> {
  constructor() {
    super("Condition");
    // subject is required — set empty default
    (this.resource as ConditionResource).subject = { reference: "" };
  }

  // --- Clinical & Verification Status ---

  /** Set clinical status. Uses condition-clinical system. */
  clinicalStatus(status: ConditionClinicalStatus): this {
    this.resource.clinicalStatus = buildCodeableConcept(
      status,
      CodeSystems.CONDITION_CLINICAL
    );
    return this;
  }

  /** Set verification status. Uses condition-ver-status system. */
  verificationStatus(status: ConditionVerificationStatus): this {
    this.resource.verificationStatus = buildCodeableConcept(
      status,
      CodeSystems.CONDITION_VERIFICATION
    );
    return this;
  }

  // --- Category & Severity ---

  /**
   * Add a category. Defaults to condition-category system.
   *
   * Common codes: 'encounter-diagnosis', 'problem-list-item'.
   */
  category(code: string, system?: string, display?: string): this {
    if (!this.resource.category) this.resource.category = [];
    this.resource.category.push(
      buildCodeableConcept(
        code,
        system ?? CodeSystems.CONDITION_CATEGORY,
        display
      )
    );
    return this;
  }

  /**
   * Set severity. Defaults to SNOMED system.
   *
   * Common codes: '24484000' (Severe), '6736007' (Moderate), '255604002' (Mild).
   */
  severity(code: string, system?: string, display?: string): this {
    this.resource.severity = buildCodeableConcept(
      code,
      system ?? CodeSystems.SNOMED,
      display
    );
    return this;
  }

  // --- Code ---

  /** Set the condition code. */
  code(code: string, system: string, display?: string): this {
    this.resource.code = buildCodeableConcept(code, system, display);
    return this;
  }

  /**
   * Set the condition code using ICD-10-CM (shorthand).
   *
   * ```typescript
   * .icd10('E11.9', 'Type 2 diabetes mellitus')
   * ```
   */
  icd10(code: string, display?: string): this {
    return this.code(code, CodeSystems.ICD10CM, display);
  }

  /**
   * Set the condition code using SNOMED CT (shorthand).
   *
   * ```typescript
   * .snomedCode('73211009', 'Diabetes mellitus')
   * ```
   */
  snomedCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.SNOMED, display);
  }

  // --- Subject & Context ---

  /** Set the patient subject (required). */
  subject(ref: Resource | string, display?: string): this {
    (this.resource as ConditionResource).subject = buildReference(
      ref,
      display
    );
    return this;
  }

  /** Set the encounter context. */
  encounter(ref: Resource | string, display?: string): this {
    this.resource.encounter = buildReference(ref, display);
    return this;
  }

  // --- Onset ---

  /** Set onset date/time. */
  onsetDateTime(dateTime: string): this {
    this.resource.onsetDateTime = dateTime;
    return this;
  }

  /** Set onset as an age. */
  onsetAge(value: number, unit: string): this {
    this.resource.onsetAge = buildQuantity(value, unit);
    return this;
  }

  /** Set onset as a period. */
  onsetPeriod(start: string, end?: string): this {
    this.resource.onsetPeriod = buildPeriod(start, end);
    return this;
  }

  /** Set onset as a free-text string. */
  onsetString(text: string): this {
    this.resource.onsetString = text;
    return this;
  }

  // --- Abatement ---

  /** Set abatement date/time. */
  abatementDateTime(dateTime: string): this {
    this.resource.abatementDateTime = dateTime;
    return this;
  }

  /** Set abatement as an age. */
  abatementAge(value: number, unit: string): this {
    this.resource.abatementAge = buildQuantity(value, unit);
    return this;
  }

  /** Set abatement as a free-text string. */
  abatementString(text: string): this {
    this.resource.abatementString = text;
    return this;
  }

  // --- Metadata ---

  /** Set recorded date. */
  recordedDate(dateTime: string): this {
    this.resource.recordedDate = dateTime;
    return this;
  }

  /** Set the recorder reference. */
  recorder(ref: Resource | string, display?: string): this {
    this.resource.recorder = buildReference(ref, display);
    return this;
  }

  /** Set the asserter reference. */
  asserter(ref: Resource | string, display?: string): this {
    this.resource.asserter = buildReference(ref, display);
    return this;
  }

  // --- Notes ---

  /** Add a text note. */
  note(text: string): this {
    if (!this.resource.note) this.resource.note = [];
    this.resource.note.push({ text });
    return this;
  }

  // --- Body Site ---

  /** Add a body site. */
  bodySite(code: string, system?: string, display?: string): this {
    if (!this.resource.bodySite) this.resource.bodySite = [];
    this.resource.bodySite.push(
      buildCodeableConcept(code, system ?? CodeSystems.SNOMED, display)
    );
    return this;
  }

  // --- Stage ---

  /** Add a stage assessment. */
  stage(
    summary?: { code: string; system: string; display?: string },
    assessment?: (Resource | string)[]
  ): this {
    if (!this.resource.stage) this.resource.stage = [];
    const s: ConditionStage = {};
    if (summary) {
      s.summary = buildCodeableConcept(
        summary.code,
        summary.system,
        summary.display
      );
    }
    if (assessment) {
      s.assessment = assessment.map((a) => buildReference(a));
    }
    this.resource.stage.push(s);
    return this;
  }

  // --- Evidence ---

  /** Add evidence for the condition. */
  evidence(
    code?: { code: string; system: string; display?: string },
    detail?: (Resource | string)[]
  ): this {
    if (!this.resource.evidence) this.resource.evidence = [];
    const e: ConditionEvidence = {};
    if (code) {
      e.code = [
        buildCodeableConcept(code.code, code.system, code.display),
      ];
    }
    if (detail) {
      e.detail = detail.map((d) => buildReference(d));
    }
    this.resource.evidence.push(e);
    return this;
  }
}
