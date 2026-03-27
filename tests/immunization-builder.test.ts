// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  ImmunizationBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("ImmunizationBuilder", () => {
  it("should create an Immunization resource with defaults", () => {
    const imm = new ImmunizationBuilder().build();
    expect(imm.resourceType).toBe("Immunization");
    expect(imm.status).toBe("completed");
    expect(imm.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.immunization()", () => {
    const fb = new FHIRBuilder();
    expect(fb.immunization()).toBeInstanceOf(ImmunizationBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const imm = new ImmunizationBuilder().status("not-done").build();
    expect(imm.status).toBe("not-done");
  });

  it("should set vaccine code", () => {
    const imm = new ImmunizationBuilder()
      .vaccineCode("207", CodeSystems.CVX, "COVID-19 mRNA")
      .build();
    expect(imm.vaccineCode.coding?.[0]?.code).toBe("207");
    expect(imm.vaccineCode.coding?.[0]?.system).toBe(CodeSystems.CVX);
  });

  it("should set vaccine via cvxCode shorthand", () => {
    const imm = new ImmunizationBuilder()
      .cvxCode("207", "COVID-19 mRNA")
      .build();
    expect(imm.vaccineCode.coding?.[0]?.code).toBe("207");
    expect(imm.vaccineCode.coding?.[0]?.system).toBe(CodeSystems.CVX);
  });

  it("should add additional coding (enrichment pattern)", () => {
    const imm = new ImmunizationBuilder()
      .cvxCode("207")
      .addCoding({ system: CodeSystems.MVX, code: "MOD", display: "Moderna" })
      .build();
    expect(imm.vaccineCode.coding).toHaveLength(2);
    expect(imm.vaccineCode.coding?.[1]?.system).toBe(CodeSystems.MVX);
  });

  it("should set patient", () => {
    const imm = new ImmunizationBuilder().patient("Patient/123").build();
    expect(imm.patient.reference).toBe("Patient/123");
  });

  // --- Occurrence ---

  it("should set occurrenceDateTime", () => {
    const imm = new ImmunizationBuilder()
      .occurrenceDateTime("2024-01-15")
      .build();
    expect(imm.occurrenceDateTime).toBe("2024-01-15");
  });

  it("should set occurrenceString", () => {
    const imm = new ImmunizationBuilder()
      .occurrenceString("Spring 2023")
      .build();
    expect(imm.occurrenceString).toBe("Spring 2023");
  });

  // --- Context ---

  it("should set encounter", () => {
    const imm = new ImmunizationBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(imm.encounter?.reference).toBe("Encounter/enc-1");
  });

  it("should set recorded date", () => {
    const imm = new ImmunizationBuilder().recorded("2024-01-15").build();
    expect(imm.recorded).toBe("2024-01-15");
  });

  it("should set primarySource", () => {
    const imm = new ImmunizationBuilder().primarySource(true).build();
    expect(imm.primarySource).toBe(true);
  });

  it("should set reportOrigin", () => {
    const imm = new ImmunizationBuilder()
      .reportOrigin("recall", undefined, "Parent/Guardian Recall")
      .build();
    expect(imm.reportOrigin?.coding?.[0]?.code).toBe("recall");
  });

  // --- Administration Details ---

  it("should set location", () => {
    const imm = new ImmunizationBuilder()
      .location("Location/clinic-1")
      .build();
    expect(imm.location?.reference).toBe("Location/clinic-1");
  });

  it("should set manufacturer", () => {
    const imm = new ImmunizationBuilder()
      .manufacturer("Organization/moderna", "Moderna Inc.")
      .build();
    expect(imm.manufacturer?.reference).toBe("Organization/moderna");
  });

  it("should set lotNumber", () => {
    const imm = new ImmunizationBuilder().lotNumber("ABCD1234").build();
    expect(imm.lotNumber).toBe("ABCD1234");
  });

  it("should set expirationDate", () => {
    const imm = new ImmunizationBuilder()
      .expirationDate("2025-06-30")
      .build();
    expect(imm.expirationDate).toBe("2025-06-30");
  });

  it("should set site", () => {
    const imm = new ImmunizationBuilder()
      .site("368208006", undefined, "Left upper arm")
      .build();
    expect(imm.site?.coding?.[0]?.code).toBe("368208006");
    expect(imm.site?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  it("should set route", () => {
    const imm = new ImmunizationBuilder()
      .route("78421000", undefined, "Intramuscular")
      .build();
    expect(imm.route?.coding?.[0]?.code).toBe("78421000");
  });

  it("should set doseQuantity", () => {
    const imm = new ImmunizationBuilder().doseQuantity(0.5, "mL").build();
    expect(imm.doseQuantity?.value).toBe(0.5);
    expect(imm.doseQuantity?.unit).toBe("mL");
  });

  // --- Performer ---

  it("should add performer", () => {
    const imm = new ImmunizationBuilder()
      .performer("Practitioner/nurse-1", "AP", undefined, "Administering Provider")
      .build();
    expect(imm.performer).toHaveLength(1);
    expect(imm.performer?.[0]?.actor.reference).toBe("Practitioner/nurse-1");
    expect(imm.performer?.[0]?.function?.coding?.[0]?.code).toBe("AP");
  });

  it("should add performer without function", () => {
    const imm = new ImmunizationBuilder()
      .performer("Practitioner/nurse-1")
      .build();
    expect(imm.performer?.[0]?.function).toBeUndefined();
  });

  // --- Reason, Notes, Subpotent ---

  it("should add reason codes", () => {
    const imm = new ImmunizationBuilder()
      .reasonCode("429060002", CodeSystems.SNOMED, "Procedure to meet occupational requirement")
      .build();
    expect(imm.reasonCode?.[0]?.coding?.[0]?.code).toBe("429060002");
  });

  it("should add notes", () => {
    const imm = new ImmunizationBuilder()
      .note("No adverse reaction observed")
      .build();
    expect(imm.note?.[0]?.text).toBe("No adverse reaction observed");
  });

  it("should set isSubpotent", () => {
    const imm = new ImmunizationBuilder().isSubpotent(false).build();
    expect(imm.isSubpotent).toBe(false);
  });

  it("should set statusReason", () => {
    const imm = new ImmunizationBuilder()
      .status("not-done")
      .statusReason("MEDPREC", undefined, "Medical precaution")
      .build();
    expect(imm.statusReason?.coding?.[0]?.code).toBe("MEDPREC");
  });

  // --- Protocol Applied ---

  it("should add protocol applied with dose number", () => {
    const imm = new ImmunizationBuilder()
      .protocolApplied({
        series: "COVID-19 Primary Series",
        doseNumber: 2,
        seriesDoses: 2,
        targetDisease: [
          { code: "840539006", system: CodeSystems.SNOMED, display: "COVID-19" },
        ],
      })
      .build();
    expect(imm.protocolApplied).toHaveLength(1);
    expect(imm.protocolApplied?.[0]?.series).toBe("COVID-19 Primary Series");
    expect(imm.protocolApplied?.[0]?.doseNumberPositiveInt).toBe(2);
    expect(imm.protocolApplied?.[0]?.seriesDosesPositiveInt).toBe(2);
    expect(imm.protocolApplied?.[0]?.targetDisease?.[0]?.coding?.[0]?.code).toBe("840539006");
  });

  it("should support string dose numbers", () => {
    const imm = new ImmunizationBuilder()
      .protocolApplied({ doseNumber: "Booster" })
      .build();
    expect(imm.protocolApplied?.[0]?.doseNumberString).toBe("Booster");
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const imm = new ImmunizationBuilder()
      .id("imm-001")
      .status("completed")
      .cvxCode("207", "COVID-19 mRNA, LNP-S")
      .patient("Patient/123")
      .occurrenceDateTime("2024-01-15")
      .primarySource(true)
      .manufacturer("Organization/moderna")
      .lotNumber("ABCD1234")
      .site("368208006", undefined, "Left upper arm")
      .route("78421000", undefined, "Intramuscular")
      .doseQuantity(0.5, "mL")
      .performer("Practitioner/nurse-1", "AP")
      .protocolApplied({ doseNumber: 1, seriesDoses: 2 })
      .build();

    expect(imm.id).toBe("imm-001");
    expect(imm.vaccineCode.coding?.[0]?.code).toBe("207");
    expect(imm.patient.reference).toBe("Patient/123");
    expect(imm.performer).toHaveLength(1);
    expect(imm.protocolApplied).toHaveLength(1);
  });

  it("toJSON should produce valid JSON", () => {
    const json = new ImmunizationBuilder()
      .cvxCode("207")
      .patient("Patient/123")
      .occurrenceDateTime("2024-01-15")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Immunization");
  });
});
