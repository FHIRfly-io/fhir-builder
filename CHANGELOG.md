# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-06

### Added

- **Validation in `build()`** — required fields are now validated before building. Missing fields throw `ValidationError` with structured error details.
- **`BuilderError`** base error class and **`ValidationError`** for build-time validation failures.
- **`ValidationIssue`** interface for structured error reporting.
- **`buildDosage()`** helper function — shared dosage construction logic.
- **`Dosage`** type exported from `types.ts` (previously internal to MedicationStatementBuilder).
- **Choice type mutual exclusion** — setting one variant of a choice type (e.g., `onsetDateTime`) automatically clears conflicting variants (e.g., `onsetAge`, `onsetPeriod`).
- **`SECURITY.md`** — vulnerability reporting policy.
- **`CHANGELOG.md`** — this file.
- Test coverage configuration with `@vitest/coverage-v8`.

### Changed

- **Node.js requirement** raised from 18 to **22** (`.nvmrc`, `engines`, `tsup` target).
- **`build()`** now throws `ValidationError` instead of silently producing invalid resources when required fields are missing.
- `Dosage` type moved from `medication-statement-builder.ts` to `types.ts` for shared use.
- `MedicationStatementBuilder.dosage()` and `MedicationRequestBuilder.dosageInstruction()` now use shared `buildDosage()` helper.

### Fixed

- Empty `subject.reference` no longer silently passes through `build()`.
- Conflicting choice type fields (e.g., both `onsetDateTime` and `onsetAge`) can no longer coexist in built resources.

## [0.1.0] - 2026-03-27

### Added

- Initial release with 13 fluent FHIR R4 resource builders.
- Patient, Encounter, Coverage, Observation, Condition, DiagnosticReport, MedicationStatement, MedicationRequest, AllergyIntolerance, Immunization, Procedure, ExplanationOfBenefit, Bundle.
- Bundle builder with automatic reference resolution.
- US Core extensions (race, ethnicity, birth sex).
- Common code system URIs via `CodeSystems` constant.
- Helper functions for FHIR data types.
- Zero runtime dependencies.
- Dual ESM/CJS output.
