// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Encounter resources.
 *
 * ```typescript
 * const encounter = new EncounterBuilder()
 *   .status('finished')
 *   .encounterClass('AMB', undefined, 'ambulatory')
 *   .subject('Patient/123')
 *   .period('2024-01-15', '2024-01-15')
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
  Coding,
  Period,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// Encounter Resource Type
// ---------------------------------------------------------------------------

export type EncounterStatus =
  | "planned"
  | "arrived"
  | "triaged"
  | "in-progress"
  | "onleave"
  | "finished"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export interface EncounterParticipant {
  type?: CodeableConcept[];
  individual?: Reference;
  period?: Period;
}

export interface EncounterHospitalization {
  admitSource?: CodeableConcept;
  dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation {
  location: Reference;
  status?: "planned" | "active" | "reserved" | "completed";
  period?: Period;
}

export interface EncounterResource extends Resource {
  resourceType: "Encounter";
  status: EncounterStatus;
  class: Coding;
  type?: CodeableConcept[];
  subject?: Reference;
  participant?: EncounterParticipant[];
  period?: Period;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  hospitalization?: EncounterHospitalization;
  serviceProvider?: Reference;
  location?: EncounterLocation[];
  identifier?: import("./types.js").Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class EncounterBuilder extends ResourceBuilder<EncounterResource> {
  constructor() {
    super("Encounter");
    // status and class are required — set defaults
    (this.resource as EncounterResource).status = "unknown";
    (this.resource as EncounterResource).class = {
      system: CodeSystems.ACT_CODE,
      code: "AMB",
    };
  }

  // --- Required Fields ---

  /** Set encounter status (required). */
  status(status: EncounterStatus): this {
    (this.resource as EncounterResource).status = status;
    return this;
  }

  /**
   * Set encounter class (required). Defaults to ActCode system.
   *
   * Common codes: 'AMB' (ambulatory), 'EMER' (emergency), 'IMP' (inpatient),
   * 'OBSENC' (observation), 'HH' (home health), 'VR' (virtual).
   */
  encounterClass(code: string, system?: string, display?: string): this {
    const coding: Coding = {
      system: system ?? CodeSystems.ACT_CODE,
      code,
    };
    if (display) coding.display = display;
    (this.resource as EncounterResource).class = coding;
    return this;
  }

  // --- Common Fields ---

  /** Add an encounter type. */
  type(code: string, system: string, display?: string): this {
    if (!this.resource.type) this.resource.type = [];
    this.resource.type.push(buildCodeableConcept(code, system, display));
    return this;
  }

  /** Set the patient subject. */
  subject(ref: Resource | string, display?: string): this {
    this.resource.subject = buildReference(ref, display);
    return this;
  }

  /** Add a participant (e.g., attending physician). */
  participant(
    individual: Resource | string,
    typeCode?: string,
    typeSystem?: string,
    typeDisplay?: string
  ): this {
    if (!this.resource.participant) this.resource.participant = [];
    const p: EncounterParticipant = {
      individual: buildReference(individual),
    };
    if (typeCode) {
      p.type = [
        buildCodeableConcept(
          typeCode,
          typeSystem ??
            "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
          typeDisplay
        ),
      ];
    }
    this.resource.participant.push(p);
    return this;
  }

  /** Set the encounter period. */
  period(start?: string, end?: string): this {
    this.resource.period = buildPeriod(start, end);
    return this;
  }

  /** Add a reason code. */
  reasonCode(code: string, system: string, display?: string): this {
    if (!this.resource.reasonCode) this.resource.reasonCode = [];
    this.resource.reasonCode.push(
      buildCodeableConcept(code, system, display)
    );
    return this;
  }

  /** Add a reason reference. */
  reasonReference(ref: Resource | string, display?: string): this {
    if (!this.resource.reasonReference) this.resource.reasonReference = [];
    this.resource.reasonReference.push(buildReference(ref, display));
    return this;
  }

  /** Set hospitalization details. */
  hospitalization(input: {
    admitSource?: { code: string; system?: string; display?: string };
    dischargeDisposition?: { code: string; system?: string; display?: string };
  }): this {
    const h: EncounterHospitalization = {};
    if (input.admitSource) {
      h.admitSource = buildCodeableConcept(
        input.admitSource.code,
        input.admitSource.system ??
          "http://terminology.hl7.org/CodeSystem/admit-source",
        input.admitSource.display
      );
    }
    if (input.dischargeDisposition) {
      h.dischargeDisposition = buildCodeableConcept(
        input.dischargeDisposition.code,
        input.dischargeDisposition.system ??
          "http://terminology.hl7.org/CodeSystem/discharge-disposition",
        input.dischargeDisposition.display
      );
    }
    (this.resource as EncounterResource).hospitalization = h;
    return this;
  }

  /** Set the service provider organization. */
  serviceProvider(ref: Resource | string, display?: string): this {
    this.resource.serviceProvider = buildReference(ref, display);
    return this;
  }

  /** Add a location. */
  location(
    ref: Resource | string,
    status?: EncounterLocation["status"],
    period?: { start?: string; end?: string }
  ): this {
    if (!this.resource.location) this.resource.location = [];
    const loc: EncounterLocation = { location: buildReference(ref) };
    if (status) loc.status = status;
    if (period) loc.period = buildPeriod(period.start, period.end);
    this.resource.location.push(loc);
    return this;
  }
}
