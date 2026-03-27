// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import { FHIRBuilder, CodeSystems } from "../src/index.js";

describe("FHIRBuilder", () => {
  const fb = new FHIRBuilder();

  describe("generateId", () => {
    it("should generate a UUID v4", () => {
      const id = fb.generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });
  });

  describe("codeableConcept", () => {
    it("should delegate to buildCodeableConcept", () => {
      const cc = fb.codeableConcept("E11.9", CodeSystems.ICD10CM, "Diabetes");
      expect(cc.coding?.[0]?.code).toBe("E11.9");
      expect(cc.coding?.[0]?.display).toBe("Diabetes");
    });
  });

  describe("coding", () => {
    it("should delegate to buildCoding", () => {
      const coding = fb.coding("8302-2", CodeSystems.LOINC, "Body height");
      expect(coding).toEqual({
        system: CodeSystems.LOINC,
        code: "8302-2",
        display: "Body height",
      });
    });
  });

  describe("humanName", () => {
    it("should build from strings", () => {
      const name = fb.humanName("Jane", "Doe");
      expect(name.given).toEqual(["Jane"]);
      expect(name.family).toBe("Doe");
    });

    it("should build from input object", () => {
      const name = fb.humanName({
        given: ["Jane", "Marie"],
        family: "Doe",
        use: "official",
      });
      expect(name.given).toEqual(["Jane", "Marie"]);
      expect(name.use).toBe("official");
    });
  });

  describe("identifier", () => {
    it("should build an identifier", () => {
      const id = fb.identifier("12345", "http://hospital.org/mrn", "MR");
      expect(id.value).toBe("12345");
      expect(id.type?.coding?.[0]?.code).toBe("MR");
    });
  });

  describe("reference", () => {
    it("should build from a string", () => {
      const ref = fb.reference("Patient/123", "Jane Doe");
      expect(ref.reference).toBe("Patient/123");
      expect(ref.display).toBe("Jane Doe");
    });

    it("should build from a resource", () => {
      const patient = { resourceType: "Patient", id: "abc" };
      const ref = fb.reference(patient);
      expect(ref.reference).toBe("Patient/abc");
    });
  });

  describe("period", () => {
    it("should build a period", () => {
      const period = fb.period("2024-01-01", "2024-12-31");
      expect(period.start).toBe("2024-01-01");
      expect(period.end).toBe("2024-12-31");
    });
  });

  describe("quantity", () => {
    it("should build with UCUM code", () => {
      const q = fb.quantity(120, "mmHg", "mm[Hg]");
      expect(q.value).toBe(120);
      expect(q.system).toBe(CodeSystems.UCUM);
      expect(q.code).toBe("mm[Hg]");
    });
  });
});
