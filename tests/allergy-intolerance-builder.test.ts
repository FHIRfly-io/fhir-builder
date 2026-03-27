// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  AllergyIntoleranceBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("AllergyIntoleranceBuilder", () => {
  it("should create an AllergyIntolerance resource", () => {
    const allergy = new AllergyIntoleranceBuilder().build();
    expect(allergy.resourceType).toBe("AllergyIntolerance");
    expect(allergy.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.allergyIntolerance()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.allergyIntolerance();
    expect(builder).toBeInstanceOf(AllergyIntoleranceBuilder);
  });

  // --- Clinical & Verification Status ---

  it("should set clinicalStatus with correct system", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .clinicalStatus("active")
      .build();
    expect(allergy.clinicalStatus?.coding?.[0]?.code).toBe("active");
    expect(allergy.clinicalStatus?.coding?.[0]?.system).toBe(
      CodeSystems.ALLERGY_CLINICAL
    );
  });

  it("should set verificationStatus with correct system", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .verificationStatus("confirmed")
      .build();
    expect(allergy.verificationStatus?.coding?.[0]?.code).toBe("confirmed");
    expect(allergy.verificationStatus?.coding?.[0]?.system).toBe(
      CodeSystems.ALLERGY_VERIFICATION
    );
  });

  // --- Type, Category, Criticality ---

  it("should set type", () => {
    const allergy = new AllergyIntoleranceBuilder().type("allergy").build();
    expect(allergy.type).toBe("allergy");
  });

  it("should add categories", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .category("medication")
      .category("food")
      .build();
    expect(allergy.category).toEqual(["medication", "food"]);
  });

  it("should set criticality", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .criticality("high")
      .build();
    expect(allergy.criticality).toBe("high");
  });

  // --- Code ---

  it("should set code", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .code("387207008", CodeSystems.SNOMED, "Ibuprofen")
      .build();
    expect(allergy.code?.coding?.[0]?.code).toBe("387207008");
    expect(allergy.code?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  it("should set code via snomedCode shorthand", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .snomedCode("387207008", "Ibuprofen")
      .build();
    expect(allergy.code?.coding?.[0]?.code).toBe("387207008");
    expect(allergy.code?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  it("should set code via rxNormCode shorthand", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .rxNormCode("5640", "Ibuprofen")
      .build();
    expect(allergy.code?.coding?.[0]?.code).toBe("5640");
    expect(allergy.code?.coding?.[0]?.system).toBe(CodeSystems.RXNORM);
  });

  // --- Patient & Context ---

  it("should set patient", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .patient("Patient/123")
      .build();
    expect(allergy.patient.reference).toBe("Patient/123");
  });

  it("should set encounter", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(allergy.encounter?.reference).toBe("Encounter/enc-1");
  });

  // --- Onset ---

  it("should set onsetDateTime", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .onsetDateTime("2020-06-15")
      .build();
    expect(allergy.onsetDateTime).toBe("2020-06-15");
  });

  it("should set onsetAge", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .onsetAge(25, "years")
      .build();
    expect(allergy.onsetAge?.value).toBe(25);
    expect(allergy.onsetAge?.unit).toBe("years");
  });

  it("should set onsetString", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .onsetString("Childhood")
      .build();
    expect(allergy.onsetString).toBe("Childhood");
  });

  // --- Metadata ---

  it("should set recordedDate", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .recordedDate("2024-01-15")
      .build();
    expect(allergy.recordedDate).toBe("2024-01-15");
  });

  it("should set recorder", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .recorder("Practitioner/dr-smith")
      .build();
    expect(allergy.recorder?.reference).toBe("Practitioner/dr-smith");
  });

  it("should set asserter", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .asserter("Patient/123", "Jane Doe")
      .build();
    expect(allergy.asserter?.reference).toBe("Patient/123");
    expect(allergy.asserter?.display).toBe("Jane Doe");
  });

  it("should set lastOccurrence", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .lastOccurrence("2023-12-01")
      .build();
    expect(allergy.lastOccurrence).toBe("2023-12-01");
  });

  // --- Notes ---

  it("should add notes", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .note("Patient carries EpiPen")
      .note("Confirmed by allergist")
      .build();
    expect(allergy.note).toHaveLength(2);
    expect(allergy.note?.[0]?.text).toBe("Patient carries EpiPen");
  });

  // --- Reactions ---

  it("should add a reaction with manifestation", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .reaction({
        manifestation: [
          { code: "271807003", system: CodeSystems.SNOMED, display: "Eruption of skin" },
        ],
        severity: "moderate",
      })
      .build();
    expect(allergy.reaction).toHaveLength(1);
    expect(allergy.reaction?.[0]?.manifestation).toHaveLength(1);
    expect(allergy.reaction?.[0]?.manifestation[0]?.coding?.[0]?.code).toBe("271807003");
    expect(allergy.reaction?.[0]?.severity).toBe("moderate");
  });

  it("should add a reaction with substance", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .reaction({
        manifestation: [
          { code: "39579001", system: CodeSystems.SNOMED, display: "Anaphylaxis" },
        ],
        substance: {
          code: "387207008",
          system: CodeSystems.SNOMED,
          display: "Ibuprofen",
        },
        severity: "severe",
      })
      .build();
    expect(allergy.reaction?.[0]?.substance?.coding?.[0]?.code).toBe("387207008");
    expect(allergy.reaction?.[0]?.severity).toBe("severe");
  });

  it("should add a reaction with onset and note", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .reaction({
        manifestation: [
          { code: "271807003", system: CodeSystems.SNOMED, display: "Rash" },
        ],
        onset: "2023-06-15",
        note: "Occurred 30 minutes after ingestion",
      })
      .build();
    expect(allergy.reaction?.[0]?.onset).toBe("2023-06-15");
    expect(allergy.reaction?.[0]?.note?.[0]?.text).toBe(
      "Occurred 30 minutes after ingestion"
    );
  });

  it("should add multiple reactions", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .reaction({
        manifestation: [
          { code: "271807003", system: CodeSystems.SNOMED, display: "Rash" },
        ],
        severity: "mild",
      })
      .reaction({
        manifestation: [
          { code: "39579001", system: CodeSystems.SNOMED, display: "Anaphylaxis" },
        ],
        severity: "severe",
      })
      .build();
    expect(allergy.reaction).toHaveLength(2);
  });

  it("should add reaction with multiple manifestations", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .reaction({
        manifestation: [
          { code: "271807003", system: CodeSystems.SNOMED, display: "Rash" },
          { code: "267036007", system: CodeSystems.SNOMED, display: "Dyspnea" },
          { code: "247472004", system: CodeSystems.SNOMED, display: "Hives" },
        ],
      })
      .build();
    expect(allergy.reaction?.[0]?.manifestation).toHaveLength(3);
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const allergy = new AllergyIntoleranceBuilder()
      .id("allergy-001")
      .clinicalStatus("active")
      .verificationStatus("confirmed")
      .type("allergy")
      .category("medication")
      .criticality("high")
      .snomedCode("387207008", "Ibuprofen")
      .patient("Patient/123")
      .onsetDateTime("2020-06-15")
      .recordedDate("2024-01-15")
      .recorder("Practitioner/dr-smith")
      .lastOccurrence("2023-12-01")
      .note("Confirmed by allergist")
      .reaction({
        manifestation: [
          { code: "39579001", system: CodeSystems.SNOMED, display: "Anaphylaxis" },
        ],
        severity: "severe",
      })
      .build();

    expect(allergy.id).toBe("allergy-001");
    expect(allergy.clinicalStatus?.coding?.[0]?.code).toBe("active");
    expect(allergy.verificationStatus?.coding?.[0]?.code).toBe("confirmed");
    expect(allergy.type).toBe("allergy");
    expect(allergy.category).toEqual(["medication"]);
    expect(allergy.criticality).toBe("high");
    expect(allergy.code?.coding?.[0]?.code).toBe("387207008");
    expect(allergy.patient.reference).toBe("Patient/123");
    expect(allergy.reaction).toHaveLength(1);
    expect(allergy.note).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new AllergyIntoleranceBuilder()
      .snomedCode("387207008", "Ibuprofen")
      .patient("Patient/123")
      .clinicalStatus("active")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("AllergyIntolerance");
    expect(parsed.code.coding[0].code).toBe("387207008");
  });
});
