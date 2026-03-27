# Getting Started

This guide walks you through building FHIR R4 resources with `@fhirfly-io/fhir-builder`.

## Installation

```bash
npm install @fhirfly-io/fhir-builder
```

```bash
yarn add @fhirfly-io/fhir-builder
```

```bash
pnpm add @fhirfly-io/fhir-builder
```

**Requirements:** Node.js 18 or later. Zero runtime dependencies.

## Creating Your First Resource

Every resource starts with a builder, accessed through `FHIRBuilder` or directly:

```typescript
import { FHIRBuilder } from '@fhirfly-io/fhir-builder';

const fb = new FHIRBuilder();

const patient = fb.patient()
  .name('Jane', 'Doe')
  .dob('1990-01-15')
  .gender('female')
  .mrn('12345', 'http://my-hospital.org/mrn')
  .telecom('phone', '555-0100', 'home')
  .address({ line: '123 Main St', city: 'Springfield', state: 'IL', postalCode: '62701' })
  .build();

console.log(JSON.stringify(patient, null, 2));
```

Output:

```json
{
  "resourceType": "Patient",
  "id": "a1b2c3d4-...",
  "name": [{ "family": "Doe", "given": ["Jane"] }],
  "birthDate": "1990-01-15",
  "gender": "female",
  "identifier": [{ "type": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR" }] }, "system": "http://my-hospital.org/mrn", "value": "12345" }],
  "telecom": [{ "system": "phone", "value": "555-0100", "use": "home" }],
  "address": [{ "line": ["123 Main St"], "city": "Springfield", "state": "IL", "postalCode": "62701" }]
}
```

Key points:
- `.build()` returns a plain JavaScript object — valid FHIR R4 JSON.
- A UUID is auto-generated if you don't call `.id()`.
- Every setter returns `this`, so you can chain freely.

## Adding Clinical Data

Use `CodeSystems` constants instead of hardcoding URIs:

```typescript
import { FHIRBuilder, CodeSystems } from '@fhirfly-io/fhir-builder';

const fb = new FHIRBuilder();

// Blood pressure observation with LOINC code
const bp = fb.observation()
  .loincCode('85354-9', 'Blood pressure panel')
  .status('final')
  .subject('Patient/patient-1')
  .effectiveDateTime('2024-01-15T10:30:00Z')
  .component('8480-6', CodeSystems.LOINC, { quantity: { value: 120, unit: 'mmHg' } }, 'Systolic')
  .component('8462-4', CodeSystems.LOINC, { quantity: { value: 80, unit: 'mmHg' } }, 'Diastolic')
  .build();

// Condition with ICD-10 shorthand
const diabetes = fb.condition()
  .icd10('E11.9', 'Type 2 diabetes mellitus, without complications')
  .clinicalStatus('active')
  .subject('Patient/patient-1')
  .onsetDateTime('2020-06-15')
  .build();

// Medication with NDC code
const metformin = fb.medicationStatement()
  .medicationByNDC('0093-7214-01', 'Metformin 500mg')
  .status('active')
  .subject('Patient/patient-1')
  .dosage({ text: '500mg twice daily', route: { code: '26643006', display: 'Oral' } })
  .build();
```

Shorthand methods like `.loincCode()`, `.icd10()`, `.medicationByNDC()` set both the code and the correct system URI automatically.

## Building a Bundle

The `BundleBuilder` ties resources together and resolves internal references:

```typescript
const fb = new FHIRBuilder();

// Build individual resources
const patient = fb.patient()
  .id('patient-1')
  .name('Jane', 'Doe')
  .gender('female')
  .build();

const encounter = fb.encounter()
  .id('enc-1')
  .status('finished')
  .encounterClass('AMB')
  .subject('Patient/patient-1')
  .build();

const observation = fb.observation()
  .id('obs-1')
  .loincCode('85354-9', 'Blood pressure')
  .subject('Patient/patient-1')
  .encounter('Encounter/enc-1')
  .valueQuantity(120, 'mmHg')
  .build();

// Bundle them into a transaction
const bundle = fb.bundle('transaction')
  .add(patient)
  .add(encounter)
  .add(observation)
  .resolveReferences()
  .build();
```

After `.resolveReferences()`, the observation's `subject.reference` is rewritten from `Patient/patient-1` to `urn:uuid:patient-1` — matching the patient entry's `fullUrl`. This is the correct format for FHIR transaction bundles.

Convenience shortcuts:

```typescript
// Transaction bundle (most common)
const txn = fb.transactionBundle();

// Collection bundle pre-populated with resources
const collection = fb.collectionBundle(patient, encounter, observation);

// Document bundle (Composition must be first)
const doc = fb.documentBundle(composition, patient, encounter);
```

## US Core Extensions

The Patient builder has built-in support for US Core extensions:

```typescript
const patient = fb.patient()
  .name('Maria', 'Garcia')
  .gender('female')
  .race('2106-3', undefined, 'White')
  .ethnicity('2135-2', undefined, 'Hispanic or Latino')
  .birthSex('F')
  .build();
```

When you use any US Core extension, the builder automatically adds the US Core Patient profile to `meta.profile`.

## Code System URIs

The `CodeSystems` constant provides all common FHIR code system URIs:

```typescript
import { CodeSystems } from '@fhirfly-io/fhir-builder';

CodeSystems.LOINC      // "http://loinc.org"
CodeSystems.SNOMED     // "http://snomed.info/sct"
CodeSystems.ICD10CM    // "http://hl7.org/fhir/sid/icd-10-cm"
CodeSystems.NDC        // "http://hl7.org/fhir/sid/ndc"
CodeSystems.RXNORM     // "http://www.nlm.nih.gov/research/umls/rxnorm"
CodeSystems.CVX        // "http://hl7.org/fhir/sid/cvx"
CodeSystems.CPT        // "http://www.ama-assn.org/go/cpt"
CodeSystems.HCPCS      // "https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets"
CodeSystems.UCUM       // "http://unitsofmeasure.org"
// ... and more (see API Reference)
```

Use these with the generic `.code()` method when a shorthand isn't available:

```typescript
fb.observation()
  .code('29463-7', CodeSystems.LOINC, 'Body weight')
  // equivalent to:
  .loincCode('29463-7', 'Body weight')
```

## Direct Builder Imports

You can also import builders directly without `FHIRBuilder`:

```typescript
import { PatientBuilder, ObservationBuilder } from '@fhirfly-io/fhir-builder';

const patient = new PatientBuilder().name('Jane', 'Doe').build();
const obs = new ObservationBuilder().loincCode('85354-9').build();
```

## Next Steps

- [API Reference](api-reference.md) — all builders, methods, and types
- [Enrichment Guide](enrichment-guide.md) — add display names and crosswalks with `@fhirfly-io/terminology`
- [Validation Guide](validation-guide.md) — validate resources against FHIR profiles
