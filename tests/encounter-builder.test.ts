// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  EncounterBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("EncounterBuilder", () => {
  it("should create an Encounter resource with defaults", () => {
    const encounter = new EncounterBuilder().build();
    expect(encounter.resourceType).toBe("Encounter");
    expect(encounter.status).toBe("unknown");
    expect(encounter.class.system).toBe(CodeSystems.ACT_CODE);
    expect(encounter.class.code).toBe("AMB");
    expect(encounter.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.encounter()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.encounter();
    expect(builder).toBeInstanceOf(EncounterBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const encounter = new EncounterBuilder().status("finished").build();
    expect(encounter.status).toBe("finished");
  });

  it("should set encounter class", () => {
    const encounter = new EncounterBuilder()
      .encounterClass("EMER", undefined, "emergency")
      .build();
    expect(encounter.class.code).toBe("EMER");
    expect(encounter.class.system).toBe(CodeSystems.ACT_CODE);
    expect(encounter.class.display).toBe("emergency");
  });

  it("should set encounter class with custom system", () => {
    const encounter = new EncounterBuilder()
      .encounterClass("custom", "http://custom.org", "Custom Class")
      .build();
    expect(encounter.class.system).toBe("http://custom.org");
  });

  // --- Common Fields ---

  it("should add a type", () => {
    const encounter = new EncounterBuilder()
      .type("99213", CodeSystems.CPT, "Office visit")
      .build();
    expect(encounter.type).toHaveLength(1);
    expect(encounter.type?.[0]?.coding?.[0]?.code).toBe("99213");
  });

  it("should set subject", () => {
    const encounter = new EncounterBuilder()
      .subject("Patient/123", "Jane Doe")
      .build();
    expect(encounter.subject?.reference).toBe("Patient/123");
    expect(encounter.subject?.display).toBe("Jane Doe");
  });

  it("should set subject from resource object", () => {
    const patient = { resourceType: "Patient", id: "abc" };
    const encounter = new EncounterBuilder().subject(patient).build();
    expect(encounter.subject?.reference).toBe("Patient/abc");
  });

  it("should add participants", () => {
    const encounter = new EncounterBuilder()
      .participant("Practitioner/dr-smith", "ATND", undefined, "attender")
      .build();
    expect(encounter.participant).toHaveLength(1);
    expect(encounter.participant?.[0]?.individual?.reference).toBe(
      "Practitioner/dr-smith"
    );
    expect(encounter.participant?.[0]?.type?.[0]?.coding?.[0]?.code).toBe(
      "ATND"
    );
  });

  it("should add participant without type", () => {
    const encounter = new EncounterBuilder()
      .participant("Practitioner/dr-smith")
      .build();
    expect(encounter.participant?.[0]?.individual?.reference).toBe(
      "Practitioner/dr-smith"
    );
    expect(encounter.participant?.[0]?.type).toBeUndefined();
  });

  it("should set period", () => {
    const encounter = new EncounterBuilder()
      .period("2024-01-15T09:00:00Z", "2024-01-15T10:00:00Z")
      .build();
    expect(encounter.period?.start).toBe("2024-01-15T09:00:00Z");
    expect(encounter.period?.end).toBe("2024-01-15T10:00:00Z");
  });

  it("should add reason codes", () => {
    const encounter = new EncounterBuilder()
      .reasonCode("J06.9", CodeSystems.ICD10CM, "Acute upper respiratory infection")
      .build();
    expect(encounter.reasonCode).toHaveLength(1);
    expect(encounter.reasonCode?.[0]?.coding?.[0]?.code).toBe("J06.9");
  });

  it("should add reason references", () => {
    const encounter = new EncounterBuilder()
      .reasonReference("Condition/cond-1")
      .build();
    expect(encounter.reasonReference).toHaveLength(1);
    expect(encounter.reasonReference?.[0]?.reference).toBe("Condition/cond-1");
  });

  // --- Hospitalization ---

  it("should set hospitalization details", () => {
    const encounter = new EncounterBuilder()
      .hospitalization({
        admitSource: { code: "emd", display: "From accident/emergency department" },
        dischargeDisposition: { code: "home", display: "Discharged to Home" },
      })
      .build();
    expect(encounter.hospitalization?.admitSource?.coding?.[0]?.code).toBe("emd");
    expect(
      encounter.hospitalization?.dischargeDisposition?.coding?.[0]?.code
    ).toBe("home");
  });

  it("should use default systems for hospitalization", () => {
    const encounter = new EncounterBuilder()
      .hospitalization({ admitSource: { code: "emd" } })
      .build();
    expect(
      encounter.hospitalization?.admitSource?.coding?.[0]?.system
    ).toContain("admit-source");
  });

  // --- Service Provider & Location ---

  it("should set service provider", () => {
    const encounter = new EncounterBuilder()
      .serviceProvider("Organization/hosp-1", "General Hospital")
      .build();
    expect(encounter.serviceProvider?.reference).toBe("Organization/hosp-1");
    expect(encounter.serviceProvider?.display).toBe("General Hospital");
  });

  it("should add locations", () => {
    const encounter = new EncounterBuilder()
      .location("Location/room-1", "active", {
        start: "2024-01-15T09:00:00Z",
      })
      .build();
    expect(encounter.location).toHaveLength(1);
    expect(encounter.location?.[0]?.location.reference).toBe("Location/room-1");
    expect(encounter.location?.[0]?.status).toBe("active");
    expect(encounter.location?.[0]?.period?.start).toBe("2024-01-15T09:00:00Z");
  });

  it("should add location without status or period", () => {
    const encounter = new EncounterBuilder()
      .location("Location/room-1")
      .build();
    expect(encounter.location?.[0]?.location.reference).toBe("Location/room-1");
    expect(encounter.location?.[0]?.status).toBeUndefined();
    expect(encounter.location?.[0]?.period).toBeUndefined();
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const encounter = new EncounterBuilder()
      .id("enc-001")
      .status("finished")
      .encounterClass("AMB", undefined, "ambulatory")
      .subject("Patient/123")
      .participant("Practitioner/dr-smith", "ATND")
      .period("2024-01-15T09:00:00Z", "2024-01-15T10:00:00Z")
      .type("99213", CodeSystems.CPT, "Office visit")
      .reasonCode("J06.9", CodeSystems.ICD10CM, "URI")
      .serviceProvider("Organization/hosp-1")
      .build();

    expect(encounter.id).toBe("enc-001");
    expect(encounter.status).toBe("finished");
    expect(encounter.class.code).toBe("AMB");
    expect(encounter.subject?.reference).toBe("Patient/123");
    expect(encounter.participant).toHaveLength(1);
    expect(encounter.period?.start).toBe("2024-01-15T09:00:00Z");
    expect(encounter.type).toHaveLength(1);
    expect(encounter.reasonCode).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new EncounterBuilder()
      .status("finished")
      .subject("Patient/123")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Encounter");
    expect(parsed.status).toBe("finished");
    expect(parsed.class.code).toBe("AMB");
  });
});
