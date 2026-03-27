// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Main entry point for building FHIR R4 resources.
 *
 * ```typescript
 * const fb = new FHIRBuilder();
 * const patient = fb.patient().name('Jane', 'Doe').gender('female').build();
 * ```
 */
export class FHIRBuilder {
  // Resource builders will be added as methods here in subsequent tasks.
  // Each returns a fluent builder instance for that resource type.
  //
  // Planned:
  //   fb.patient()              → PatientBuilder
  //   fb.observation()          → ObservationBuilder
  //   fb.condition()            → ConditionBuilder
  //   fb.medicationStatement()  → MedicationStatementBuilder
  //   fb.medicationRequest()    → MedicationRequestBuilder
  //   fb.allergyIntolerance()   → AllergyIntoleranceBuilder
  //   fb.immunization()         → ImmunizationBuilder
  //   fb.procedure()            → ProcedureBuilder
  //   fb.encounter()            → EncounterBuilder
  //   fb.coverage()             → CoverageBuilder
  //   fb.explanationOfBenefit() → ExplanationOfBenefitBuilder
  //   fb.diagnosticReport()     → DiagnosticReportBuilder
  //   fb.bundle()               → BundleBuilder
}
