// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  PatientBuilder,
  FHIRBuilder,
  CodeSystems,
} from "../src/index.js";

describe("PatientBuilder", () => {
  it("should create a Patient resource with resourceType", () => {
    const patient = new PatientBuilder().build();
    expect(patient.resourceType).toBe("Patient");
    expect(patient.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.patient()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.patient();
    expect(builder).toBeInstanceOf(PatientBuilder);
    const patient = builder.build();
    expect(patient.resourceType).toBe("Patient");
  });

  // --- Name ---

  it("should add a name from strings", () => {
    const patient = new PatientBuilder()
      .name("Jane", "Doe")
      .build();
    expect(patient.name).toHaveLength(1);
    expect(patient.name?.[0]?.given).toEqual(["Jane"]);
    expect(patient.name?.[0]?.family).toBe("Doe");
  });

  it("should add a name with use", () => {
    const patient = new PatientBuilder()
      .name("Jane", "Doe", "official")
      .build();
    expect(patient.name?.[0]?.use).toBe("official");
  });

  it("should add a name from HumanNameInput object", () => {
    const patient = new PatientBuilder()
      .nameObject({
        given: ["Jane", "Marie"],
        family: "Doe",
        prefix: "Dr.",
        suffix: ["MD", "PhD"],
        use: "official",
      })
      .build();
    expect(patient.name?.[0]?.given).toEqual(["Jane", "Marie"]);
    expect(patient.name?.[0]?.prefix).toEqual(["Dr."]);
    expect(patient.name?.[0]?.suffix).toEqual(["MD", "PhD"]);
  });

  it("should support multiple names", () => {
    const patient = new PatientBuilder()
      .name("Jane", "Doe", "official")
      .name("Jenny", "Doe", "nickname")
      .build();
    expect(patient.name).toHaveLength(2);
  });

  // --- Demographics ---

  it("should set date of birth", () => {
    const patient = new PatientBuilder()
      .dob("1990-05-15")
      .build();
    expect(patient.birthDate).toBe("1990-05-15");
  });

  it("should set gender", () => {
    const patient = new PatientBuilder()
      .gender("female")
      .build();
    expect(patient.gender).toBe("female");
  });

  it("should set active status", () => {
    const patient = new PatientBuilder()
      .active(true)
      .build();
    expect(patient.active).toBe(true);
  });

  // --- Identifiers ---

  it("should add an MRN identifier", () => {
    const patient = new PatientBuilder()
      .mrn("12345", "http://hospital.org/mrn")
      .build();
    expect(patient.identifier).toHaveLength(1);
    expect(patient.identifier?.[0]?.value).toBe("12345");
    expect(patient.identifier?.[0]?.system).toBe("http://hospital.org/mrn");
    expect(patient.identifier?.[0]?.type?.coding?.[0]?.code).toBe("MR");
    expect(patient.identifier?.[0]?.type?.coding?.[0]?.system).toBe(
      CodeSystems.IDENTIFIER_TYPE
    );
  });

  it("should add a generic identifier", () => {
    const patient = new PatientBuilder()
      .identifier("SSN-123", "http://hl7.org/fhir/sid/us-ssn", "SS")
      .build();
    expect(patient.identifier?.[0]?.value).toBe("SSN-123");
    expect(patient.identifier?.[0]?.type?.coding?.[0]?.code).toBe("SS");
  });

  it("should support multiple identifiers", () => {
    const patient = new PatientBuilder()
      .mrn("12345", "http://hospital.org/mrn")
      .identifier("SSN-123", "http://hl7.org/fhir/sid/us-ssn")
      .build();
    expect(patient.identifier).toHaveLength(2);
  });

  // --- Contact Info ---

  it("should add telecom entries", () => {
    const patient = new PatientBuilder()
      .telecom("phone", "555-0100", "home")
      .telecom("email", "jane@example.com", "work")
      .build();
    expect(patient.telecom).toHaveLength(2);
    expect(patient.telecom?.[0]).toEqual({
      system: "phone",
      value: "555-0100",
      use: "home",
    });
    expect(patient.telecom?.[1]?.system).toBe("email");
  });

  it("should add an address", () => {
    const patient = new PatientBuilder()
      .address({
        line: "123 Main St",
        city: "Springfield",
        state: "IL",
        postalCode: "62701",
        country: "US",
        use: "home",
      })
      .build();
    expect(patient.address).toHaveLength(1);
    expect(patient.address?.[0]?.line).toEqual(["123 Main St"]);
    expect(patient.address?.[0]?.city).toBe("Springfield");
    expect(patient.address?.[0]?.use).toBe("home");
  });

  it("should handle address with array line", () => {
    const patient = new PatientBuilder()
      .address({ line: ["123 Main St", "Apt 4"] })
      .build();
    expect(patient.address?.[0]?.line).toEqual(["123 Main St", "Apt 4"]);
  });

  // --- Marital Status / Deceased / MultipleBirth ---

  it("should set marital status", () => {
    const patient = new PatientBuilder()
      .maritalStatus("M", undefined, "Married")
      .build();
    expect(patient.maritalStatus?.coding?.[0]?.code).toBe("M");
    expect(patient.maritalStatus?.coding?.[0]?.system).toContain(
      "MaritalStatus"
    );
  });

  it("should set deceased boolean", () => {
    const patient = new PatientBuilder().deceased(false).build();
    expect(patient.deceasedBoolean).toBe(false);
  });

  it("should set deceased dateTime", () => {
    const patient = new PatientBuilder()
      .deceased("2024-06-15")
      .build();
    expect(patient.deceasedDateTime).toBe("2024-06-15");
  });

  it("should set multipleBirth boolean", () => {
    const patient = new PatientBuilder().multipleBirth(true).build();
    expect(patient.multipleBirthBoolean).toBe(true);
  });

  it("should set multipleBirth integer", () => {
    const patient = new PatientBuilder().multipleBirth(2).build();
    expect(patient.multipleBirthInteger).toBe(2);
  });

  // --- Contact Person ---

  it("should add a contact person", () => {
    const patient = new PatientBuilder()
      .contact({
        name: { given: "John", family: "Doe" },
        relationship: { code: "N", display: "Next of Kin" },
        telecom: [{ system: "phone", value: "555-0200", use: "home" }],
        gender: "male",
      })
      .build();
    expect(patient.contact).toHaveLength(1);
    expect(patient.contact?.[0]?.name?.family).toBe("Doe");
    expect(patient.contact?.[0]?.relationship?.[0]?.coding?.[0]?.code).toBe("N");
    expect(patient.contact?.[0]?.telecom?.[0]?.value).toBe("555-0200");
    expect(patient.contact?.[0]?.gender).toBe("male");
  });

  // --- Communication ---

  it("should add a communication language", () => {
    const patient = new PatientBuilder()
      .communication("en", true, "English")
      .build();
    expect(patient.communication).toHaveLength(1);
    expect(patient.communication?.[0]?.language.coding?.[0]?.code).toBe("en");
    expect(patient.communication?.[0]?.preferred).toBe(true);
  });

  it("should add multiple languages", () => {
    const patient = new PatientBuilder()
      .communication("en", true, "English")
      .communication("es", false, "Spanish")
      .build();
    expect(patient.communication).toHaveLength(2);
  });

  // --- References ---

  it("should add general practitioner", () => {
    const patient = new PatientBuilder()
      .generalPractitioner("Practitioner/dr-smith", "Dr. Smith")
      .build();
    expect(patient.generalPractitioner).toHaveLength(1);
    expect(patient.generalPractitioner?.[0]?.reference).toBe(
      "Practitioner/dr-smith"
    );
    expect(patient.generalPractitioner?.[0]?.display).toBe("Dr. Smith");
  });

  it("should set managing organization", () => {
    const patient = new PatientBuilder()
      .managingOrganization("Organization/hosp-1")
      .build();
    expect(patient.managingOrganization?.reference).toBe("Organization/hosp-1");
  });

  // --- US Core Extensions ---

  it("should build US Core Race extension correctly", () => {
    const patient = new PatientBuilder()
      .race("2106-3", undefined, "White")
      .build();

    const raceExt = patient.extension?.find(
      (e) => e.url === CodeSystems.US_CORE_RACE
    );
    expect(raceExt).toBeDefined();
    expect(raceExt?.extension).toHaveLength(2); // ombCategory + text

    const omb = raceExt?.extension?.find((e) => e.url === "ombCategory");
    expect(omb?.valueCoding?.system).toBe(CodeSystems.CDC_RACE_ETHNICITY);
    expect(omb?.valueCoding?.code).toBe("2106-3");

    const text = raceExt?.extension?.find((e) => e.url === "text");
    expect(text?.valueString).toBe("White");
  });

  it("should build US Core Race extension with detailed race", () => {
    const patient = new PatientBuilder()
      .race("2106-3", "2108-9", "White - European")
      .build();

    const raceExt = patient.extension?.find(
      (e) => e.url === CodeSystems.US_CORE_RACE
    );
    expect(raceExt?.extension).toHaveLength(3); // ombCategory + detailed + text

    const detailed = raceExt?.extension?.find((e) => e.url === "detailed");
    expect(detailed?.valueCoding?.code).toBe("2108-9");
  });

  it("should build US Core Ethnicity extension correctly", () => {
    const patient = new PatientBuilder()
      .ethnicity("2135-2", undefined, "Hispanic or Latino")
      .build();

    const ethExt = patient.extension?.find(
      (e) => e.url === CodeSystems.US_CORE_ETHNICITY
    );
    expect(ethExt).toBeDefined();

    const omb = ethExt?.extension?.find((e) => e.url === "ombCategory");
    expect(omb?.valueCoding?.code).toBe("2135-2");

    const text = ethExt?.extension?.find((e) => e.url === "text");
    expect(text?.valueString).toBe("Hispanic or Latino");
  });

  it("should build US Core Birth Sex extension correctly", () => {
    const patient = new PatientBuilder().birthSex("F").build();
    const bsExt = patient.extension?.find(
      (e) => e.url === CodeSystems.US_CORE_BIRTH_SEX
    );
    expect(bsExt?.valueCode).toBe("F");
  });

  it("should build US Core Gender Identity extension correctly", () => {
    const patient = new PatientBuilder()
      .genderIdentity("non-binary")
      .build();
    const giExt = patient.extension?.find(
      (e) => e.url === CodeSystems.US_CORE_GENDER_IDENTITY
    );
    expect(giExt?.valueCodeableConcept?.coding?.[0]?.code).toBe("non-binary");
  });

  it("should auto-set US Core Patient profile when US Core extensions are used", () => {
    const patient = new PatientBuilder()
      .race("2106-3", undefined, "White")
      .build();
    expect(patient.meta?.profile).toContain(CodeSystems.US_CORE_PATIENT);
  });

  it("should NOT auto-set US Core profile when no US Core extensions used", () => {
    const patient = new PatientBuilder()
      .name("Jane", "Doe")
      .build();
    expect(patient.meta?.profile).toBeUndefined();
  });

  it("should NOT override manually set profile", () => {
    const patient = new PatientBuilder()
      .meta("http://custom-profile.com/patient")
      .race("2106-3", undefined, "White")
      .build();
    expect(patient.meta?.profile).toEqual(["http://custom-profile.com/patient"]);
  });

  // --- Fluent Chaining ---

  it("should support full fluent chaining", () => {
    const patient = new PatientBuilder()
      .id("patient-001")
      .name("Jane", "Doe", "official")
      .gender("female")
      .dob("1990-05-15")
      .mrn("12345", "http://hospital.org/mrn")
      .telecom("phone", "555-0100", "home")
      .telecom("email", "jane@example.com")
      .address({
        line: "123 Main St",
        city: "Springfield",
        state: "IL",
        postalCode: "62701",
        use: "home",
      })
      .race("2106-3", undefined, "White")
      .ethnicity("2186-5", undefined, "Non Hispanic or Latino")
      .birthSex("F")
      .communication("en", true, "English")
      .build();

    expect(patient.id).toBe("patient-001");
    expect(patient.resourceType).toBe("Patient");
    expect(patient.name).toHaveLength(1);
    expect(patient.gender).toBe("female");
    expect(patient.birthDate).toBe("1990-05-15");
    expect(patient.identifier).toHaveLength(1);
    expect(patient.telecom).toHaveLength(2);
    expect(patient.address).toHaveLength(1);
    expect(patient.extension).toHaveLength(3); // race + ethnicity + birthSex
    expect(patient.meta?.profile).toContain(CodeSystems.US_CORE_PATIENT);
    expect(patient.communication).toHaveLength(1);
  });

  // --- JSON Output ---

  it("toJSON should produce valid JSON", () => {
    const json = new PatientBuilder()
      .name("Jane", "Doe")
      .gender("female")
      .toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Patient");
    expect(parsed.name[0].family).toBe("Doe");
  });
});
