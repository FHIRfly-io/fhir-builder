// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  MedicationRequestBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("MedicationRequestBuilder", () => {
  it("should create a MedicationRequest resource with defaults", () => {
    const rx = new MedicationRequestBuilder().build();
    expect(rx.resourceType).toBe("MedicationRequest");
    expect(rx.status).toBe("active");
    expect(rx.intent).toBe("order");
    expect(rx.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.medicationRequest()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.medicationRequest();
    expect(builder).toBeInstanceOf(MedicationRequestBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const rx = new MedicationRequestBuilder().status("draft").build();
    expect(rx.status).toBe("draft");
  });

  it("should set intent", () => {
    const rx = new MedicationRequestBuilder().intent("plan").build();
    expect(rx.intent).toBe("plan");
  });

  it("should set subject", () => {
    const rx = new MedicationRequestBuilder()
      .subject("Patient/123")
      .build();
    expect(rx.subject.reference).toBe("Patient/123");
  });

  // --- Medication ---

  it("should set medication by NDC", () => {
    const rx = new MedicationRequestBuilder()
      .medicationByNDC("0069-0151-01", "Atorvastatin 10mg")
      .build();
    expect(rx.medicationCodeableConcept?.coding?.[0]?.system).toBe(CodeSystems.NDC);
  });

  it("should set medication by RxNorm", () => {
    const rx = new MedicationRequestBuilder()
      .medicationByRxNorm("83367", "atorvastatin")
      .build();
    expect(rx.medicationCodeableConcept?.coding?.[0]?.system).toBe(CodeSystems.RXNORM);
    expect(rx.medicationCodeableConcept?.coding?.[0]?.code).toBe("83367");
  });

  it("should add additional coding (enrichment pattern)", () => {
    const rx = new MedicationRequestBuilder()
      .medicationByNDC("0069-0151-01")
      .addCoding({ system: CodeSystems.RXNORM, code: "83367" })
      .build();
    expect(rx.medicationCodeableConcept?.coding).toHaveLength(2);
  });

  it("should set medication reference", () => {
    const rx = new MedicationRequestBuilder()
      .medicationReference("Medication/med-1")
      .build();
    expect(rx.medicationReference?.reference).toBe("Medication/med-1");
  });

  // --- Context & Timing ---

  it("should set encounter", () => {
    const rx = new MedicationRequestBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(rx.encounter?.reference).toBe("Encounter/enc-1");
  });

  it("should set authoredOn", () => {
    const rx = new MedicationRequestBuilder()
      .authoredOn("2024-01-15")
      .build();
    expect(rx.authoredOn).toBe("2024-01-15");
  });

  it("should set requester", () => {
    const rx = new MedicationRequestBuilder()
      .requester("Practitioner/dr-smith", "Dr. Smith")
      .build();
    expect(rx.requester?.reference).toBe("Practitioner/dr-smith");
    expect(rx.requester?.display).toBe("Dr. Smith");
  });

  // --- Priority & Category ---

  it("should set priority", () => {
    const rx = new MedicationRequestBuilder().priority("urgent").build();
    expect(rx.priority).toBe("urgent");
  });

  it("should add category", () => {
    const rx = new MedicationRequestBuilder()
      .category("outpatient")
      .build();
    expect(rx.category).toHaveLength(1);
    expect(rx.category?.[0]?.coding?.[0]?.code).toBe("outpatient");
  });

  // --- Reason ---

  it("should add reason codes", () => {
    const rx = new MedicationRequestBuilder()
      .reasonCode("E78.5", CodeSystems.ICD10CM, "Hyperlipidemia")
      .build();
    expect(rx.reasonCode?.[0]?.coding?.[0]?.code).toBe("E78.5");
  });

  it("should add reason references", () => {
    const rx = new MedicationRequestBuilder()
      .reasonReference("Condition/cond-1")
      .build();
    expect(rx.reasonReference?.[0]?.reference).toBe("Condition/cond-1");
  });

  // --- Dosage ---

  it("should add dosage instruction", () => {
    const rx = new MedicationRequestBuilder()
      .dosageInstruction({
        text: "Take 1 tablet daily at bedtime",
        route: { code: "26643006", display: "Oral" },
        doseQuantity: { value: 10, unit: "mg" },
      })
      .build();
    expect(rx.dosageInstruction).toHaveLength(1);
    expect(rx.dosageInstruction?.[0]?.text).toBe("Take 1 tablet daily at bedtime");
    expect(rx.dosageInstruction?.[0]?.route?.coding?.[0]?.code).toBe("26643006");
    expect(rx.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value).toBe(10);
  });

  // --- Dispense Request ---

  it("should set dispense request", () => {
    const rx = new MedicationRequestBuilder()
      .dispenseRequest({
        quantity: { value: 30, unit: "tablets" },
        expectedSupplyDuration: { value: 30, unit: "days" },
        numberOfRepeatsAllowed: 3,
        validityPeriod: { start: "2024-01-01", end: "2025-01-01" },
      })
      .build();
    expect(rx.dispenseRequest?.quantity?.value).toBe(30);
    expect(rx.dispenseRequest?.expectedSupplyDuration?.value).toBe(30);
    expect(rx.dispenseRequest?.numberOfRepeatsAllowed).toBe(3);
    expect(rx.dispenseRequest?.validityPeriod?.start).toBe("2024-01-01");
  });

  it("should set partial dispense request", () => {
    const rx = new MedicationRequestBuilder()
      .dispenseRequest({ quantity: { value: 90, unit: "tablets" } })
      .build();
    expect(rx.dispenseRequest?.quantity?.value).toBe(90);
    expect(rx.dispenseRequest?.numberOfRepeatsAllowed).toBeUndefined();
  });

  // --- Substitution ---

  it("should set substitution allowed", () => {
    const rx = new MedicationRequestBuilder()
      .substitution(true)
      .build();
    expect(rx.substitution?.allowedBoolean).toBe(true);
  });

  it("should set substitution not allowed with reason", () => {
    const rx = new MedicationRequestBuilder()
      .substitution(false, {
        code: "G",
        system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        display: "Generic not available",
      })
      .build();
    expect(rx.substitution?.allowedBoolean).toBe(false);
    expect(rx.substitution?.reason?.coding?.[0]?.code).toBe("G");
  });

  // --- Notes ---

  it("should add notes", () => {
    const rx = new MedicationRequestBuilder()
      .note("Brand name required per patient preference")
      .build();
    expect(rx.note?.[0]?.text).toBe("Brand name required per patient preference");
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const rx = new MedicationRequestBuilder()
      .id("rx-001")
      .status("active")
      .intent("order")
      .medicationByRxNorm("83367", "atorvastatin")
      .subject("Patient/123")
      .encounter("Encounter/enc-1")
      .authoredOn("2024-01-15")
      .requester("Practitioner/dr-smith")
      .priority("routine")
      .reasonCode("E78.5", CodeSystems.ICD10CM, "Hyperlipidemia")
      .dosageInstruction({ text: "Take 1 tablet daily at bedtime" })
      .dispenseRequest({
        quantity: { value: 30, unit: "tablets" },
        numberOfRepeatsAllowed: 3,
      })
      .substitution(true)
      .note("Monitor LFTs in 3 months")
      .build();

    expect(rx.id).toBe("rx-001");
    expect(rx.status).toBe("active");
    expect(rx.intent).toBe("order");
    expect(rx.medicationCodeableConcept?.coding?.[0]?.code).toBe("83367");
    expect(rx.subject.reference).toBe("Patient/123");
    expect(rx.dosageInstruction).toHaveLength(1);
    expect(rx.dispenseRequest?.quantity?.value).toBe(30);
    expect(rx.substitution?.allowedBoolean).toBe(true);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new MedicationRequestBuilder()
      .medicationByRxNorm("83367")
      .subject("Patient/123")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("MedicationRequest");
    expect(parsed.intent).toBe("order");
  });
});
