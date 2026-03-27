// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 AllergyIntolerance resources.
 *
 * ```typescript
 * const allergy = new AllergyIntoleranceBuilder()
 *   .clinicalStatus('active')
 *   .verificationStatus('confirmed')
 *   .type('allergy')
 *   .category('medication')
 *   .criticality('high')
 *   .snomedCode('387207008', 'Ibuprofen')
 *   .patient('Patient/123')
 *   .reaction({
 *     manifestation: [{ code: '271807003', system: CodeSystems.SNOMED, display: 'Rash' }],
 *     severity: 'moderate',
 *   })
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  buildCodeableConcept,
  buildQuantity,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type {
  Annotation,
  CodeableConcept,
  Identifier,
  Quantity,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// AllergyIntolerance Resource Type
// ---------------------------------------------------------------------------

export type AllergyClinicalStatus = "active" | "inactive" | "resolved";
export type AllergyVerificationStatus =
  | "unconfirmed"
  | "confirmed"
  | "refuted"
  | "entered-in-error";
export type AllergyType = "allergy" | "intolerance";
export type AllergyCategory = "food" | "medication" | "environment" | "biologic";
export type AllergyCriticality = "low" | "high" | "unable-to-assess";

export interface AllergyReaction {
  substance?: CodeableConcept;
  manifestation: CodeableConcept[];
  severity?: "mild" | "moderate" | "severe";
  onset?: string;
  note?: Annotation[];
}

export interface AllergyIntoleranceResource extends Resource {
  resourceType: "AllergyIntolerance";
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  type?: AllergyType;
  category?: AllergyCategory[];
  criticality?: AllergyCriticality;
  code?: CodeableConcept;
  patient: Reference;
  encounter?: Reference;
  onsetDateTime?: string;
  onsetAge?: Quantity;
  onsetString?: string;
  recordedDate?: string;
  recorder?: Reference;
  asserter?: Reference;
  lastOccurrence?: string;
  note?: Annotation[];
  reaction?: AllergyReaction[];
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class AllergyIntoleranceBuilder extends ResourceBuilder<AllergyIntoleranceResource> {
  constructor() {
    super("AllergyIntolerance");
    (this.resource as AllergyIntoleranceResource).patient = { reference: "" };
  }

  // --- Clinical & Verification Status ---

  /** Set clinical status. Uses allergyintolerance-clinical system. */
  clinicalStatus(status: AllergyClinicalStatus): this {
    this.resource.clinicalStatus = buildCodeableConcept(
      status,
      CodeSystems.ALLERGY_CLINICAL
    );
    return this;
  }

  /** Set verification status. Uses allergyintolerance-verification system. */
  verificationStatus(status: AllergyVerificationStatus): this {
    this.resource.verificationStatus = buildCodeableConcept(
      status,
      CodeSystems.ALLERGY_VERIFICATION
    );
    return this;
  }

  // --- Type, Category, Criticality ---

  /** Set allergy type ('allergy' or 'intolerance'). */
  type(type: AllergyType): this {
    this.resource.type = type;
    return this;
  }

  /** Add a category. Can be called multiple times. */
  category(category: AllergyCategory): this {
    if (!this.resource.category) this.resource.category = [];
    this.resource.category.push(category);
    return this;
  }

  /** Set criticality. */
  criticality(criticality: AllergyCriticality): this {
    this.resource.criticality = criticality;
    return this;
  }

  // --- Code ---

  /** Set the substance/product code. */
  code(code: string, system: string, display?: string): this {
    this.resource.code = buildCodeableConcept(code, system, display);
    return this;
  }

  /** Set substance using SNOMED CT (shorthand). */
  snomedCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.SNOMED, display);
  }

  /** Set substance using RxNorm (shorthand for medication allergies). */
  rxNormCode(rxcui: string, display?: string): this {
    return this.code(rxcui, CodeSystems.RXNORM, display);
  }

  // --- Patient & Context ---

  /** Set the patient reference (required). */
  patient(ref: Resource | string, display?: string): this {
    (this.resource as AllergyIntoleranceResource).patient = buildReference(ref, display);
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

  /** Set onset as a free-text string. */
  onsetString(text: string): this {
    this.resource.onsetString = text;
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

  /** Set last occurrence date. */
  lastOccurrence(dateTime: string): this {
    this.resource.lastOccurrence = dateTime;
    return this;
  }

  // --- Notes ---

  /** Add a text note. */
  note(text: string): this {
    if (!this.resource.note) this.resource.note = [];
    this.resource.note.push({ text });
    return this;
  }

  // --- Reactions ---

  /**
   * Add a reaction.
   *
   * ```typescript
   * .reaction({
   *   manifestation: [{ code: '271807003', system: CodeSystems.SNOMED, display: 'Rash' }],
   *   severity: 'moderate',
   *   substance: { code: '387207008', system: CodeSystems.SNOMED, display: 'Ibuprofen' },
   * })
   * ```
   */
  reaction(input: {
    manifestation: { code: string; system: string; display?: string }[];
    severity?: "mild" | "moderate" | "severe";
    substance?: { code: string; system: string; display?: string };
    onset?: string;
    note?: string;
  }): this {
    if (!this.resource.reaction) this.resource.reaction = [];
    const r: AllergyReaction = {
      manifestation: input.manifestation.map((m) =>
        buildCodeableConcept(m.code, m.system, m.display)
      ),
    };
    if (input.severity) r.severity = input.severity;
    if (input.substance) {
      r.substance = buildCodeableConcept(
        input.substance.code,
        input.substance.system,
        input.substance.display
      );
    }
    if (input.onset) r.onset = input.onset;
    if (input.note) r.note = [{ text: input.note }];
    this.resource.reaction.push(r);
    return this;
  }
}
