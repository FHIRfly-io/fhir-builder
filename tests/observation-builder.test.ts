// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  ObservationBuilder,
  FHIRBuilder,
  CodeSystems,
  buildQuantity,
} from "../src/index.js";

describe("ObservationBuilder", () => {
  it("should create an Observation resource with defaults", () => {
    const obs = new ObservationBuilder().build();
    expect(obs.resourceType).toBe("Observation");
    expect(obs.status).toBe("final");
    expect(obs.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.observation()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.observation();
    expect(builder).toBeInstanceOf(ObservationBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const obs = new ObservationBuilder().status("preliminary").build();
    expect(obs.status).toBe("preliminary");
  });

  it("should set code", () => {
    const obs = new ObservationBuilder()
      .code("8302-2", CodeSystems.LOINC, "Body height")
      .build();
    expect(obs.code.coding?.[0]?.code).toBe("8302-2");
    expect(obs.code.coding?.[0]?.system).toBe(CodeSystems.LOINC);
    expect(obs.code.coding?.[0]?.display).toBe("Body height");
  });

  it("should set code via loincCode shorthand", () => {
    const obs = new ObservationBuilder()
      .loincCode("8302-2", "Body height")
      .build();
    expect(obs.code.coding?.[0]?.code).toBe("8302-2");
    expect(obs.code.coding?.[0]?.system).toBe(CodeSystems.LOINC);
  });

  // --- Category ---

  it("should add category with default system", () => {
    const obs = new ObservationBuilder()
      .category("vital-signs")
      .build();
    expect(obs.category).toHaveLength(1);
    expect(obs.category?.[0]?.coding?.[0]?.code).toBe("vital-signs");
    expect(obs.category?.[0]?.coding?.[0]?.system).toBe(
      CodeSystems.OBSERVATION_CATEGORY
    );
  });

  it("should add multiple categories", () => {
    const obs = new ObservationBuilder()
      .category("vital-signs")
      .category("laboratory")
      .build();
    expect(obs.category).toHaveLength(2);
  });

  // --- Subject & Context ---

  it("should set subject", () => {
    const obs = new ObservationBuilder()
      .subject("Patient/123", "Jane Doe")
      .build();
    expect(obs.subject?.reference).toBe("Patient/123");
    expect(obs.subject?.display).toBe("Jane Doe");
  });

  it("should set encounter", () => {
    const obs = new ObservationBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(obs.encounter?.reference).toBe("Encounter/enc-1");
  });

  // --- Timing ---

  it("should set effectiveDateTime", () => {
    const obs = new ObservationBuilder()
      .effectiveDateTime("2024-01-15T10:30:00Z")
      .build();
    expect(obs.effectiveDateTime).toBe("2024-01-15T10:30:00Z");
  });

  it("should set effectivePeriod", () => {
    const obs = new ObservationBuilder()
      .effectivePeriod("2024-01-15", "2024-01-16")
      .build();
    expect(obs.effectivePeriod?.start).toBe("2024-01-15");
    expect(obs.effectivePeriod?.end).toBe("2024-01-16");
  });

  it("should set issued", () => {
    const obs = new ObservationBuilder()
      .issued("2024-01-15T11:00:00Z")
      .build();
    expect(obs.issued).toBe("2024-01-15T11:00:00Z");
  });

  // --- Performer ---

  it("should add performers", () => {
    const obs = new ObservationBuilder()
      .performer("Practitioner/dr-smith", "Dr. Smith")
      .build();
    expect(obs.performer).toHaveLength(1);
    expect(obs.performer?.[0]?.reference).toBe("Practitioner/dr-smith");
  });

  // --- Values ---

  it("should set valueQuantity with UCUM", () => {
    const obs = new ObservationBuilder()
      .valueQuantity(170, "cm", "cm")
      .build();
    expect(obs.valueQuantity?.value).toBe(170);
    expect(obs.valueQuantity?.unit).toBe("cm");
    expect(obs.valueQuantity?.system).toBe(CodeSystems.UCUM);
    expect(obs.valueQuantity?.code).toBe("cm");
  });

  it("should set valueCodeableConcept", () => {
    const obs = new ObservationBuilder()
      .valueCodeableConcept("260373001", CodeSystems.SNOMED, "Detected")
      .build();
    expect(obs.valueCodeableConcept?.coding?.[0]?.code).toBe("260373001");
  });

  it("should set valueString", () => {
    const obs = new ObservationBuilder().valueString("Positive").build();
    expect(obs.valueString).toBe("Positive");
  });

  it("should set valueBoolean", () => {
    const obs = new ObservationBuilder().valueBoolean(true).build();
    expect(obs.valueBoolean).toBe(true);
  });

  // --- Interpretation ---

  it("should add interpretation with default system", () => {
    const obs = new ObservationBuilder()
      .interpretation("H", undefined, "High")
      .build();
    expect(obs.interpretation).toHaveLength(1);
    expect(obs.interpretation?.[0]?.coding?.[0]?.code).toBe("H");
    expect(obs.interpretation?.[0]?.coding?.[0]?.system).toContain(
      "ObservationInterpretation"
    );
  });

  // --- Reference Range ---

  it("should add reference range", () => {
    const low = buildQuantity(100, "mg/dL");
    const high = buildQuantity(200, "mg/dL");
    const obs = new ObservationBuilder()
      .referenceRange(low, high, "Normal range")
      .build();
    expect(obs.referenceRange).toHaveLength(1);
    expect(obs.referenceRange?.[0]?.low?.value).toBe(100);
    expect(obs.referenceRange?.[0]?.high?.value).toBe(200);
    expect(obs.referenceRange?.[0]?.text).toBe("Normal range");
  });

  it("should add reference range with only text", () => {
    const obs = new ObservationBuilder()
      .referenceRange(undefined, undefined, "< 200 mg/dL")
      .build();
    expect(obs.referenceRange?.[0]?.text).toBe("< 200 mg/dL");
  });

  // --- Notes ---

  it("should add notes", () => {
    const obs = new ObservationBuilder()
      .note("Patient was fasting")
      .build();
    expect(obs.note).toHaveLength(1);
    expect(obs.note?.[0]?.text).toBe("Patient was fasting");
  });

  // --- Components (Blood Pressure Panel) ---

  it("should add components for blood pressure", () => {
    const obs = new ObservationBuilder()
      .loincCode("85354-9", "Blood pressure panel")
      .category("vital-signs")
      .component("8480-6", CodeSystems.LOINC, {
        valueQuantity: buildQuantity(120, "mmHg", "mm[Hg]"),
      }, "Systolic blood pressure")
      .component("8462-4", CodeSystems.LOINC, {
        valueQuantity: buildQuantity(80, "mmHg", "mm[Hg]"),
      }, "Diastolic blood pressure")
      .build();

    expect(obs.component).toHaveLength(2);

    const systolic = obs.component?.[0];
    expect(systolic?.code.coding?.[0]?.code).toBe("8480-6");
    expect(systolic?.code.coding?.[0]?.display).toBe("Systolic blood pressure");
    expect(systolic?.valueQuantity?.value).toBe(120);
    expect(systolic?.valueQuantity?.unit).toBe("mmHg");

    const diastolic = obs.component?.[1];
    expect(diastolic?.code.coding?.[0]?.code).toBe("8462-4");
    expect(diastolic?.valueQuantity?.value).toBe(80);
  });

  // --- Additional Fields ---

  it("should set bodySite", () => {
    const obs = new ObservationBuilder()
      .bodySite("368209003", CodeSystems.SNOMED, "Right arm")
      .build();
    expect(obs.bodySite?.coding?.[0]?.code).toBe("368209003");
  });

  it("should set method", () => {
    const obs = new ObservationBuilder()
      .method("258104002", CodeSystems.SNOMED, "Measured")
      .build();
    expect(obs.method?.coding?.[0]?.code).toBe("258104002");
  });

  it("should set dataAbsentReason", () => {
    const obs = new ObservationBuilder()
      .dataAbsentReason("not-performed", "Not Performed")
      .build();
    expect(obs.dataAbsentReason?.coding?.[0]?.code).toBe("not-performed");
    expect(obs.dataAbsentReason?.coding?.[0]?.system).toContain(
      "data-absent-reason"
    );
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const obs = new ObservationBuilder()
      .id("obs-001")
      .status("final")
      .category("vital-signs")
      .loincCode("8302-2", "Body height")
      .subject("Patient/123")
      .encounter("Encounter/enc-1")
      .effectiveDateTime("2024-01-15T10:30:00Z")
      .performer("Practitioner/dr-smith")
      .valueQuantity(170, "cm", "cm")
      .interpretation("N", undefined, "Normal")
      .note("Measured standing")
      .build();

    expect(obs.id).toBe("obs-001");
    expect(obs.status).toBe("final");
    expect(obs.category).toHaveLength(1);
    expect(obs.code.coding?.[0]?.code).toBe("8302-2");
    expect(obs.subject?.reference).toBe("Patient/123");
    expect(obs.valueQuantity?.value).toBe(170);
    expect(obs.interpretation).toHaveLength(1);
    expect(obs.note).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new ObservationBuilder()
      .loincCode("8302-2", "Body height")
      .valueQuantity(170, "cm")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Observation");
    expect(parsed.code.coding[0].code).toBe("8302-2");
  });
});
