// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Coverage resources.
 *
 * ```typescript
 * const coverage = new CoverageBuilder()
 *   .status('active')
 *   .beneficiary('Patient/123')
 *   .payor('Organization/ins-co')
 *   .subscriberId('SUB-456')
 *   .period('2024-01-01', '2024-12-31')
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
  Period,
  Reference,
  Resource,
  Identifier,
} from "./types.js";

// ---------------------------------------------------------------------------
// Coverage Resource Type
// ---------------------------------------------------------------------------

export type CoverageStatus = "active" | "cancelled" | "draft" | "entered-in-error";

export interface CoverageClass {
  type: CodeableConcept;
  value: string;
  name?: string;
}

export interface CoverageResource extends Resource {
  resourceType: "Coverage";
  status: CoverageStatus;
  beneficiary: Reference;
  payor: Reference[];
  type?: CodeableConcept;
  policyHolder?: Reference;
  subscriber?: Reference;
  subscriberId?: string;
  dependent?: string;
  relationship?: CodeableConcept;
  period?: Period;
  class?: CoverageClass[];
  network?: string;
  order?: number;
  identifier?: Identifier[];
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class CoverageBuilder extends ResourceBuilder<CoverageResource> {
  constructor() {
    super("Coverage");
    // status, beneficiary, and payor are required — set defaults
    (this.resource as CoverageResource).status = "active";
    (this.resource as CoverageResource).beneficiary = { reference: "" };
    (this.resource as CoverageResource).payor = [];
  }

  // --- Required Fields ---

  /** Set coverage status (required). */
  status(status: CoverageStatus): this {
    (this.resource as CoverageResource).status = status;
    return this;
  }

  /** Set the beneficiary patient reference (required). */
  beneficiary(ref: Resource | string, display?: string): this {
    (this.resource as CoverageResource).beneficiary = buildReference(
      ref,
      display
    );
    return this;
  }

  /** Add a payor (insurer) reference (at least one required). */
  payor(ref: Resource | string, display?: string): this {
    (this.resource as CoverageResource).payor.push(
      buildReference(ref, display)
    );
    return this;
  }

  // --- Common Fields ---

  /**
   * Set coverage type. Defaults to ActCode system.
   *
   * Common codes: 'EHCPOL' (extended healthcare), 'PUBLICPOL' (public policy),
   * 'DENTPRG' (dental program), 'MENTPRG' (mental health program).
   */
  type(code: string, system?: string, display?: string): this {
    this.resource.type = buildCodeableConcept(
      code,
      system ?? CodeSystems.ACT_CODE,
      display
    );
    return this;
  }

  /** Set policy holder reference. */
  policyHolder(ref: Resource | string, display?: string): this {
    this.resource.policyHolder = buildReference(ref, display);
    return this;
  }

  /** Set subscriber reference. */
  subscriber(ref: Resource | string, display?: string): this {
    this.resource.subscriber = buildReference(ref, display);
    return this;
  }

  /** Set subscriber ID. */
  subscriberId(value: string): this {
    this.resource.subscriberId = value;
    return this;
  }

  /** Set dependent number. */
  dependent(value: string): this {
    this.resource.dependent = value;
    return this;
  }

  /**
   * Set relationship of beneficiary to subscriber.
   *
   * Common codes: 'self', 'spouse', 'child', 'other'.
   */
  relationship(
    code: string,
    system?: string,
    display?: string
  ): this {
    this.resource.relationship = buildCodeableConcept(
      code,
      system ?? "http://terminology.hl7.org/CodeSystem/subscriber-relationship",
      display
    );
    return this;
  }

  /** Set coverage period. */
  period(start?: string, end?: string): this {
    this.resource.period = buildPeriod(start, end);
    return this;
  }

  /**
   * Add a coverage class (group, plan, subplan, class, subclass).
   *
   * ```typescript
   * .classInfo('group', 'GRP-123', 'Employee Group')
   * .classInfo('plan', 'PLN-456', 'Gold Plan')
   * ```
   */
  classInfo(
    type: string,
    value: string,
    name?: string
  ): this {
    if (!this.resource.class) this.resource.class = [];
    const cls: CoverageClass = {
      type: buildCodeableConcept(
        type,
        "http://terminology.hl7.org/CodeSystem/coverage-class"
      ),
      value,
    };
    if (name) cls.name = name;
    this.resource.class.push(cls);
    return this;
  }

  /** Set network name. */
  network(value: string): this {
    this.resource.network = value;
    return this;
  }

  /** Set coverage order (for coordination of benefits). */
  order(order: number): this {
    this.resource.order = order;
    return this;
  }
}
