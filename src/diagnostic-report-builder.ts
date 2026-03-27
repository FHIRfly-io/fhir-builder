// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 DiagnosticReport resources.
 *
 * ```typescript
 * const report = new DiagnosticReportBuilder()
 *   .status('final')
 *   .category('LAB')
 *   .loincCode('58410-2', 'CBC panel')
 *   .subject('Patient/123')
 *   .result('Observation/obs-1')
 *   .result('Observation/obs-2')
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  buildCodeableConcept,
  buildPeriod,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type {
  CodeableConcept,
  Identifier,
  Period,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// DiagnosticReport Resource Type
// ---------------------------------------------------------------------------

export type DiagnosticReportStatus =
  | "registered"
  | "partial"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "appended"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export interface PresentedForm {
  contentType: string;
  data?: string;
  url?: string;
}

export interface DiagnosticReportResource extends Resource {
  resourceType: "DiagnosticReport";
  status: DiagnosticReportStatus;
  code: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  result?: Reference[];
  conclusion?: string;
  conclusionCode?: CodeableConcept[];
  presentedForm?: PresentedForm[];
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class DiagnosticReportBuilder extends ResourceBuilder<DiagnosticReportResource> {
  constructor() {
    super("DiagnosticReport");
    // status and code are required — set defaults
    (this.resource as DiagnosticReportResource).status = "final";
    (this.resource as DiagnosticReportResource).code = { coding: [] };
  }

  // --- Required Fields ---

  /** Set report status (required). */
  status(status: DiagnosticReportStatus): this {
    (this.resource as DiagnosticReportResource).status = status;
    return this;
  }

  /** Set the report code (required). */
  code(code: string, system: string, display?: string): this {
    (this.resource as DiagnosticReportResource).code = buildCodeableConcept(
      code,
      system,
      display
    );
    return this;
  }

  /**
   * Set the report code using LOINC (shorthand).
   *
   * ```typescript
   * .loincCode('58410-2', 'CBC panel')
   * ```
   */
  loincCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.LOINC, display);
  }

  // --- Category ---

  /**
   * Add a report category.
   *
   * Common codes: 'LAB' (Laboratory), 'RAD' (Radiology), 'AU' (Audiology),
   * 'CT' (CAT Scan), 'US' (Ultrasound).
   * Defaults to v2-0074 diagnostic service section system.
   */
  category(code: string, system?: string, display?: string): this {
    if (!this.resource.category) this.resource.category = [];
    this.resource.category.push(
      buildCodeableConcept(
        code,
        system ?? "http://terminology.hl7.org/CodeSystem/v2-0074",
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

  /** Set the instant the report was issued. */
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

  // --- Results ---

  /** Add a result Observation reference. */
  result(ref: Resource | string, display?: string): this {
    if (!this.resource.result) this.resource.result = [];
    this.resource.result.push(buildReference(ref, display));
    return this;
  }

  // --- Conclusion ---

  /** Set conclusion text. */
  conclusion(text: string): this {
    this.resource.conclusion = text;
    return this;
  }

  /** Add a conclusion code. */
  conclusionCode(code: string, system: string, display?: string): this {
    if (!this.resource.conclusionCode) this.resource.conclusionCode = [];
    this.resource.conclusionCode.push(
      buildCodeableConcept(code, system, display)
    );
    return this;
  }

  // --- Presented Form ---

  /**
   * Add a presented form (e.g., PDF report).
   *
   * @param contentType - MIME type (e.g., 'application/pdf')
   * @param data - Base64-encoded data
   * @param url - URL to the document
   */
  presentedForm(contentType: string, data?: string, url?: string): this {
    if (!this.resource.presentedForm) this.resource.presentedForm = [];
    const form: PresentedForm = { contentType };
    if (data) form.data = data;
    if (url) form.url = url;
    this.resource.presentedForm.push(form);
    return this;
  }
}
