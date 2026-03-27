// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Immunization resources.
 *
 * ```typescript
 * const imm = new ImmunizationBuilder()
 *   .status('completed')
 *   .cvxCode('207', 'COVID-19, mRNA, LNP-S...')
 *   .patient('Patient/123')
 *   .occurrenceDateTime('2024-01-15')
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  addCodingToCodeableConcept,
  buildCodeableConcept,
  buildQuantity,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type {
  Annotation,
  CodeableConcept,
  Coding,
  Identifier,
  Quantity,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// Immunization Resource Type
// ---------------------------------------------------------------------------

export type ImmunizationStatus = "completed" | "entered-in-error" | "not-done";

export interface ImmunizationPerformer {
  actor: Reference;
  function?: CodeableConcept;
}

export interface ImmunizationProtocolApplied {
  series?: string;
  targetDisease?: CodeableConcept[];
  doseNumberPositiveInt?: number;
  doseNumberString?: string;
  seriesDosesPositiveInt?: number;
  seriesDosesString?: string;
}

export interface ImmunizationResource extends Resource {
  resourceType: "Immunization";
  status: ImmunizationStatus;
  vaccineCode: CodeableConcept;
  patient: Reference;
  encounter?: Reference;
  occurrenceDateTime?: string;
  occurrenceString?: string;
  recorded?: string;
  primarySource?: boolean;
  reportOrigin?: CodeableConcept;
  location?: Reference;
  manufacturer?: Reference;
  lotNumber?: string;
  expirationDate?: string;
  site?: CodeableConcept;
  route?: CodeableConcept;
  doseQuantity?: Quantity;
  performer?: ImmunizationPerformer[];
  note?: Annotation[];
  reasonCode?: CodeableConcept[];
  isSubpotent?: boolean;
  statusReason?: CodeableConcept;
  protocolApplied?: ImmunizationProtocolApplied[];
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class ImmunizationBuilder extends ResourceBuilder<ImmunizationResource> {
  constructor() {
    super("Immunization");
    (this.resource as ImmunizationResource).status = "completed";
    (this.resource as ImmunizationResource).vaccineCode = { coding: [] };
    (this.resource as ImmunizationResource).patient = { reference: "" };
  }

  // --- Required Fields ---

  /** Set immunization status (required). */
  status(status: ImmunizationStatus): this {
    (this.resource as ImmunizationResource).status = status;
    return this;
  }

  /** Set the vaccine code (required). */
  vaccineCode(code: string, system: string, display?: string): this {
    (this.resource as ImmunizationResource).vaccineCode = buildCodeableConcept(code, system, display);
    return this;
  }

  /** Set vaccine code using CVX (shorthand). */
  cvxCode(code: string, display?: string): this {
    return this.vaccineCode(code, CodeSystems.CVX, display);
  }

  /** Add an additional coding (e.g., MVX manufacturer from enrichment). */
  addCoding(coding: Coding): this {
    (this.resource as ImmunizationResource).vaccineCode = addCodingToCodeableConcept(
      (this.resource as ImmunizationResource).vaccineCode,
      coding
    );
    return this;
  }

  /** Set the patient reference (required). */
  patient(ref: Resource | string, display?: string): this {
    (this.resource as ImmunizationResource).patient = buildReference(ref, display);
    return this;
  }

  // --- Occurrence ---

  /** Set occurrence date/time (required — either this or occurrenceString). */
  occurrenceDateTime(dateTime: string): this {
    this.resource.occurrenceDateTime = dateTime;
    return this;
  }

  /** Set occurrence as text (e.g., "Spring 2023"). */
  occurrenceString(text: string): this {
    this.resource.occurrenceString = text;
    return this;
  }

  // --- Context ---

  /** Set the encounter context. */
  encounter(ref: Resource | string, display?: string): this {
    this.resource.encounter = buildReference(ref, display);
    return this;
  }

  /** Set the recorded date. */
  recorded(dateTime: string): this {
    this.resource.recorded = dateTime;
    return this;
  }

  /** Set whether this is from a primary source. */
  primarySource(value: boolean): this {
    this.resource.primarySource = value;
    return this;
  }

  /** Set report origin (when not primary source). */
  reportOrigin(code: string, system?: string, display?: string): this {
    this.resource.reportOrigin = buildCodeableConcept(
      code,
      system ?? "http://terminology.hl7.org/CodeSystem/immunization-origin",
      display
    );
    return this;
  }

  // --- Administration Details ---

  /** Set administration location. */
  location(ref: Resource | string, display?: string): this {
    this.resource.location = buildReference(ref, display);
    return this;
  }

  /** Set vaccine manufacturer. */
  manufacturer(ref: Resource | string, display?: string): this {
    this.resource.manufacturer = buildReference(ref, display);
    return this;
  }

  /** Set lot number. */
  lotNumber(value: string): this {
    this.resource.lotNumber = value;
    return this;
  }

  /** Set expiration date. */
  expirationDate(date: string): this {
    this.resource.expirationDate = date;
    return this;
  }

  /** Set injection site. Defaults to SNOMED system. */
  site(code: string, system?: string, display?: string): this {
    this.resource.site = buildCodeableConcept(code, system ?? CodeSystems.SNOMED, display);
    return this;
  }

  /** Set administration route. Defaults to SNOMED system. */
  route(code: string, system?: string, display?: string): this {
    this.resource.route = buildCodeableConcept(code, system ?? CodeSystems.SNOMED, display);
    return this;
  }

  /** Set dose quantity. */
  doseQuantity(value: number, unit: string): this {
    this.resource.doseQuantity = buildQuantity(value, unit);
    return this;
  }

  // --- Performer ---

  /** Add a performer. */
  performer(
    actor: Resource | string,
    functionCode?: string,
    functionSystem?: string,
    functionDisplay?: string
  ): this {
    if (!this.resource.performer) this.resource.performer = [];
    const p: ImmunizationPerformer = { actor: buildReference(actor) };
    if (functionCode) {
      p.function = buildCodeableConcept(
        functionCode,
        functionSystem ?? "http://terminology.hl7.org/CodeSystem/v2-0443",
        functionDisplay
      );
    }
    this.resource.performer.push(p);
    return this;
  }

  // --- Reason & Notes ---

  /** Add a reason code. */
  reasonCode(code: string, system: string, display?: string): this {
    if (!this.resource.reasonCode) this.resource.reasonCode = [];
    this.resource.reasonCode.push(buildCodeableConcept(code, system, display));
    return this;
  }

  /** Add a text note. */
  note(text: string): this {
    if (!this.resource.note) this.resource.note = [];
    this.resource.note.push({ text });
    return this;
  }

  // --- Subpotent & Status Reason ---

  /** Set whether vaccine was subpotent. */
  isSubpotent(value: boolean): this {
    this.resource.isSubpotent = value;
    return this;
  }

  /** Set status reason (for not-done status). */
  statusReason(code: string, system?: string, display?: string): this {
    this.resource.statusReason = buildCodeableConcept(
      code,
      system ?? "http://terminology.hl7.org/CodeSystem/v3-ActReason",
      display
    );
    return this;
  }

  // --- Protocol Applied ---

  /** Add a protocol applied entry. */
  protocolApplied(input: {
    series?: string;
    targetDisease?: { code: string; system: string; display?: string }[];
    doseNumber?: number | string;
    seriesDoses?: number | string;
  }): this {
    if (!this.resource.protocolApplied) this.resource.protocolApplied = [];
    const pa: ImmunizationProtocolApplied = {};
    if (input.series) pa.series = input.series;
    if (input.targetDisease) {
      pa.targetDisease = input.targetDisease.map((d) =>
        buildCodeableConcept(d.code, d.system, d.display)
      );
    }
    if (input.doseNumber !== undefined) {
      if (typeof input.doseNumber === "number") {
        pa.doseNumberPositiveInt = input.doseNumber;
      } else {
        pa.doseNumberString = input.doseNumber;
      }
    }
    if (input.seriesDoses !== undefined) {
      if (typeof input.seriesDoses === "number") {
        pa.seriesDosesPositiveInt = input.seriesDoses;
      } else {
        pa.seriesDosesString = input.seriesDoses;
      }
    }
    this.resource.protocolApplied.push(pa);
    return this;
  }
}
