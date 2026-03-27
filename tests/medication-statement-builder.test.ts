// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  MedicationStatementBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("MedicationStatementBuilder", () => {
  it("should create a MedicationStatement resource with defaults", () => {
    const ms = new MedicationStatementBuilder().build();
    expect(ms.resourceType).toBe("MedicationStatement");
    expect(ms.status).toBe("active");
    expect(ms.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.medicationStatement()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.medicationStatement();
    expect(builder).toBeInstanceOf(MedicationStatementBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const ms = new MedicationStatementBuilder().status("completed").build();
    expect(ms.status).toBe("completed");
  });

  it("should set subject", () => {
    const ms = new MedicationStatementBuilder()
      .subject("Patient/123")
      .build();
    expect(ms.subject.reference).toBe("Patient/123");
  });

  // --- Medication ---

  it("should set medication by code", () => {
    const ms = new MedicationStatementBuilder()
      .medicationCode("83367", CodeSystems.RXNORM, "atorvastatin")
      .build();
    expect(ms.medicationCodeableConcept?.coding?.[0]?.code).toBe("83367");
    expect(ms.medicationCodeableConcept?.coding?.[0]?.system).toBe(CodeSystems.RXNORM);
  });

  it("should set medication by NDC (shorthand)", () => {
    const ms = new MedicationStatementBuilder()
      .medicationByNDC("0069-0151-01", "Atorvastatin 10mg")
      .build();
    expect(ms.medicationCodeableConcept?.coding?.[0]?.code).toBe("0069-0151-01");
    expect(ms.medicationCodeableConcept?.coding?.[0]?.system).toBe(CodeSystems.NDC);
    expect(ms.medicationCodeableConcept?.coding?.[0]?.display).toBe("Atorvastatin 10mg");
  });

  it("should set medication by RxNorm (shorthand)", () => {
    const ms = new MedicationStatementBuilder()
      .medicationByRxNorm("83367", "atorvastatin")
      .build();
    expect(ms.medicationCodeableConcept?.coding?.[0]?.system).toBe(CodeSystems.RXNORM);
  });

  it("should add additional coding (enrichment pattern)", () => {
    const ms = new MedicationStatementBuilder()
      .medicationByNDC("0069-0151-01", "Atorvastatin 10mg")
      .addCoding({ system: CodeSystems.RXNORM, code: "83367", display: "atorvastatin" })
      .build();
    expect(ms.medicationCodeableConcept?.coding).toHaveLength(2);
    expect(ms.medicationCodeableConcept?.coding?.[0]?.system).toBe(CodeSystems.NDC);
    expect(ms.medicationCodeableConcept?.coding?.[1]?.system).toBe(CodeSystems.RXNORM);
    expect(ms.medicationCodeableConcept?.coding?.[1]?.code).toBe("83367");
  });

  it("should add coding even when no medication set yet", () => {
    const ms = new MedicationStatementBuilder()
      .addCoding({ system: CodeSystems.RXNORM, code: "83367" })
      .build();
    expect(ms.medicationCodeableConcept?.coding).toHaveLength(1);
  });

  it("should set medication reference", () => {
    const ms = new MedicationStatementBuilder()
      .medicationReference("Medication/med-1")
      .build();
    expect(ms.medicationReference?.reference).toBe("Medication/med-1");
  });

  // --- Context & Timing ---

  it("should set context", () => {
    const ms = new MedicationStatementBuilder()
      .context("Encounter/enc-1")
      .build();
    expect(ms.context?.reference).toBe("Encounter/enc-1");
  });

  it("should set effectiveDateTime", () => {
    const ms = new MedicationStatementBuilder()
      .effectiveDateTime("2024-01-15")
      .build();
    expect(ms.effectiveDateTime).toBe("2024-01-15");
  });

  it("should set effectivePeriod", () => {
    const ms = new MedicationStatementBuilder()
      .effectivePeriod("2024-01-01", "2024-06-30")
      .build();
    expect(ms.effectivePeriod?.start).toBe("2024-01-01");
    expect(ms.effectivePeriod?.end).toBe("2024-06-30");
  });

  it("should set dateAsserted", () => {
    const ms = new MedicationStatementBuilder()
      .dateAsserted("2024-01-15")
      .build();
    expect(ms.dateAsserted).toBe("2024-01-15");
  });

  it("should set informationSource", () => {
    const ms = new MedicationStatementBuilder()
      .informationSource("Patient/123")
      .build();
    expect(ms.informationSource?.reference).toBe("Patient/123");
  });

  // --- Reason ---

  it("should add reason codes", () => {
    const ms = new MedicationStatementBuilder()
      .reasonCode("E11.9", CodeSystems.ICD10CM, "Type 2 diabetes")
      .build();
    expect(ms.reasonCode).toHaveLength(1);
    expect(ms.reasonCode?.[0]?.coding?.[0]?.code).toBe("E11.9");
  });

  it("should add reason references", () => {
    const ms = new MedicationStatementBuilder()
      .reasonReference("Condition/cond-1")
      .build();
    expect(ms.reasonReference?.[0]?.reference).toBe("Condition/cond-1");
  });

  // --- Notes & Category ---

  it("should add notes", () => {
    const ms = new MedicationStatementBuilder()
      .note("Patient reports taking medication as prescribed")
      .build();
    expect(ms.note?.[0]?.text).toBe("Patient reports taking medication as prescribed");
  });

  it("should set category", () => {
    const ms = new MedicationStatementBuilder()
      .category("inpatient")
      .build();
    expect(ms.category?.coding?.[0]?.code).toBe("inpatient");
  });

  // --- Dosage ---

  it("should add dosage with text", () => {
    const ms = new MedicationStatementBuilder()
      .dosage({ text: "Take 1 tablet daily" })
      .build();
    expect(ms.dosage).toHaveLength(1);
    expect(ms.dosage?.[0]?.text).toBe("Take 1 tablet daily");
  });

  it("should add dosage with route", () => {
    const ms = new MedicationStatementBuilder()
      .dosage({ route: { code: "26643006", display: "Oral" } })
      .build();
    expect(ms.dosage?.[0]?.route?.coding?.[0]?.code).toBe("26643006");
    expect(ms.dosage?.[0]?.route?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  it("should add dosage with dose quantity", () => {
    const ms = new MedicationStatementBuilder()
      .dosage({
        doseQuantity: { value: 10, unit: "mg" },
      })
      .build();
    expect(ms.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.value).toBe(10);
    expect(ms.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit).toBe("mg");
  });

  it("should add dosage with timing", () => {
    const ms = new MedicationStatementBuilder()
      .dosage({
        timing: { frequency: 1, period: 1, periodUnit: "d" },
      })
      .build();
    expect(ms.dosage?.[0]?.timing?.repeat?.frequency).toBe(1);
    expect(ms.dosage?.[0]?.timing?.repeat?.period).toBe(1);
    expect(ms.dosage?.[0]?.timing?.repeat?.periodUnit).toBe("d");
  });

  it("should add dosage with asNeeded", () => {
    const ms = new MedicationStatementBuilder()
      .dosage({ asNeeded: true })
      .build();
    expect(ms.dosage?.[0]?.asNeededBoolean).toBe(true);
  });

  it("should add multiple dosage instructions", () => {
    const ms = new MedicationStatementBuilder()
      .dosage({ text: "Morning dose" })
      .dosage({ text: "Evening dose" })
      .build();
    expect(ms.dosage).toHaveLength(2);
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const ms = new MedicationStatementBuilder()
      .id("ms-001")
      .status("active")
      .medicationByNDC("0069-0151-01", "Atorvastatin 10mg")
      .addCoding({ system: CodeSystems.RXNORM, code: "83367", display: "atorvastatin" })
      .subject("Patient/123")
      .effectivePeriod("2024-01-01")
      .dateAsserted("2024-01-15")
      .reasonCode("E78.5", CodeSystems.ICD10CM, "Hyperlipidemia")
      .dosage({
        text: "Take 1 tablet daily at bedtime",
        route: { code: "26643006", display: "Oral" },
        doseQuantity: { value: 10, unit: "mg" },
      })
      .note("Well tolerated")
      .build();

    expect(ms.id).toBe("ms-001");
    expect(ms.status).toBe("active");
    expect(ms.medicationCodeableConcept?.coding).toHaveLength(2);
    expect(ms.subject.reference).toBe("Patient/123");
    expect(ms.dosage).toHaveLength(1);
    expect(ms.reasonCode).toHaveLength(1);
    expect(ms.note).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new MedicationStatementBuilder()
      .medicationByNDC("0069-0151-01")
      .subject("Patient/123")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("MedicationStatement");
  });
});
