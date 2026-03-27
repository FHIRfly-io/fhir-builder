// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 MedicationRequest resources.
 *
 * ```typescript
 * const rx = new MedicationRequestBuilder()
 *   .status('active')
 *   .intent('order')
 *   .medicationByRxNorm('83367', 'atorvastatin')
 *   .subject('Patient/123')
 *   .requester('Practitioner/dr-smith')
 *   .dosageInstruction({ text: 'Take 1 tablet daily at bedtime' })
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
import type { Dosage } from "./medication-statement-builder.js";

// ---------------------------------------------------------------------------
// MedicationRequest Resource Type
// ---------------------------------------------------------------------------

export type MedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";

export type MedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";

export type MedicationRequestPriority = "routine" | "urgent" | "asap" | "stat";

export interface DispenseRequest {
  quantity?: Quantity;
  expectedSupplyDuration?: { value: number; unit: string; system?: string; code?: string };
  numberOfRepeatsAllowed?: number;
  validityPeriod?: Period;
}

export interface MedicationRequestSubstitution {
  allowedBoolean?: boolean;
  reason?: CodeableConcept;
}

export interface MedicationRequestResource extends Resource {
  resourceType: "MedicationRequest";
  status: MedicationRequestStatus;
  intent: MedicationRequestIntent;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject: Reference;
  encounter?: Reference;
  authoredOn?: string;
  requester?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  dosageInstruction?: Dosage[];
  dispenseRequest?: DispenseRequest;
  substitution?: MedicationRequestSubstitution;
  note?: Annotation[];
  priority?: MedicationRequestPriority;
  category?: CodeableConcept[];
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class MedicationRequestBuilder extends ResourceBuilder<MedicationRequestResource> {
  constructor() {
    super("MedicationRequest");
    (this.resource as MedicationRequestResource).status = "active";
    (this.resource as MedicationRequestResource).intent = "order";
    (this.resource as MedicationRequestResource).subject = { reference: "" };
  }

  // --- Required Fields ---

  /** Set request status (required). */
  status(status: MedicationRequestStatus): this {
    (this.resource as MedicationRequestResource).status = status;
    return this;
  }

  /** Set request intent (required). */
  intent(intent: MedicationRequestIntent): this {
    (this.resource as MedicationRequestResource).intent = intent;
    return this;
  }

  /** Set the patient subject (required). */
  subject(ref: Resource | string, display?: string): this {
    (this.resource as MedicationRequestResource).subject = buildReference(ref, display);
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

  /** Add an additional coding to the medication. */
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
  encounter(ref: Resource | string, display?: string): this {
    this.resource.encounter = buildReference(ref, display);
    return this;
  }

  /** Set authored date. */
  authoredOn(dateTime: string): this {
    this.resource.authoredOn = dateTime;
    return this;
  }

  /** Set the requester reference. */
  requester(ref: Resource | string, display?: string): this {
    this.resource.requester = buildReference(ref, display);
    return this;
  }

  // --- Priority ---

  /** Set request priority. */
  priority(priority: MedicationRequestPriority): this {
    this.resource.priority = priority;
    return this;
  }

  // --- Category ---

  /** Add a category. */
  category(code: string, system?: string, display?: string): this {
    if (!this.resource.category) this.resource.category = [];
    this.resource.category.push(
      buildCodeableConcept(
        code,
        system ?? "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
        display
      )
    );
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

  // --- Dosage ---

  /** Add a dosage instruction. */
  dosageInstruction(input: DosageInput): this {
    if (!this.resource.dosageInstruction) this.resource.dosageInstruction = [];
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
    this.resource.dosageInstruction.push(d);
    return this;
  }

  // --- Dispense Request ---

  /** Set dispense request details. */
  dispenseRequest(input: {
    quantity?: { value: number; unit: string };
    expectedSupplyDuration?: { value: number; unit: string };
    numberOfRepeatsAllowed?: number;
    validityPeriod?: { start?: string; end?: string };
  }): this {
    const dr: DispenseRequest = {};
    if (input.quantity) {
      dr.quantity = buildQuantity(input.quantity.value, input.quantity.unit);
    }
    if (input.expectedSupplyDuration) {
      dr.expectedSupplyDuration = {
        value: input.expectedSupplyDuration.value,
        unit: input.expectedSupplyDuration.unit,
      };
    }
    if (input.numberOfRepeatsAllowed !== undefined) {
      dr.numberOfRepeatsAllowed = input.numberOfRepeatsAllowed;
    }
    if (input.validityPeriod) {
      dr.validityPeriod = buildPeriod(
        input.validityPeriod.start,
        input.validityPeriod.end
      );
    }
    this.resource.dispenseRequest = dr;
    return this;
  }

  // --- Substitution ---

  /** Set substitution preference. */
  substitution(
    allowed: boolean,
    reason?: { code: string; system: string; display?: string }
  ): this {
    const sub: MedicationRequestSubstitution = { allowedBoolean: allowed };
    if (reason) {
      sub.reason = buildCodeableConcept(reason.code, reason.system, reason.display);
    }
    this.resource.substitution = sub;
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
