// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * @fhirfly-io/fhir-builder
 *
 * Fluent TypeScript builder for FHIR R4 resources.
 * Free, offline, open source.
 */

// Main entry point
export { FHIRBuilder } from "./builder.js";

// Base class for resource builders
export { ResourceBuilder } from "./resource-builder.js";

// Resource builders
export { PatientBuilder } from "./patient-builder.js";
export type {
  PatientResource,
  PatientContact,
  PatientCommunication,
} from "./patient-builder.js";

export { EncounterBuilder } from "./encounter-builder.js";
export type {
  EncounterResource,
  EncounterStatus,
  EncounterParticipant,
  EncounterHospitalization,
  EncounterLocation,
} from "./encounter-builder.js";

export { CoverageBuilder } from "./coverage-builder.js";
export type {
  CoverageResource,
  CoverageStatus,
  CoverageClass,
} from "./coverage-builder.js";

export { ObservationBuilder } from "./observation-builder.js";
export type {
  ObservationResource,
  ObservationStatus,
  ObservationComponent,
  ObservationReferenceRange,
} from "./observation-builder.js";

export { ConditionBuilder } from "./condition-builder.js";
export type {
  ConditionResource,
  ConditionClinicalStatus,
  ConditionVerificationStatus,
  ConditionStage,
  ConditionEvidence,
} from "./condition-builder.js";

export { DiagnosticReportBuilder } from "./diagnostic-report-builder.js";
export type {
  DiagnosticReportResource,
  DiagnosticReportStatus,
  PresentedForm,
} from "./diagnostic-report-builder.js";

export { MedicationStatementBuilder } from "./medication-statement-builder.js";
export type {
  MedicationStatementResource,
  MedicationStatementStatus,
  Dosage,
} from "./medication-statement-builder.js";

export { MedicationRequestBuilder } from "./medication-request-builder.js";
export type {
  MedicationRequestResource,
  MedicationRequestStatus,
  MedicationRequestIntent,
  MedicationRequestPriority,
  DispenseRequest,
  MedicationRequestSubstitution,
} from "./medication-request-builder.js";

export { AllergyIntoleranceBuilder } from "./allergy-intolerance-builder.js";
export type {
  AllergyIntoleranceResource,
  AllergyClinicalStatus,
  AllergyVerificationStatus,
  AllergyType,
  AllergyCategory,
  AllergyCriticality,
  AllergyReaction,
} from "./allergy-intolerance-builder.js";

export { ImmunizationBuilder } from "./immunization-builder.js";
export type {
  ImmunizationResource,
  ImmunizationStatus,
  ImmunizationPerformer,
  ImmunizationProtocolApplied,
} from "./immunization-builder.js";

export { ProcedureBuilder } from "./procedure-builder.js";
export type {
  ProcedureResource,
  ProcedureStatus,
  ProcedurePerformer,
} from "./procedure-builder.js";

export { ExplanationOfBenefitBuilder } from "./eob-builder.js";
export type {
  ExplanationOfBenefitResource,
  EOBStatus,
  EOBUse,
  EOBOutcome,
  EOBInsurance,
  EOBItem,
  EOBItemAdjudication,
  EOBTotal,
  EOBPayment,
  EOBCareTeam,
  EOBDiagnosis,
  EOBProcedure,
  EOBSupportingInfo,
  Money,
} from "./eob-builder.js";

// Code system constants
export { CodeSystems } from "./code-systems.js";
export type { CodeSystem } from "./code-systems.js";

// Helper functions
export {
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
} from "./helpers.js";

// Types
export type {
  Meta,
  Extension,
  Coding,
  CodeableConcept,
  HumanName,
  NameUse,
  Address,
  ContactPoint,
  Identifier,
  Reference,
  Period,
  Quantity,
  Range,
  Annotation,
  Narrative,
  Resource,
  AdministrativeGender,
  HumanNameInput,
  AddressInput,
  DosageInput,
} from "./types.js";
