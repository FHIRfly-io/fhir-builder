// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  DiagnosticReportBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("DiagnosticReportBuilder", () => {
  it("should create a DiagnosticReport resource with defaults", () => {
    const report = new DiagnosticReportBuilder().build();
    expect(report.resourceType).toBe("DiagnosticReport");
    expect(report.status).toBe("final");
    expect(report.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.diagnosticReport()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.diagnosticReport();
    expect(builder).toBeInstanceOf(DiagnosticReportBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const report = new DiagnosticReportBuilder()
      .status("preliminary")
      .build();
    expect(report.status).toBe("preliminary");
  });

  it("should set code", () => {
    const report = new DiagnosticReportBuilder()
      .code("58410-2", CodeSystems.LOINC, "CBC panel")
      .build();
    expect(report.code.coding?.[0]?.code).toBe("58410-2");
    expect(report.code.coding?.[0]?.system).toBe(CodeSystems.LOINC);
  });

  it("should set code via loincCode shorthand", () => {
    const report = new DiagnosticReportBuilder()
      .loincCode("58410-2", "CBC panel")
      .build();
    expect(report.code.coding?.[0]?.code).toBe("58410-2");
    expect(report.code.coding?.[0]?.system).toBe(CodeSystems.LOINC);
    expect(report.code.coding?.[0]?.display).toBe("CBC panel");
  });

  // --- Category ---

  it("should add category with default v2-0074 system", () => {
    const report = new DiagnosticReportBuilder()
      .category("LAB", undefined, "Laboratory")
      .build();
    expect(report.category).toHaveLength(1);
    expect(report.category?.[0]?.coding?.[0]?.code).toBe("LAB");
    expect(report.category?.[0]?.coding?.[0]?.system).toContain("v2-0074");
  });

  it("should add multiple categories", () => {
    const report = new DiagnosticReportBuilder()
      .category("LAB")
      .category("RAD")
      .build();
    expect(report.category).toHaveLength(2);
  });

  // --- Subject & Context ---

  it("should set subject", () => {
    const report = new DiagnosticReportBuilder()
      .subject("Patient/123", "Jane Doe")
      .build();
    expect(report.subject?.reference).toBe("Patient/123");
    expect(report.subject?.display).toBe("Jane Doe");
  });

  it("should set encounter", () => {
    const report = new DiagnosticReportBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(report.encounter?.reference).toBe("Encounter/enc-1");
  });

  // --- Timing ---

  it("should set effectiveDateTime", () => {
    const report = new DiagnosticReportBuilder()
      .effectiveDateTime("2024-01-15T10:30:00Z")
      .build();
    expect(report.effectiveDateTime).toBe("2024-01-15T10:30:00Z");
  });

  it("should set effectivePeriod", () => {
    const report = new DiagnosticReportBuilder()
      .effectivePeriod("2024-01-15", "2024-01-16")
      .build();
    expect(report.effectivePeriod?.start).toBe("2024-01-15");
    expect(report.effectivePeriod?.end).toBe("2024-01-16");
  });

  it("should set issued", () => {
    const report = new DiagnosticReportBuilder()
      .issued("2024-01-15T12:00:00Z")
      .build();
    expect(report.issued).toBe("2024-01-15T12:00:00Z");
  });

  // --- Performer ---

  it("should add performers", () => {
    const report = new DiagnosticReportBuilder()
      .performer("Practitioner/lab-tech", "Lab Technician")
      .performer("Organization/lab-corp")
      .build();
    expect(report.performer).toHaveLength(2);
    expect(report.performer?.[0]?.reference).toBe("Practitioner/lab-tech");
  });

  // --- Results ---

  it("should add result references", () => {
    const report = new DiagnosticReportBuilder()
      .result("Observation/obs-1")
      .result("Observation/obs-2")
      .result("Observation/obs-3")
      .build();
    expect(report.result).toHaveLength(3);
    expect(report.result?.[0]?.reference).toBe("Observation/obs-1");
    expect(report.result?.[2]?.reference).toBe("Observation/obs-3");
  });

  it("should add result from resource object", () => {
    const obs = { resourceType: "Observation", id: "obs-abc" };
    const report = new DiagnosticReportBuilder().result(obs).build();
    expect(report.result?.[0]?.reference).toBe("Observation/obs-abc");
  });

  // --- Conclusion ---

  it("should set conclusion text", () => {
    const report = new DiagnosticReportBuilder()
      .conclusion("All values within normal limits")
      .build();
    expect(report.conclusion).toBe("All values within normal limits");
  });

  it("should add conclusion codes", () => {
    const report = new DiagnosticReportBuilder()
      .conclusionCode(
        "260394003",
        CodeSystems.SNOMED,
        "Within normal limits"
      )
      .build();
    expect(report.conclusionCode).toHaveLength(1);
    expect(report.conclusionCode?.[0]?.coding?.[0]?.code).toBe("260394003");
  });

  // --- Presented Form ---

  it("should add presented form with data", () => {
    const report = new DiagnosticReportBuilder()
      .presentedForm("application/pdf", "base64data==")
      .build();
    expect(report.presentedForm).toHaveLength(1);
    expect(report.presentedForm?.[0]?.contentType).toBe("application/pdf");
    expect(report.presentedForm?.[0]?.data).toBe("base64data==");
  });

  it("should add presented form with URL", () => {
    const report = new DiagnosticReportBuilder()
      .presentedForm(
        "application/pdf",
        undefined,
        "https://example.com/report.pdf"
      )
      .build();
    expect(report.presentedForm?.[0]?.url).toBe(
      "https://example.com/report.pdf"
    );
    expect(report.presentedForm?.[0]?.data).toBeUndefined();
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const report = new DiagnosticReportBuilder()
      .id("report-001")
      .status("final")
      .category("LAB")
      .loincCode("58410-2", "CBC panel")
      .subject("Patient/123")
      .encounter("Encounter/enc-1")
      .effectiveDateTime("2024-01-15T10:00:00Z")
      .issued("2024-01-15T12:00:00Z")
      .performer("Organization/lab-corp")
      .result("Observation/obs-1")
      .result("Observation/obs-2")
      .conclusion("All values within normal limits")
      .conclusionCode("260394003", CodeSystems.SNOMED, "Normal")
      .build();

    expect(report.id).toBe("report-001");
    expect(report.status).toBe("final");
    expect(report.category).toHaveLength(1);
    expect(report.code.coding?.[0]?.code).toBe("58410-2");
    expect(report.subject?.reference).toBe("Patient/123");
    expect(report.result).toHaveLength(2);
    expect(report.conclusion).toBe("All values within normal limits");
    expect(report.conclusionCode).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new DiagnosticReportBuilder()
      .loincCode("58410-2", "CBC panel")
      .subject("Patient/123")
      .result("Observation/obs-1")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("DiagnosticReport");
    expect(parsed.result).toHaveLength(1);
  });
});
