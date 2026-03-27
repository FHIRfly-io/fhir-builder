// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  ConditionBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("ConditionBuilder", () => {
  it("should create a Condition resource", () => {
    const condition = new ConditionBuilder().build();
    expect(condition.resourceType).toBe("Condition");
    expect(condition.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.condition()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.condition();
    expect(builder).toBeInstanceOf(ConditionBuilder);
  });

  // --- Clinical & Verification Status ---

  it("should set clinicalStatus with correct system", () => {
    const condition = new ConditionBuilder()
      .clinicalStatus("active")
      .build();
    expect(condition.clinicalStatus?.coding?.[0]?.code).toBe("active");
    expect(condition.clinicalStatus?.coding?.[0]?.system).toBe(
      CodeSystems.CONDITION_CLINICAL
    );
  });

  it("should set verificationStatus with correct system", () => {
    const condition = new ConditionBuilder()
      .verificationStatus("confirmed")
      .build();
    expect(condition.verificationStatus?.coding?.[0]?.code).toBe("confirmed");
    expect(condition.verificationStatus?.coding?.[0]?.system).toBe(
      CodeSystems.CONDITION_VERIFICATION
    );
  });

  // --- Category & Severity ---

  it("should add category with default system", () => {
    const condition = new ConditionBuilder()
      .category("encounter-diagnosis")
      .build();
    expect(condition.category).toHaveLength(1);
    expect(condition.category?.[0]?.coding?.[0]?.code).toBe(
      "encounter-diagnosis"
    );
    expect(condition.category?.[0]?.coding?.[0]?.system).toBe(
      CodeSystems.CONDITION_CATEGORY
    );
  });

  it("should set severity with SNOMED default", () => {
    const condition = new ConditionBuilder()
      .severity("24484000", undefined, "Severe")
      .build();
    expect(condition.severity?.coding?.[0]?.code).toBe("24484000");
    expect(condition.severity?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
    expect(condition.severity?.coding?.[0]?.display).toBe("Severe");
  });

  // --- Code ---

  it("should set code", () => {
    const condition = new ConditionBuilder()
      .code("73211009", CodeSystems.SNOMED, "Diabetes mellitus")
      .build();
    expect(condition.code?.coding?.[0]?.code).toBe("73211009");
  });

  it("should set code via icd10 shorthand", () => {
    const condition = new ConditionBuilder()
      .icd10("E11.9", "Type 2 diabetes mellitus")
      .build();
    expect(condition.code?.coding?.[0]?.code).toBe("E11.9");
    expect(condition.code?.coding?.[0]?.system).toBe(CodeSystems.ICD10CM);
    expect(condition.code?.coding?.[0]?.display).toBe(
      "Type 2 diabetes mellitus"
    );
  });

  it("should set code via snomedCode shorthand", () => {
    const condition = new ConditionBuilder()
      .snomedCode("73211009", "Diabetes mellitus")
      .build();
    expect(condition.code?.coding?.[0]?.code).toBe("73211009");
    expect(condition.code?.coding?.[0]?.system).toBe(CodeSystems.SNOMED);
  });

  // --- Subject & Context ---

  it("should set subject", () => {
    const condition = new ConditionBuilder()
      .subject("Patient/123")
      .build();
    expect(condition.subject.reference).toBe("Patient/123");
  });

  it("should set encounter", () => {
    const condition = new ConditionBuilder()
      .encounter("Encounter/enc-1")
      .build();
    expect(condition.encounter?.reference).toBe("Encounter/enc-1");
  });

  // --- Onset ---

  it("should set onsetDateTime", () => {
    const condition = new ConditionBuilder()
      .onsetDateTime("2020-03-15")
      .build();
    expect(condition.onsetDateTime).toBe("2020-03-15");
  });

  it("should set onsetAge", () => {
    const condition = new ConditionBuilder()
      .onsetAge(45, "years")
      .build();
    expect(condition.onsetAge?.value).toBe(45);
    expect(condition.onsetAge?.unit).toBe("years");
  });

  it("should set onsetPeriod", () => {
    const condition = new ConditionBuilder()
      .onsetPeriod("2020-01-01", "2020-06-01")
      .build();
    expect(condition.onsetPeriod?.start).toBe("2020-01-01");
    expect(condition.onsetPeriod?.end).toBe("2020-06-01");
  });

  it("should set onsetString", () => {
    const condition = new ConditionBuilder()
      .onsetString("Approximately 5 years ago")
      .build();
    expect(condition.onsetString).toBe("Approximately 5 years ago");
  });

  // --- Abatement ---

  it("should set abatementDateTime", () => {
    const condition = new ConditionBuilder()
      .abatementDateTime("2024-01-01")
      .build();
    expect(condition.abatementDateTime).toBe("2024-01-01");
  });

  it("should set abatementAge", () => {
    const condition = new ConditionBuilder()
      .abatementAge(50, "years")
      .build();
    expect(condition.abatementAge?.value).toBe(50);
  });

  it("should set abatementString", () => {
    const condition = new ConditionBuilder()
      .abatementString("Resolved after treatment")
      .build();
    expect(condition.abatementString).toBe("Resolved after treatment");
  });

  // --- Metadata ---

  it("should set recordedDate", () => {
    const condition = new ConditionBuilder()
      .recordedDate("2024-01-15")
      .build();
    expect(condition.recordedDate).toBe("2024-01-15");
  });

  it("should set recorder", () => {
    const condition = new ConditionBuilder()
      .recorder("Practitioner/dr-smith")
      .build();
    expect(condition.recorder?.reference).toBe("Practitioner/dr-smith");
  });

  it("should set asserter", () => {
    const condition = new ConditionBuilder()
      .asserter("Patient/123", "Jane Doe")
      .build();
    expect(condition.asserter?.reference).toBe("Patient/123");
    expect(condition.asserter?.display).toBe("Jane Doe");
  });

  // --- Notes ---

  it("should add notes", () => {
    const condition = new ConditionBuilder()
      .note("Patient reports improvement")
      .note("Follow up in 3 months")
      .build();
    expect(condition.note).toHaveLength(2);
    expect(condition.note?.[0]?.text).toBe("Patient reports improvement");
  });

  // --- Body Site ---

  it("should add body sites with SNOMED default", () => {
    const condition = new ConditionBuilder()
      .bodySite("51185008", undefined, "Thorax")
      .build();
    expect(condition.bodySite).toHaveLength(1);
    expect(condition.bodySite?.[0]?.coding?.[0]?.code).toBe("51185008");
    expect(condition.bodySite?.[0]?.coding?.[0]?.system).toBe(
      CodeSystems.SNOMED
    );
  });

  // --- Stage ---

  it("should add stage with summary", () => {
    const condition = new ConditionBuilder()
      .stage({
        code: "786005",
        system: CodeSystems.SNOMED,
        display: "Clinical stage I",
      })
      .build();
    expect(condition.stage).toHaveLength(1);
    expect(condition.stage?.[0]?.summary?.coding?.[0]?.code).toBe("786005");
  });

  it("should add stage with assessment", () => {
    const condition = new ConditionBuilder()
      .stage(undefined, ["Observation/staging-obs"])
      .build();
    expect(condition.stage?.[0]?.assessment?.[0]?.reference).toBe(
      "Observation/staging-obs"
    );
  });

  // --- Evidence ---

  it("should add evidence with code", () => {
    const condition = new ConditionBuilder()
      .evidence({
        code: "258710007",
        system: CodeSystems.SNOMED,
        display: "Lower limb pain",
      })
      .build();
    expect(condition.evidence).toHaveLength(1);
    expect(condition.evidence?.[0]?.code?.[0]?.coding?.[0]?.code).toBe(
      "258710007"
    );
  });

  it("should add evidence with detail reference", () => {
    const condition = new ConditionBuilder()
      .evidence(undefined, ["Observation/lab-result"])
      .build();
    expect(condition.evidence?.[0]?.detail?.[0]?.reference).toBe(
      "Observation/lab-result"
    );
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const condition = new ConditionBuilder()
      .id("cond-001")
      .clinicalStatus("active")
      .verificationStatus("confirmed")
      .category("encounter-diagnosis")
      .severity("6736007", undefined, "Moderate")
      .icd10("E11.9", "Type 2 diabetes mellitus")
      .subject("Patient/123")
      .encounter("Encounter/enc-1")
      .onsetDateTime("2020-03-15")
      .recordedDate("2024-01-15")
      .asserter("Practitioner/dr-smith")
      .note("Well controlled on metformin")
      .build();

    expect(condition.id).toBe("cond-001");
    expect(condition.clinicalStatus?.coding?.[0]?.code).toBe("active");
    expect(condition.verificationStatus?.coding?.[0]?.code).toBe("confirmed");
    expect(condition.category).toHaveLength(1);
    expect(condition.code?.coding?.[0]?.code).toBe("E11.9");
    expect(condition.subject.reference).toBe("Patient/123");
    expect(condition.onsetDateTime).toBe("2020-03-15");
    expect(condition.note).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new ConditionBuilder()
      .icd10("E11.9", "Type 2 diabetes")
      .subject("Patient/123")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Condition");
    expect(parsed.code.coding[0].code).toBe("E11.9");
  });
});
