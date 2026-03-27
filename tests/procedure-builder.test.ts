// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  ProcedureBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("ProcedureBuilder", () => {
  it("should create a Procedure resource with defaults", () => {
    const proc = new ProcedureBuilder().build();
    expect(proc.resourceType).toBe("Procedure");
    expect(proc.status).toBe("completed");
    expect(proc.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.procedure()", () => {
    const fb = new FHIRBuilder();
    expect(fb.procedure()).toBeInstanceOf(ProcedureBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const proc = new ProcedureBuilder().status("in-progress").build();
    expect(proc.status).toBe("in-progress");
  });

  it("should set subject", () => {
    const proc = new ProcedureBuilder().subject("Patient/123").build();
    expect(proc.subject.reference).toBe("Patient/123");
  });

  // --- Code Shorthands ---

  it("should set code", () => {
    const proc = new ProcedureBuilder()
      .code("27447", CodeSystems.CPT, "Total knee replacement")
      .build();
    expect(proc.code?.coding?.[0]?.code).toBe("27447");
  });

  it("should set code via snomedCode shorthand", () => {
    const proc = new ProcedureBuilder()
      .snomedCode("609588000", "Total knee replacement")
      .build();
    expect(proc.code?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  it("should set code via cptCode shorthand", () => {
    const proc = new ProcedureBuilder()
      .cptCode("27447", "Total knee replacement")
      .build();
    expect(proc.code?.coding?.[0]?.system).toBe(CodeSystems.CPT);
  });

  it("should set code via hcpcsCode shorthand", () => {
    const proc = new ProcedureBuilder()
      .hcpcsCode("G0101", "Cervical cancer screening")
      .build();
    expect(proc.code?.coding?.[0]?.system).toBe(CodeSystems.HCPCS);
  });

  // --- Context & Timing ---

  it("should set encounter", () => {
    const proc = new ProcedureBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(proc.encounter?.reference).toBe("Encounter/enc-1");
  });

  it("should set performedDateTime", () => {
    const proc = new ProcedureBuilder()
      .performedDateTime("2024-01-15T10:00:00Z")
      .build();
    expect(proc.performedDateTime).toBe("2024-01-15T10:00:00Z");
  });

  it("should set performedPeriod", () => {
    const proc = new ProcedureBuilder()
      .performedPeriod("2024-01-15T10:00:00Z", "2024-01-15T12:00:00Z")
      .build();
    expect(proc.performedPeriod?.start).toBe("2024-01-15T10:00:00Z");
    expect(proc.performedPeriod?.end).toBe("2024-01-15T12:00:00Z");
  });

  it("should set performedString", () => {
    const proc = new ProcedureBuilder()
      .performedString("Approximately 2 years ago")
      .build();
    expect(proc.performedString).toBe("Approximately 2 years ago");
  });

  // --- Metadata ---

  it("should set recorder", () => {
    const proc = new ProcedureBuilder()
      .recorder("Practitioner/dr-smith")
      .build();
    expect(proc.recorder?.reference).toBe("Practitioner/dr-smith");
  });

  it("should set asserter", () => {
    const proc = new ProcedureBuilder()
      .asserter("Patient/123")
      .build();
    expect(proc.asserter?.reference).toBe("Patient/123");
  });

  // --- Performer ---

  it("should add performer", () => {
    const proc = new ProcedureBuilder()
      .performer("Practitioner/surgeon-1", "304292004")
      .build();
    expect(proc.performer).toHaveLength(1);
    expect(proc.performer?.[0]?.actor.reference).toBe("Practitioner/surgeon-1");
    expect(proc.performer?.[0]?.function?.coding?.[0]?.code).toBe("304292004");
  });

  it("should add performer with onBehalfOf", () => {
    const proc = new ProcedureBuilder()
      .performer("Practitioner/surgeon-1", undefined, "Organization/hosp-1")
      .build();
    expect(proc.performer?.[0]?.onBehalfOf?.reference).toBe("Organization/hosp-1");
  });

  it("should set location", () => {
    const proc = new ProcedureBuilder()
      .location("Location/or-1", "Operating Room 1")
      .build();
    expect(proc.location?.reference).toBe("Location/or-1");
  });

  // --- Reason ---

  it("should add reason codes", () => {
    const proc = new ProcedureBuilder()
      .reasonCode("396275006", CodeSystems.SNOMED, "Osteoarthritis")
      .build();
    expect(proc.reasonCode?.[0]?.coding?.[0]?.code).toBe("396275006");
  });

  it("should add reason references", () => {
    const proc = new ProcedureBuilder()
      .reasonReference("Condition/cond-1")
      .build();
    expect(proc.reasonReference?.[0]?.reference).toBe("Condition/cond-1");
  });

  // --- Body Site ---

  it("should add body sites", () => {
    const proc = new ProcedureBuilder()
      .bodySite("72696002", undefined, "Knee")
      .build();
    expect(proc.bodySite?.[0]?.coding?.[0]?.code).toBe("72696002");
    expect(proc.bodySite?.[0]?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  // --- Outcome, Complication, Follow-Up ---

  it("should set outcome", () => {
    const proc = new ProcedureBuilder()
      .outcome("385669000", CodeSystems.SNOMED, "Successful")
      .build();
    expect(proc.outcome?.coding?.[0]?.code).toBe("385669000");
  });

  it("should add complications", () => {
    const proc = new ProcedureBuilder()
      .complication("131148009", CodeSystems.SNOMED, "Bleeding")
      .build();
    expect(proc.complication?.[0]?.coding?.[0]?.code).toBe("131148009");
  });

  it("should add follow-up", () => {
    const proc = new ProcedureBuilder()
      .followUp("18949003", CodeSystems.SNOMED, "Change of dressing")
      .build();
    expect(proc.followUp?.[0]?.coding?.[0]?.code).toBe("18949003");
  });

  // --- Notes ---

  it("should add notes", () => {
    const proc = new ProcedureBuilder()
      .note("Procedure completed without complications")
      .build();
    expect(proc.note?.[0]?.text).toBe("Procedure completed without complications");
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const proc = new ProcedureBuilder()
      .id("proc-001")
      .status("completed")
      .cptCode("27447", "Total knee replacement")
      .subject("Patient/123")
      .encounter("Encounter/enc-1")
      .performedDateTime("2024-01-15T10:00:00Z")
      .performer("Practitioner/surgeon-1")
      .location("Location/or-1")
      .reasonCode("396275006", CodeSystems.SNOMED, "Osteoarthritis")
      .bodySite("72696002", undefined, "Knee")
      .outcome("385669000", CodeSystems.SNOMED, "Successful")
      .note("Uncomplicated procedure")
      .build();

    expect(proc.id).toBe("proc-001");
    expect(proc.code?.coding?.[0]?.system).toBe(CodeSystems.CPT);
    expect(proc.subject.reference).toBe("Patient/123");
    expect(proc.performer).toHaveLength(1);
    expect(proc.bodySite).toHaveLength(1);
  });

  it("toJSON should produce valid JSON", () => {
    const json = new ProcedureBuilder()
      .cptCode("27447")
      .subject("Patient/123")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Procedure");
  });
});
