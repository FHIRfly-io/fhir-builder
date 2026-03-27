// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 ExplanationOfBenefit resources.
 *
 * Covers the CMS-0057-F payer mandate for claims data exchange.
 *
 * ```typescript
 * const eob = new ExplanationOfBenefitBuilder()
 *   .status('active')
 *   .type('institutional')
 *   .use('claim')
 *   .patient('Patient/123')
 *   .insurer('Organization/ins-co')
 *   .provider('Organization/hosp-1')
 *   .outcome('complete')
 *   .insurance('Coverage/cov-1', true)
 *   .item({ sequence: 1, productOrService: { code: '99213', system: CodeSystems.CPT } })
 *   .total('submitted', 150.00, 'USD')
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  buildCodeableConcept,
  buildPeriod,
  buildReference,
} from "./helpers.js";
import type {
  CodeableConcept,
  Identifier,
  Period,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// ExplanationOfBenefit Resource Type
// ---------------------------------------------------------------------------

export type EOBStatus = "active" | "cancelled" | "draft" | "entered-in-error";
export type EOBUse = "claim" | "preauthorization" | "predetermination";
export type EOBOutcome = "queued" | "complete" | "error" | "partial";

export interface Money {
  value?: number;
  currency?: string;
}

export interface EOBInsurance {
  coverage: Reference;
  focal: boolean;
  preAuthRef?: string[];
}

export interface EOBItemAdjudication {
  category: CodeableConcept;
  amount?: Money;
  value?: number;
  reason?: CodeableConcept;
}

export interface EOBItem {
  sequence: number;
  productOrService: CodeableConcept;
  servicedDate?: string;
  servicedPeriod?: Period;
  quantity?: { value: number; unit?: string };
  unitPrice?: Money;
  net?: Money;
  adjudication?: EOBItemAdjudication[];
  diagnosisSequence?: number[];
  procedureSequence?: number[];
  careTeamSequence?: number[];
}

export interface EOBTotal {
  category: CodeableConcept;
  amount: Money;
}

export interface EOBPayment {
  type?: CodeableConcept;
  date?: string;
  amount?: Money;
}

export interface EOBCareTeam {
  sequence: number;
  provider: Reference;
  role?: CodeableConcept;
  qualification?: CodeableConcept;
  responsible?: boolean;
}

export interface EOBDiagnosis {
  sequence: number;
  diagnosisCodeableConcept?: CodeableConcept;
  type?: CodeableConcept[];
}

export interface EOBProcedure {
  sequence: number;
  procedureCodeableConcept?: CodeableConcept;
  date?: string;
  type?: CodeableConcept[];
}

export interface EOBSupportingInfo {
  sequence: number;
  category: CodeableConcept;
  code?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
}

export interface ExplanationOfBenefitResource extends Resource {
  resourceType: "ExplanationOfBenefit";
  status: EOBStatus;
  type: CodeableConcept;
  use: EOBUse;
  patient: Reference;
  billablePeriod?: Period;
  created: string;
  insurer: Reference;
  provider: Reference;
  outcome: EOBOutcome;
  insurance: EOBInsurance[];
  item?: EOBItem[];
  total?: EOBTotal[];
  payment?: EOBPayment;
  careTeam?: EOBCareTeam[];
  diagnosis?: EOBDiagnosis[];
  procedure?: EOBProcedure[];
  supportingInfo?: EOBSupportingInfo[];
  priority?: CodeableConcept;
  facility?: Reference;
  prescription?: Reference;
  claim?: Reference;
  claimResponse?: Reference;
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const EOB_TYPE_SYSTEM = "http://terminology.hl7.org/CodeSystem/claim-type";
const ADJUDICATION_SYSTEM = "http://terminology.hl7.org/CodeSystem/adjudication";

export class ExplanationOfBenefitBuilder extends ResourceBuilder<ExplanationOfBenefitResource> {
  constructor() {
    super("ExplanationOfBenefit");
    const r = this.resource as ExplanationOfBenefitResource;
    r.status = "active";
    r.type = buildCodeableConcept("institutional", EOB_TYPE_SYSTEM);
    r.use = "claim";
    r.patient = { reference: "" };
    r.created = new Date().toISOString();
    r.insurer = { reference: "" };
    r.provider = { reference: "" };
    r.outcome = "complete";
    r.insurance = [];
  }

  // --- Required Fields ---

  /** Set EOB status (required). */
  status(status: EOBStatus): this {
    (this.resource as ExplanationOfBenefitResource).status = status;
    return this;
  }

  /**
   * Set claim type (required). Defaults to claim-type system.
   *
   * Common codes: 'institutional', 'oral', 'pharmacy', 'professional', 'vision'.
   */
  type(code: string, system?: string, display?: string): this {
    (this.resource as ExplanationOfBenefitResource).type = buildCodeableConcept(
      code,
      system ?? EOB_TYPE_SYSTEM,
      display
    );
    return this;
  }

  /** Set use (required): 'claim', 'preauthorization', or 'predetermination'. */
  use(use: EOBUse): this {
    (this.resource as ExplanationOfBenefitResource).use = use;
    return this;
  }

  /** Set the patient reference (required). */
  patient(ref: Resource | string, display?: string): this {
    (this.resource as ExplanationOfBenefitResource).patient = buildReference(ref, display);
    return this;
  }

  /** Set the insurer organization reference (required). */
  insurer(ref: Resource | string, display?: string): this {
    (this.resource as ExplanationOfBenefitResource).insurer = buildReference(ref, display);
    return this;
  }

  /** Set the provider reference (required). */
  provider(ref: Resource | string, display?: string): this {
    (this.resource as ExplanationOfBenefitResource).provider = buildReference(ref, display);
    return this;
  }

  /** Set the outcome (required). */
  outcome(outcome: EOBOutcome): this {
    (this.resource as ExplanationOfBenefitResource).outcome = outcome;
    return this;
  }

  /** Set the created date (required, defaults to now). */
  created(dateTime: string): this {
    (this.resource as ExplanationOfBenefitResource).created = dateTime;
    return this;
  }

  // --- Insurance ---

  /** Add an insurance entry (at least one required). */
  insurance(coverageRef: Resource | string, focal: boolean = true): this {
    (this.resource as ExplanationOfBenefitResource).insurance.push({
      coverage: buildReference(coverageRef),
      focal,
    });
    return this;
  }

  // --- Billable Period ---

  /** Set the billable period. */
  billablePeriod(start: string, end?: string): this {
    this.resource.billablePeriod = buildPeriod(start, end);
    return this;
  }

  // --- Items ---

  /**
   * Add a claim line item.
   *
   * ```typescript
   * .item({
   *   sequence: 1,
   *   productOrService: { code: '99213', system: CodeSystems.CPT, display: 'Office visit' },
   *   servicedDate: '2024-01-15',
   *   quantity: { value: 1 },
   *   unitPrice: { value: 150.00, currency: 'USD' },
   *   net: { value: 150.00, currency: 'USD' },
   * })
   * ```
   */
  item(input: {
    sequence: number;
    productOrService: { code: string; system: string; display?: string };
    servicedDate?: string;
    servicedPeriod?: { start: string; end?: string };
    quantity?: { value: number; unit?: string };
    unitPrice?: { value: number; currency?: string };
    net?: { value: number; currency?: string };
    adjudication?: {
      category: string;
      amount?: { value: number; currency?: string };
      value?: number;
      reason?: { code: string; system: string; display?: string };
    }[];
    diagnosisSequence?: number[];
    procedureSequence?: number[];
    careTeamSequence?: number[];
  }): this {
    if (!this.resource.item) this.resource.item = [];
    const item: EOBItem = {
      sequence: input.sequence,
      productOrService: buildCodeableConcept(
        input.productOrService.code,
        input.productOrService.system,
        input.productOrService.display
      ),
    };
    if (input.servicedDate) item.servicedDate = input.servicedDate;
    if (input.servicedPeriod) {
      item.servicedPeriod = buildPeriod(input.servicedPeriod.start, input.servicedPeriod.end);
    }
    if (input.quantity) item.quantity = input.quantity;
    if (input.unitPrice) {
      item.unitPrice = {
        value: input.unitPrice.value,
        currency: input.unitPrice.currency ?? "USD",
      };
    }
    if (input.net) {
      item.net = {
        value: input.net.value,
        currency: input.net.currency ?? "USD",
      };
    }
    if (input.adjudication) {
      item.adjudication = input.adjudication.map((a) => {
        const adj: EOBItemAdjudication = {
          category: buildCodeableConcept(a.category, ADJUDICATION_SYSTEM),
        };
        if (a.amount) {
          adj.amount = { value: a.amount.value, currency: a.amount.currency ?? "USD" };
        }
        if (a.value !== undefined) adj.value = a.value;
        if (a.reason) {
          adj.reason = buildCodeableConcept(a.reason.code, a.reason.system, a.reason.display);
        }
        return adj;
      });
    }
    if (input.diagnosisSequence) item.diagnosisSequence = input.diagnosisSequence;
    if (input.procedureSequence) item.procedureSequence = input.procedureSequence;
    if (input.careTeamSequence) item.careTeamSequence = input.careTeamSequence;
    this.resource.item.push(item);
    return this;
  }

  // --- Total ---

  /**
   * Add a total amount.
   *
   * Common categories: 'submitted', 'benefit', 'deductible', 'copay', 'noncovered', 'eligible'.
   */
  total(category: string, amount: number, currency: string = "USD"): this {
    if (!this.resource.total) this.resource.total = [];
    this.resource.total.push({
      category: buildCodeableConcept(category, ADJUDICATION_SYSTEM),
      amount: { value: amount, currency },
    });
    return this;
  }

  // --- Payment ---

  /** Set payment details. */
  payment(input: {
    type?: { code: string; system?: string; display?: string };
    date?: string;
    amount?: { value: number; currency?: string };
  }): this {
    const p: EOBPayment = {};
    if (input.type) {
      p.type = buildCodeableConcept(
        input.type.code,
        input.type.system ?? "http://terminology.hl7.org/CodeSystem/ex-paymenttype",
        input.type.display
      );
    }
    if (input.date) p.date = input.date;
    if (input.amount) {
      p.amount = { value: input.amount.value, currency: input.amount.currency ?? "USD" };
    }
    this.resource.payment = p;
    return this;
  }

  // --- Care Team ---

  /** Add a care team member. */
  careTeam(
    sequence: number,
    provider: Resource | string,
    role?: string,
    qualification?: string
  ): this {
    if (!this.resource.careTeam) this.resource.careTeam = [];
    const ct: EOBCareTeam = {
      sequence,
      provider: buildReference(provider),
    };
    if (role) {
      ct.role = buildCodeableConcept(
        role,
        "http://terminology.hl7.org/CodeSystem/claimcareteamrole"
      );
    }
    if (qualification) {
      ct.qualification = buildCodeableConcept(
        qualification,
        "http://terminology.hl7.org/CodeSystem/provider-qualification"
      );
    }
    this.resource.careTeam.push(ct);
    return this;
  }

  // --- Diagnosis ---

  /** Add a diagnosis. */
  diagnosis(
    sequence: number,
    code: string,
    system: string,
    display?: string,
    type?: string
  ): this {
    if (!this.resource.diagnosis) this.resource.diagnosis = [];
    const d: EOBDiagnosis = {
      sequence,
      diagnosisCodeableConcept: buildCodeableConcept(code, system, display),
    };
    if (type) {
      d.type = [
        buildCodeableConcept(
          type,
          "http://terminology.hl7.org/CodeSystem/ex-diagnosistype"
        ),
      ];
    }
    this.resource.diagnosis.push(d);
    return this;
  }

  // --- Procedure ---

  /** Add a procedure. */
  procedure(
    sequence: number,
    code: string,
    system: string,
    display?: string,
    date?: string
  ): this {
    if (!this.resource.procedure) this.resource.procedure = [];
    const p: EOBProcedure = {
      sequence,
      procedureCodeableConcept: buildCodeableConcept(code, system, display),
    };
    if (date) p.date = date;
    this.resource.procedure.push(p);
    return this;
  }

  // --- Supporting Info ---

  /** Add supporting information. */
  supportingInfo(
    sequence: number,
    categoryCode: string,
    code?: { code: string; system: string; display?: string },
    value?: string | boolean
  ): this {
    if (!this.resource.supportingInfo) this.resource.supportingInfo = [];
    const si: EOBSupportingInfo = {
      sequence,
      category: buildCodeableConcept(
        categoryCode,
        "http://terminology.hl7.org/CodeSystem/claiminformationcategory"
      ),
    };
    if (code) {
      si.code = buildCodeableConcept(code.code, code.system, code.display);
    }
    if (typeof value === "string") si.valueString = value;
    if (typeof value === "boolean") si.valueBoolean = value;
    this.resource.supportingInfo.push(si);
    return this;
  }

  // --- Additional ---

  /** Set priority. */
  priority(code: string): this {
    this.resource.priority = buildCodeableConcept(
      code,
      "http://terminology.hl7.org/CodeSystem/processpriority"
    );
    return this;
  }

  /** Set facility reference. */
  facility(ref: Resource | string, display?: string): this {
    this.resource.facility = buildReference(ref, display);
    return this;
  }

  /** Set prescription reference. */
  prescription(ref: Resource | string): this {
    this.resource.prescription = buildReference(ref);
    return this;
  }

  /** Set claim reference. */
  claim(ref: Resource | string): this {
    this.resource.claim = buildReference(ref);
    return this;
  }

  /** Set claim response reference. */
  claimResponse(ref: Resource | string): this {
    this.resource.claimResponse = buildReference(ref);
    return this;
  }
}
