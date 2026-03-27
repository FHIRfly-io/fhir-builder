// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  CoverageBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("CoverageBuilder", () => {
  it("should create a Coverage resource with defaults", () => {
    const coverage = new CoverageBuilder().build();
    expect(coverage.resourceType).toBe("Coverage");
    expect(coverage.status).toBe("active");
    expect(coverage.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.coverage()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.coverage();
    expect(builder).toBeInstanceOf(CoverageBuilder);
  });

  // --- Required Fields ---

  it("should set status", () => {
    const coverage = new CoverageBuilder().status("cancelled").build();
    expect(coverage.status).toBe("cancelled");
  });

  it("should set beneficiary", () => {
    const coverage = new CoverageBuilder()
      .beneficiary("Patient/123", "Jane Doe")
      .build();
    expect(coverage.beneficiary.reference).toBe("Patient/123");
    expect(coverage.beneficiary.display).toBe("Jane Doe");
  });

  it("should set beneficiary from resource", () => {
    const patient = { resourceType: "Patient", id: "abc" };
    const coverage = new CoverageBuilder().beneficiary(patient).build();
    expect(coverage.beneficiary.reference).toBe("Patient/abc");
  });

  it("should add payors", () => {
    const coverage = new CoverageBuilder()
      .payor("Organization/ins-co", "Acme Insurance")
      .build();
    expect(coverage.payor).toHaveLength(1);
    expect(coverage.payor[0]?.reference).toBe("Organization/ins-co");
    expect(coverage.payor[0]?.display).toBe("Acme Insurance");
  });

  it("should support multiple payors", () => {
    const coverage = new CoverageBuilder()
      .payor("Organization/primary")
      .payor("Organization/secondary")
      .build();
    expect(coverage.payor).toHaveLength(2);
  });

  // --- Common Fields ---

  it("should set type with default ActCode system", () => {
    const coverage = new CoverageBuilder()
      .type("EHCPOL", undefined, "Extended healthcare")
      .build();
    expect(coverage.type?.coding?.[0]?.code).toBe("EHCPOL");
    expect(coverage.type?.coding?.[0]?.system).toBe(CodeSystems.ACT_CODE);
  });

  it("should set type with custom system", () => {
    const coverage = new CoverageBuilder()
      .type("custom", "http://custom.org")
      .build();
    expect(coverage.type?.coding?.[0]?.system).toBe("http://custom.org");
  });

  it("should set policy holder", () => {
    const coverage = new CoverageBuilder()
      .policyHolder("Patient/holder-1")
      .build();
    expect(coverage.policyHolder?.reference).toBe("Patient/holder-1");
  });

  it("should set subscriber", () => {
    const coverage = new CoverageBuilder()
      .subscriber("Patient/sub-1", "John Doe")
      .build();
    expect(coverage.subscriber?.reference).toBe("Patient/sub-1");
    expect(coverage.subscriber?.display).toBe("John Doe");
  });

  it("should set subscriber ID", () => {
    const coverage = new CoverageBuilder()
      .subscriberId("SUB-456")
      .build();
    expect(coverage.subscriberId).toBe("SUB-456");
  });

  it("should set dependent", () => {
    const coverage = new CoverageBuilder().dependent("01").build();
    expect(coverage.dependent).toBe("01");
  });

  it("should set relationship with default system", () => {
    const coverage = new CoverageBuilder()
      .relationship("self", undefined, "Self")
      .build();
    expect(coverage.relationship?.coding?.[0]?.code).toBe("self");
    expect(coverage.relationship?.coding?.[0]?.system).toContain(
      "subscriber-relationship"
    );
  });

  it("should set period", () => {
    const coverage = new CoverageBuilder()
      .period("2024-01-01", "2024-12-31")
      .build();
    expect(coverage.period?.start).toBe("2024-01-01");
    expect(coverage.period?.end).toBe("2024-12-31");
  });

  // --- Class Info ---

  it("should add class info", () => {
    const coverage = new CoverageBuilder()
      .classInfo("group", "GRP-123", "Employee Group")
      .build();
    expect(coverage.class).toHaveLength(1);
    expect(coverage.class?.[0]?.type.coding?.[0]?.code).toBe("group");
    expect(coverage.class?.[0]?.value).toBe("GRP-123");
    expect(coverage.class?.[0]?.name).toBe("Employee Group");
  });

  it("should add multiple class entries", () => {
    const coverage = new CoverageBuilder()
      .classInfo("group", "GRP-123", "Employee Group")
      .classInfo("plan", "PLN-456", "Gold Plan")
      .classInfo("subclass", "DENTAL", "Dental Coverage")
      .build();
    expect(coverage.class).toHaveLength(3);
  });

  it("should add class info without name", () => {
    const coverage = new CoverageBuilder()
      .classInfo("group", "GRP-123")
      .build();
    expect(coverage.class?.[0]?.name).toBeUndefined();
  });

  // --- Network & Order ---

  it("should set network", () => {
    const coverage = new CoverageBuilder()
      .network("PPO Network A")
      .build();
    expect(coverage.network).toBe("PPO Network A");
  });

  it("should set order", () => {
    const coverage = new CoverageBuilder().order(1).build();
    expect(coverage.order).toBe(1);
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const coverage = new CoverageBuilder()
      .id("cov-001")
      .status("active")
      .type("EHCPOL", undefined, "Extended healthcare")
      .beneficiary("Patient/123")
      .subscriber("Patient/123")
      .subscriberId("SUB-456")
      .relationship("self")
      .payor("Organization/ins-co", "Acme Insurance")
      .period("2024-01-01", "2024-12-31")
      .classInfo("group", "GRP-123", "Employee Group")
      .classInfo("plan", "PLN-456", "Gold Plan")
      .network("PPO Network A")
      .order(1)
      .build();

    expect(coverage.id).toBe("cov-001");
    expect(coverage.resourceType).toBe("Coverage");
    expect(coverage.status).toBe("active");
    expect(coverage.beneficiary.reference).toBe("Patient/123");
    expect(coverage.payor).toHaveLength(1);
    expect(coverage.subscriberId).toBe("SUB-456");
    expect(coverage.class).toHaveLength(2);
    expect(coverage.network).toBe("PPO Network A");
    expect(coverage.order).toBe(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new CoverageBuilder()
      .beneficiary("Patient/123")
      .payor("Organization/ins-co")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Coverage");
    expect(parsed.beneficiary.reference).toBe("Patient/123");
    expect(parsed.payor[0].reference).toBe("Organization/ins-co");
  });
});
