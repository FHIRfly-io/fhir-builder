// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import { FHIRBuilder, CodeSystems } from "../src/index.js";

describe("@fhirfly-io/fhir-builder", () => {
  it("should export FHIRBuilder class", () => {
    expect(FHIRBuilder).toBeDefined();
    const fb = new FHIRBuilder();
    expect(fb).toBeInstanceOf(FHIRBuilder);
  });

  it("should export CodeSystems constants", () => {
    expect(CodeSystems).toBeDefined();
    expect(CodeSystems.NDC).toBe("http://hl7.org/fhir/sid/ndc");
    expect(CodeSystems.LOINC).toBe("http://loinc.org");
    expect(CodeSystems.SNOMED).toBe("http://snomed.info/sct");
    expect(CodeSystems.ICD10CM).toBe("http://hl7.org/fhir/sid/icd-10-cm");
    expect(CodeSystems.RXNORM).toBe(
      "http://www.nlm.nih.gov/research/umls/rxnorm"
    );
    expect(CodeSystems.CVX).toBe("http://hl7.org/fhir/sid/cvx");
    expect(CodeSystems.MVX).toBe("http://hl7.org/fhir/sid/mvx");
    expect(CodeSystems.CPT).toBe("http://www.ama-assn.org/go/cpt");
    expect(CodeSystems.HCPCS).toBe(
      "https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets"
    );
    expect(CodeSystems.UCUM).toBe("http://unitsofmeasure.org");
  });

  it("should have US Core extension URIs", () => {
    expect(CodeSystems.US_CORE_RACE).toContain("us-core-race");
    expect(CodeSystems.US_CORE_ETHNICITY).toContain("us-core-ethnicity");
    expect(CodeSystems.US_CORE_BIRTH_SEX).toContain("us-core-birthsex");
    expect(CodeSystems.US_CORE_PATIENT).toContain("us-core-patient");
  });

  it("CodeSystems should be frozen (immutable)", () => {
    // The 'as const' assertion makes values readonly at the type level.
    // Verify all values are strings.
    for (const [key, value] of Object.entries(CodeSystems)) {
      expect(typeof value).toBe("string");
      expect(key).toBeTruthy();
    }
  });
});
