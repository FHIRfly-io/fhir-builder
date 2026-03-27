// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Observation resources.
 *
 * ```typescript
 * const obs = new ObservationBuilder()
 *   .status('final')
 *   .category('vital-signs')
 *   .loincCode('8302-2', 'Body height')
 *   .subject('Patient/123')
 *   .valueQuantity(170, 'cm', 'cm')
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
// Observation Resource Type
// ---------------------------------------------------------------------------

export type ObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export interface ObservationComponent {
  code: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
}

export interface ObservationReferenceRange {
  low?: Quantity;
  high?: Quantity;
  text?: string;
}

export interface ObservationResource extends Resource {
  resourceType: "Observation";
  status: ObservationStatus;
  code: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
  note?: Annotation[];
  component?: ObservationComponent[];
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  dataAbsentReason?: CodeableConcept;
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class ObservationBuilder extends ResourceBuilder<ObservationResource> {
  constructor() {
    super("Observation");
    // status and code are required — set defaults
    (this.resource as ObservationResource).status = "final";
    (this.resource as ObservationResource).code = { coding: [] };
  }

  // --- Required Fields ---

  /** Set observation status (required). */
  status(status: ObservationStatus): this {
    (this.resource as ObservationResource).status = status;
    return this;
  }

  /**
   * Set the observation code (required).
   *
   * For LOINC codes, prefer `.loincCode()` for convenience.
   */
  code(code: string, system: string, display?: string): this {
    (this.resource as ObservationResource).code = buildCodeableConcept(
      code,
      system,
      display
    );
    return this;
  }

  /**
   * Set the observation code using LOINC (shorthand).
   *
   * ```typescript
   * .loincCode('8302-2', 'Body height')
   * ```
   */
  loincCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.LOINC, display);
  }

  // --- Category ---

  /**
   * Add an observation category. Defaults to observation-category system.
   *
   * Common codes: 'vital-signs', 'laboratory', 'social-history', 'imaging',
   * 'procedure', 'survey', 'exam', 'therapy', 'activity'.
   */
  category(code: string, system?: string, display?: string): this {
    if (!this.resource.category) this.resource.category = [];
    this.resource.category.push(
      buildCodeableConcept(
        code,
        system ?? CodeSystems.OBSERVATION_CATEGORY,
        display
      )
    );
    return this;
  }

  // --- Subject & Context ---

  /** Set the patient subject. */
  subject(ref: Resource | string, display?: string): this {
    this.resource.subject = buildReference(ref, display);
    return this;
  }

  /** Set the encounter context. */
  encounter(ref: Resource | string, display?: string): this {
    this.resource.encounter = buildReference(ref, display);
    return this;
  }

  // --- Timing ---

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

  /** Set the instant the observation was made available. */
  issued(instant: string): this {
    this.resource.issued = instant;
    return this;
  }

  // --- Performer ---

  /** Add a performer reference. */
  performer(ref: Resource | string, display?: string): this {
    if (!this.resource.performer) this.resource.performer = [];
    this.resource.performer.push(buildReference(ref, display));
    return this;
  }

  // --- Values ---

  /** Set a numeric value with unit. Defaults to UCUM system. */
  valueQuantity(
    value: number,
    unit: string,
    systemOrCode?: string,
    code?: string
  ): this {
    this.resource.valueQuantity = buildQuantity(
      value,
      unit,
      systemOrCode,
      code
    );
    return this;
  }

  /** Set a coded value. */
  valueCodeableConcept(
    code: string,
    system: string,
    display?: string
  ): this {
    this.resource.valueCodeableConcept = buildCodeableConcept(
      code,
      system,
      display
    );
    return this;
  }

  /** Set a string value. */
  valueString(value: string): this {
    this.resource.valueString = value;
    return this;
  }

  /** Set a boolean value. */
  valueBoolean(value: boolean): this {
    this.resource.valueBoolean = value;
    return this;
  }

  // --- Interpretation ---

  /**
   * Add an interpretation code.
   *
   * Common codes: 'H' (high), 'L' (low), 'N' (normal), 'HH' (critically high),
   * 'LL' (critically low), 'A' (abnormal).
   */
  interpretation(code: string, system?: string, display?: string): this {
    if (!this.resource.interpretation) this.resource.interpretation = [];
    this.resource.interpretation.push(
      buildCodeableConcept(
        code,
        system ??
          "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
        display
      )
    );
    return this;
  }

  // --- Reference Range ---

  /** Add a reference range. */
  referenceRange(low?: Quantity, high?: Quantity, text?: string): this {
    if (!this.resource.referenceRange) this.resource.referenceRange = [];
    const rr: ObservationReferenceRange = {};
    if (low) rr.low = low;
    if (high) rr.high = high;
    if (text) rr.text = text;
    this.resource.referenceRange.push(rr);
    return this;
  }

  // --- Notes ---

  /** Add a text note. */
  note(text: string): this {
    if (!this.resource.note) this.resource.note = [];
    this.resource.note.push({ text });
    return this;
  }

  // --- Components ---

  /**
   * Add a component (for multi-component observations like blood pressure).
   *
   * ```typescript
   * .component('8480-6', CodeSystems.LOINC, { valueQuantity: buildQuantity(120, 'mmHg', 'mm[Hg]') })
   * ```
   */
  component(
    code: string,
    system: string,
    value: {
      valueQuantity?: Quantity;
      valueCodeableConcept?: CodeableConcept;
      valueString?: string;
      valueBoolean?: boolean;
    },
    display?: string
  ): this {
    if (!this.resource.component) this.resource.component = [];
    const comp: ObservationComponent = {
      code: buildCodeableConcept(code, system, display),
      ...value,
    };
    this.resource.component.push(comp);
    return this;
  }

  // --- Additional Fields ---

  /** Set body site. */
  bodySite(code: string, system: string, display?: string): this {
    this.resource.bodySite = buildCodeableConcept(code, system, display);
    return this;
  }

  /** Set observation method. */
  method(code: string, system: string, display?: string): this {
    this.resource.method = buildCodeableConcept(code, system, display);
    return this;
  }

  /**
   * Set data absent reason.
   *
   * Standard codes: 'unknown', 'asked-unknown', 'temp-unknown', 'not-asked',
   * 'asked-declined', 'masked', 'not-applicable', 'unsupported', 'as-text',
   * 'error', 'not-a-number', 'negative-infinity', 'positive-infinity',
   * 'not-performed', 'not-permitted'.
   */
  dataAbsentReason(code: string, display?: string): this {
    this.resource.dataAbsentReason = buildCodeableConcept(
      code,
      "http://terminology.hl7.org/CodeSystem/data-absent-reason",
      display
    );
    return this;
  }
}
