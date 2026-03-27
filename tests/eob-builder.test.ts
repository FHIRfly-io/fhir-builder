// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  ExplanationOfBenefitBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("ExplanationOfBenefitBuilder", () => {
  it("should create an EOB resource with defaults", () => {
    const eob = new ExplanationOfBenefitBuilder().build();
    expect(eob.resourceType).toBe("ExplanationOfBenefit");
    expect(eob.status).toBe("active");
    expect(eob.use).toBe("claim");
    expect(eob.outcome).toBe("complete");
    expect(eob.created).toBeDefined();
    expect(eob.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.explanationOfBenefit()", () => {
    const fb = new FHIRBuilder();
    expect(fb.explanationOfBenefit()).toBeInstanceOf(ExplanationOfBenefitBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const eob = new ExplanationOfBenefitBuilder().status("cancelled").build();
    expect(eob.status).toBe("cancelled");
  });

  it("should set type", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .type("professional", undefined, "Professional")
      .build();
    expect(eob.type.coding?.[0]?.code).toBe("professional");
  });

  it("should set use", () => {
    const eob = new ExplanationOfBenefitBuilder().use("preauthorization").build();
    expect(eob.use).toBe("preauthorization");
  });

  it("should set patient", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .patient("Patient/123")
      .build();
    expect(eob.patient.reference).toBe("Patient/123");
  });

  it("should set insurer", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .insurer("Organization/ins-co", "Acme Insurance")
      .build();
    expect(eob.insurer.reference).toBe("Organization/ins-co");
    expect(eob.insurer.display).toBe("Acme Insurance");
  });

  it("should set provider", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .provider("Organization/hosp-1")
      .build();
    expect(eob.provider.reference).toBe("Organization/hosp-1");
  });

  it("should set outcome", () => {
    const eob = new ExplanationOfBenefitBuilder().outcome("error").build();
    expect(eob.outcome).toBe("error");
  });

  it("should set created date", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .created("2024-01-20T00:00:00Z")
      .build();
    expect(eob.created).toBe("2024-01-20T00:00:00Z");
  });

  // --- Insurance ---

  it("should add insurance entries", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .insurance("Coverage/cov-1", true)
      .build();
    expect(eob.insurance).toHaveLength(1);
    expect(eob.insurance[0]?.coverage.reference).toBe("Coverage/cov-1");
    expect(eob.insurance[0]?.focal).toBe(true);
  });

  it("should add multiple insurance entries", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .insurance("Coverage/primary", true)
      .insurance("Coverage/secondary", false)
      .build();
    expect(eob.insurance).toHaveLength(2);
    expect(eob.insurance[1]?.focal).toBe(false);
  });

  // --- Billable Period ---

  it("should set billable period", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .billablePeriod("2024-01-01", "2024-01-31")
      .build();
    expect(eob.billablePeriod?.start).toBe("2024-01-01");
    expect(eob.billablePeriod?.end).toBe("2024-01-31");
  });

  // --- Items ---

  it("should add a claim line item", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .item({
        sequence: 1,
        productOrService: { code: "99213", system: CodeSystems.CPT, display: "Office visit" },
        servicedDate: "2024-01-15",
        quantity: { value: 1 },
        unitPrice: { value: 150.0 },
        net: { value: 150.0 },
      })
      .build();
    expect(eob.item).toHaveLength(1);
    expect(eob.item?.[0]?.sequence).toBe(1);
    expect(eob.item?.[0]?.productOrService.coding?.[0]?.code).toBe("99213");
    expect(eob.item?.[0]?.servicedDate).toBe("2024-01-15");
    expect(eob.item?.[0]?.unitPrice?.value).toBe(150.0);
    expect(eob.item?.[0]?.unitPrice?.currency).toBe("USD");
    expect(eob.item?.[0]?.net?.value).toBe(150.0);
  });

  it("should add item with adjudication", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .item({
        sequence: 1,
        productOrService: { code: "99213", system: CodeSystems.CPT },
        adjudication: [
          { category: "submitted", amount: { value: 150.0 } },
          { category: "benefit", amount: { value: 120.0 } },
          { category: "copay", amount: { value: 30.0 } },
        ],
      })
      .build();
    expect(eob.item?.[0]?.adjudication).toHaveLength(3);
    expect(eob.item?.[0]?.adjudication?.[0]?.category.coding?.[0]?.code).toBe("submitted");
    expect(eob.item?.[0]?.adjudication?.[0]?.amount?.value).toBe(150.0);
    expect(eob.item?.[0]?.adjudication?.[1]?.amount?.value).toBe(120.0);
  });

  it("should add item with sequence references", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .item({
        sequence: 1,
        productOrService: { code: "99213", system: CodeSystems.CPT },
        diagnosisSequence: [1],
        procedureSequence: [1],
        careTeamSequence: [1, 2],
      })
      .build();
    expect(eob.item?.[0]?.diagnosisSequence).toEqual([1]);
    expect(eob.item?.[0]?.careTeamSequence).toEqual([1, 2]);
  });

  it("should add multiple items", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .item({
        sequence: 1,
        productOrService: { code: "99213", system: CodeSystems.CPT },
      })
      .item({
        sequence: 2,
        productOrService: { code: "85025", system: CodeSystems.CPT },
      })
      .build();
    expect(eob.item).toHaveLength(2);
  });

  // --- Totals ---

  it("should add totals", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .total("submitted", 150.0)
      .total("benefit", 120.0)
      .total("copay", 30.0)
      .build();
    expect(eob.total).toHaveLength(3);
    expect(eob.total?.[0]?.category.coding?.[0]?.code).toBe("submitted");
    expect(eob.total?.[0]?.amount.value).toBe(150.0);
    expect(eob.total?.[0]?.amount.currency).toBe("USD");
  });

  // --- Payment ---

  it("should set payment", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .payment({
        type: { code: "complete" },
        date: "2024-02-01",
        amount: { value: 120.0 },
      })
      .build();
    expect(eob.payment?.type?.coding?.[0]?.code).toBe("complete");
    expect(eob.payment?.date).toBe("2024-02-01");
    expect(eob.payment?.amount?.value).toBe(120.0);
  });

  // --- Care Team ---

  it("should add care team members", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .careTeam(1, "Practitioner/dr-smith", "primary")
      .careTeam(2, "Practitioner/dr-jones", "assist")
      .build();
    expect(eob.careTeam).toHaveLength(2);
    expect(eob.careTeam?.[0]?.sequence).toBe(1);
    expect(eob.careTeam?.[0]?.provider.reference).toBe("Practitioner/dr-smith");
    expect(eob.careTeam?.[0]?.role?.coding?.[0]?.code).toBe("primary");
  });

  // --- Diagnosis ---

  it("should add diagnoses", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .diagnosis(1, "E11.9", CodeSystems.ICD10CM, "Type 2 diabetes", "principal")
      .build();
    expect(eob.diagnosis).toHaveLength(1);
    expect(eob.diagnosis?.[0]?.sequence).toBe(1);
    expect(eob.diagnosis?.[0]?.diagnosisCodeableConcept?.coding?.[0]?.code).toBe("E11.9");
    expect(eob.diagnosis?.[0]?.type?.[0]?.coding?.[0]?.code).toBe("principal");
  });

  // --- Procedure ---

  it("should add procedures", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .procedure(1, "27447", CodeSystems.CPT, "TKR", "2024-01-15")
      .build();
    expect(eob.procedure).toHaveLength(1);
    expect(eob.procedure?.[0]?.sequence).toBe(1);
    expect(eob.procedure?.[0]?.procedureCodeableConcept?.coding?.[0]?.code).toBe("27447");
    expect(eob.procedure?.[0]?.date).toBe("2024-01-15");
  });

  // --- Supporting Info ---

  it("should add supporting info", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .supportingInfo(1, "clmrecvddate", undefined, "2024-01-20")
      .build();
    expect(eob.supportingInfo).toHaveLength(1);
    expect(eob.supportingInfo?.[0]?.sequence).toBe(1);
    expect(eob.supportingInfo?.[0]?.valueString).toBe("2024-01-20");
  });

  // --- Additional ---

  it("should set priority", () => {
    const eob = new ExplanationOfBenefitBuilder().priority("normal").build();
    expect(eob.priority?.coding?.[0]?.code).toBe("normal");
  });

  it("should set facility", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .facility("Location/hosp-1")
      .build();
    expect(eob.facility?.reference).toBe("Location/hosp-1");
  });

  it("should set claim reference", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .claim("Claim/claim-1")
      .build();
    expect(eob.claim?.reference).toBe("Claim/claim-1");
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const eob = new ExplanationOfBenefitBuilder()
      .id("eob-001")
      .status("active")
      .type("institutional")
      .use("claim")
      .patient("Patient/123")
      .created("2024-01-20T00:00:00Z")
      .insurer("Organization/ins-co")
      .provider("Organization/hosp-1")
      .outcome("complete")
      .insurance("Coverage/cov-1", true)
      .billablePeriod("2024-01-15", "2024-01-15")
      .careTeam(1, "Practitioner/dr-smith", "primary")
      .diagnosis(1, "E11.9", CodeSystems.ICD10CM, "Type 2 diabetes")
      .item({
        sequence: 1,
        productOrService: { code: "99213", system: CodeSystems.CPT },
        servicedDate: "2024-01-15",
        net: { value: 150.0 },
        adjudication: [
          { category: "submitted", amount: { value: 150.0 } },
          { category: "benefit", amount: { value: 120.0 } },
        ],
      })
      .total("submitted", 150.0)
      .total("benefit", 120.0)
      .payment({ amount: { value: 120.0 }, date: "2024-02-01" })
      .build();

    expect(eob.id).toBe("eob-001");
    expect(eob.status).toBe("active");
    expect(eob.type.coding?.[0]?.code).toBe("institutional");
    expect(eob.patient.reference).toBe("Patient/123");
    expect(eob.insurance).toHaveLength(1);
    expect(eob.item).toHaveLength(1);
    expect(eob.total).toHaveLength(2);
    expect(eob.careTeam).toHaveLength(1);
    expect(eob.diagnosis).toHaveLength(1);
    expect(eob.payment?.amount?.value).toBe(120.0);
  });

  it("toJSON should produce valid JSON", () => {
    const json = new ExplanationOfBenefitBuilder()
      .patient("Patient/123")
      .insurer("Organization/ins-co")
      .provider("Organization/hosp-1")
      .insurance("Coverage/cov-1")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("ExplanationOfBenefit");
    expect(parsed.insurance).toHaveLength(1);
  });
});
