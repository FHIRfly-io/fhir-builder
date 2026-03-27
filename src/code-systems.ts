// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Common FHIR code system URIs.
 *
 * Use these constants instead of hardcoding URI strings:
 * ```typescript
 * import { CodeSystems } from '@fhirfly-io/fhir-builder';
 * // CodeSystems.NDC === 'http://hl7.org/fhir/sid/ndc'
 * ```
 */
export const CodeSystems = {
  /** National Drug Code (NDC) */
  NDC: "http://hl7.org/fhir/sid/ndc",

  /** RxNorm (NLM) */
  RXNORM: "http://www.nlm.nih.gov/research/umls/rxnorm",

  /** LOINC (Logical Observation Identifiers Names and Codes) */
  LOINC: "http://loinc.org",

  /** SNOMED CT (Systematized Nomenclature of Medicine) */
  SNOMED: "http://snomed.info/sct",

  /** ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification) */
  ICD10CM: "http://hl7.org/fhir/sid/icd-10-cm",

  /** ICD-10-PCS (International Classification of Diseases, 10th Revision, Procedure Coding System) */
  ICD10PCS: "http://www.cms.gov/Medicare/Coding/ICD10",

  /** CVX (Vaccine Administered code set) */
  CVX: "http://hl7.org/fhir/sid/cvx",

  /** MVX (Vaccine Manufacturer code set) */
  MVX: "http://hl7.org/fhir/sid/mvx",

  /** CPT (Current Procedural Terminology) */
  CPT: "http://www.ama-assn.org/go/cpt",

  /** HCPCS (Healthcare Common Procedure Coding System) */
  HCPCS: "https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets",

  /** UCUM (Unified Code for Units of Measure) */
  UCUM: "http://unitsofmeasure.org",

  /** HL7 ActCode (encounter class, coverage type, etc.) */
  ACT_CODE: "http://terminology.hl7.org/CodeSystem/v3-ActCode",

  /** HL7 Observation Category */
  OBSERVATION_CATEGORY:
    "http://terminology.hl7.org/CodeSystem/observation-category",

  /** HL7 Condition Category */
  CONDITION_CATEGORY:
    "http://terminology.hl7.org/CodeSystem/condition-category",

  /** HL7 Condition Clinical Status */
  CONDITION_CLINICAL:
    "http://terminology.hl7.org/CodeSystem/condition-clinical",

  /** HL7 Condition Verification Status */
  CONDITION_VERIFICATION:
    "http://terminology.hl7.org/CodeSystem/condition-ver-status",

  /** HL7 Allergy Intolerance Clinical Status */
  ALLERGY_CLINICAL:
    "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",

  /** HL7 Allergy Intolerance Verification Status */
  ALLERGY_VERIFICATION:
    "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",

  /** HL7 Identifier Type */
  IDENTIFIER_TYPE: "http://terminology.hl7.org/CodeSystem/v2-0203",

  /** US Core Race Extension */
  US_CORE_RACE: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",

  /** US Core Ethnicity Extension */
  US_CORE_ETHNICITY:
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",

  /** US Core Birth Sex Extension */
  US_CORE_BIRTH_SEX:
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",

  /** US Core Gender Identity Extension */
  US_CORE_GENDER_IDENTITY:
    "http://hl7.org/fhir/us/core/StructureDefinition/us-core-genderIdentity",

  /** CDC Race & Ethnicity */
  CDC_RACE_ETHNICITY: "urn:oid:2.16.840.1.113883.6.238",

  /** US Core Patient Profile */
  US_CORE_PATIENT: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
} as const;

export type CodeSystem = (typeof CodeSystems)[keyof typeof CodeSystems];
