// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Procedure resources.
 *
 * ```typescript
 * const proc = new ProcedureBuilder()
 *   .status('completed')
 *   .cptCode('27447', 'Total knee replacement')
 *   .subject('Patient/123')
 *   .performedDateTime('2024-01-15')
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
  Annotation,
  CodeableConcept,
  Identifier,
  Period,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// Procedure Resource Type
// ---------------------------------------------------------------------------

export type ProcedureStatus =
  | "preparation"
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "stopped"
  | "completed"
  | "entered-in-error"
  | "unknown";

export interface ProcedurePerformer {
  actor: Reference;
  function?: CodeableConcept;
  onBehalfOf?: Reference;
}

export interface ProcedureResource extends Resource {
  resourceType: "Procedure";
  status: ProcedureStatus;
  code?: CodeableConcept;
  subject: Reference;
  encounter?: Reference;
  performedDateTime?: string;
  performedPeriod?: Period;
  performedString?: string;
  recorder?: Reference;
  asserter?: Reference;
  performer?: ProcedurePerformer[];
  location?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  bodySite?: CodeableConcept[];
  outcome?: CodeableConcept;
  complication?: CodeableConcept[];
  followUp?: CodeableConcept[];
  note?: Annotation[];
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class ProcedureBuilder extends ResourceBuilder<ProcedureResource> {
  constructor() {
    super("Procedure");
    (this.resource as ProcedureResource).status = "completed";
    (this.resource as ProcedureResource).subject = { reference: "" };
  }

  // --- Required Fields ---

  /** Set procedure status (required). */
  status(status: ProcedureStatus): this {
    (this.resource as ProcedureResource).status = status;
    return this;
  }

  /** Set the patient subject (required). */
  subject(ref: Resource | string, display?: string): this {
    (this.resource as ProcedureResource).subject = buildReference(ref, display);
    return this;
  }

  // --- Code ---

  /** Set the procedure code. */
  code(code: string, system: string, display?: string): this {
    this.resource.code = buildCodeableConcept(code, system, display);
    return this;
  }

  /** Set procedure code using SNOMED CT (shorthand). */
  snomedCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.SNOMED, display);
  }

  /** Set procedure code using CPT (shorthand). */
  cptCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.CPT, display);
  }

  /** Set procedure code using HCPCS (shorthand). */
  hcpcsCode(code: string, display?: string): this {
    return this.code(code, CodeSystems.HCPCS, display);
  }

  // --- Context & Timing ---

  /** Set the encounter context. */
  encounter(ref: Resource | string, display?: string): this {
    this.resource.encounter = buildReference(ref, display);
    return this;
  }

  /** Set performed date/time. */
  performedDateTime(dateTime: string): this {
    this.resource.performedDateTime = dateTime;
    return this;
  }

  /** Set performed period. */
  performedPeriod(start: string, end?: string): this {
    this.resource.performedPeriod = buildPeriod(start, end);
    return this;
  }

  /** Set performed as a free-text string. */
  performedString(text: string): this {
    this.resource.performedString = text;
    return this;
  }

  // --- Metadata ---

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

  // --- Performer ---

  /** Add a performer. */
  performer(
    actor: Resource | string,
    functionCode?: string,
    onBehalfOf?: Resource | string
  ): this {
    if (!this.resource.performer) this.resource.performer = [];
    const p: ProcedurePerformer = { actor: buildReference(actor) };
    if (functionCode) {
      p.function = buildCodeableConcept(
        functionCode,
        CodeSystems.SNOMED
      );
    }
    if (onBehalfOf) {
      p.onBehalfOf = buildReference(onBehalfOf);
    }
    this.resource.performer.push(p);
    return this;
  }

  /** Set procedure location. */
  location(ref: Resource | string, display?: string): this {
    this.resource.location = buildReference(ref, display);
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

  // --- Body Site ---

  /** Add a body site. Defaults to SNOMED system. */
  bodySite(code: string, system?: string, display?: string): this {
    if (!this.resource.bodySite) this.resource.bodySite = [];
    this.resource.bodySite.push(
      buildCodeableConcept(code, system ?? CodeSystems.SNOMED, display)
    );
    return this;
  }

  // --- Outcome, Complication, Follow-Up ---

  /** Set outcome. */
  outcome(code: string, system: string, display?: string): this {
    this.resource.outcome = buildCodeableConcept(code, system, display);
    return this;
  }

  /** Add a complication. */
  complication(code: string, system: string, display?: string): this {
    if (!this.resource.complication) this.resource.complication = [];
    this.resource.complication.push(buildCodeableConcept(code, system, display));
    return this;
  }

  /** Add a follow-up action. */
  followUp(code: string, system: string, display?: string): this {
    if (!this.resource.followUp) this.resource.followUp = [];
    this.resource.followUp.push(buildCodeableConcept(code, system, display));
    return this;
  }

  // --- Notes ---

  /** Add a text note. */
  note(text: string): this {
    if (!this.resource.note) this.resource.note = [];
    this.resource.note.push({ text });
    return this;
  }
}
