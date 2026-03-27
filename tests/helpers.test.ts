// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  generateId,
  buildCodeableConcept,
  buildCoding,
  addCodingToCodeableConcept,
  buildHumanName,
  buildIdentifier,
  buildReference,
  buildPeriod,
  buildQuantity,
  cleanObject,
  CodeSystems,
} from "../src/index.js";

describe("generateId", () => {
  it("should return a UUID v4 string", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("should generate unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("buildCodeableConcept", () => {
  it("should build with code and system", () => {
    const cc = buildCodeableConcept("E11.9", CodeSystems.ICD10CM);
    expect(cc).toEqual({
      coding: [{ system: CodeSystems.ICD10CM, code: "E11.9" }],
    });
  });

  it("should include display when provided", () => {
    const cc = buildCodeableConcept(
      "E11.9",
      CodeSystems.ICD10CM,
      "Type 2 diabetes"
    );
    expect(cc.coding?.[0]?.display).toBe("Type 2 diabetes");
  });

  it("should include text when provided", () => {
    const cc = buildCodeableConcept(
      "E11.9",
      CodeSystems.ICD10CM,
      "Type 2 diabetes",
      "Patient has diabetes"
    );
    expect(cc.text).toBe("Patient has diabetes");
  });

  it("should not include display or text when not provided", () => {
    const cc = buildCodeableConcept("E11.9", CodeSystems.ICD10CM);
    expect(cc.coding?.[0]).not.toHaveProperty("display");
    expect(cc).not.toHaveProperty("text");
  });
});

describe("buildCoding", () => {
  it("should build with code and system", () => {
    const coding = buildCoding("E11.9", CodeSystems.ICD10CM);
    expect(coding).toEqual({ system: CodeSystems.ICD10CM, code: "E11.9" });
  });

  it("should include display when provided", () => {
    const coding = buildCoding(
      "E11.9",
      CodeSystems.ICD10CM,
      "Type 2 diabetes"
    );
    expect(coding.display).toBe("Type 2 diabetes");
  });
});

describe("addCodingToCodeableConcept", () => {
  it("should add a coding to an existing CodeableConcept", () => {
    const cc = buildCodeableConcept("E11.9", CodeSystems.ICD10CM);
    const newCoding = buildCoding("73211009", CodeSystems.SNOMED, "Diabetes");
    const result = addCodingToCodeableConcept(cc, newCoding);

    expect(result.coding).toHaveLength(2);
    expect(result.coding?.[0]?.code).toBe("E11.9");
    expect(result.coding?.[1]?.code).toBe("73211009");
  });

  it("should not mutate the original CodeableConcept", () => {
    const cc = buildCodeableConcept("E11.9", CodeSystems.ICD10CM);
    const newCoding = buildCoding("73211009", CodeSystems.SNOMED);
    const result = addCodingToCodeableConcept(cc, newCoding);

    expect(cc.coding).toHaveLength(1);
    expect(result.coding).toHaveLength(2);
    expect(result).not.toBe(cc);
  });

  it("should handle CodeableConcept with no existing coding", () => {
    const cc = { text: "Diabetes" };
    const coding = buildCoding("E11.9", CodeSystems.ICD10CM);
    const result = addCodingToCodeableConcept(cc, coding);

    expect(result.coding).toHaveLength(1);
    expect(result.text).toBe("Diabetes");
  });
});

describe("buildHumanName", () => {
  it("should build from given and family strings", () => {
    const name = buildHumanName("Jane", "Doe");
    expect(name).toEqual({ family: "Doe", given: ["Jane"] });
  });

  it("should include use when provided", () => {
    const name = buildHumanName("Jane", "Doe", "official");
    expect(name.use).toBe("official");
  });

  it("should default family to empty string when not provided", () => {
    const name = buildHumanName("Jane");
    expect(name.family).toBe("");
  });

  it("should build from a HumanNameInput object", () => {
    const name = buildHumanName({
      given: ["Jane", "Marie"],
      family: "Doe",
      use: "official",
    });
    expect(name).toEqual({
      family: "Doe",
      given: ["Jane", "Marie"],
      use: "official",
    });
  });

  it("should normalize single given name to array", () => {
    const name = buildHumanName({ given: "Jane", family: "Doe" });
    expect(name.given).toEqual(["Jane"]);
  });

  it("should handle prefix and suffix", () => {
    const name = buildHumanName({
      given: "Jane",
      family: "Doe",
      prefix: "Dr.",
      suffix: ["MD", "PhD"],
    });
    expect(name.prefix).toEqual(["Dr."]);
    expect(name.suffix).toEqual(["MD", "PhD"]);
  });

  it("should not include prefix/suffix when not provided", () => {
    const name = buildHumanName({ given: "Jane", family: "Doe" });
    expect(name).not.toHaveProperty("prefix");
    expect(name).not.toHaveProperty("suffix");
  });
});

describe("buildIdentifier", () => {
  it("should build with value and system", () => {
    const id = buildIdentifier("12345", "http://hospital.org/mrn");
    expect(id).toEqual({ system: "http://hospital.org/mrn", value: "12345" });
  });

  it("should include type coding when typeCode provided", () => {
    const id = buildIdentifier("12345", "http://hospital.org/mrn", "MR");
    expect(id.type?.coding?.[0]).toEqual({
      system: CodeSystems.IDENTIFIER_TYPE,
      code: "MR",
    });
  });
});

describe("buildReference", () => {
  it("should build from a reference string", () => {
    const ref = buildReference("Patient/123");
    expect(ref).toEqual({ reference: "Patient/123" });
  });

  it("should build from a resource object", () => {
    const patient = { resourceType: "Patient", id: "abc-123" };
    const ref = buildReference(patient);
    expect(ref).toEqual({ reference: "Patient/abc-123" });
  });

  it("should handle resource without id", () => {
    const patient = { resourceType: "Patient" };
    const ref = buildReference(patient);
    expect(ref).toEqual({ reference: "Patient" });
  });

  it("should include display when provided", () => {
    const ref = buildReference("Patient/123", "Jane Doe");
    expect(ref.display).toBe("Jane Doe");
  });
});

describe("buildPeriod", () => {
  it("should build with start and end", () => {
    const period = buildPeriod("2024-01-01", "2024-12-31");
    expect(period).toEqual({ start: "2024-01-01", end: "2024-12-31" });
  });

  it("should build open-ended with start only", () => {
    const period = buildPeriod("2024-01-01");
    expect(period).toEqual({ start: "2024-01-01" });
    expect(period).not.toHaveProperty("end");
  });

  it("should build empty period", () => {
    const period = buildPeriod();
    expect(period).toEqual({});
  });
});

describe("buildQuantity", () => {
  it("should build with value and unit", () => {
    const q = buildQuantity(120, "mmHg");
    expect(q).toEqual({ value: 120, unit: "mmHg" });
  });

  it("should use UCUM system when code looks like a UCUM code", () => {
    const q = buildQuantity(120, "mmHg", "mm[Hg]");
    expect(q).toEqual({
      value: 120,
      unit: "mmHg",
      system: CodeSystems.UCUM,
      code: "mm[Hg]",
    });
  });

  it("should use custom system when it looks like a URI", () => {
    const q = buildQuantity(5, "tablets", "http://custom.org");
    expect(q).toEqual({
      value: 5,
      unit: "tablets",
      system: "http://custom.org",
    });
  });

  it("should handle explicit system and code", () => {
    const q = buildQuantity(120, "mmHg", CodeSystems.UCUM, "mm[Hg]");
    expect(q).toEqual({
      value: 120,
      unit: "mmHg",
      system: CodeSystems.UCUM,
      code: "mm[Hg]",
    });
  });
});

describe("cleanObject", () => {
  it("should remove undefined values", () => {
    const obj = { a: 1, b: undefined, c: "hello" };
    expect(cleanObject(obj)).toEqual({ a: 1, c: "hello" });
  });

  it("should remove null values", () => {
    const obj = { a: 1, b: null, c: "hello" };
    expect(cleanObject(obj)).toEqual({ a: 1, c: "hello" });
  });

  it("should keep falsy values that are not undefined/null", () => {
    const obj = { a: 0, b: false, c: "", d: undefined };
    expect(cleanObject(obj)).toEqual({ a: 0, b: false, c: "" });
  });

  it("should return empty object from all-undefined input", () => {
    const obj = { a: undefined, b: null };
    expect(cleanObject(obj)).toEqual({});
  });
});
