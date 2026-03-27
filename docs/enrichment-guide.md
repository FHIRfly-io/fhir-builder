# Enrichment Guide

Resources built with `@fhirfly-io/fhir-builder` are structurally valid FHIR R4 JSON on their own. Enrichment adds **display names**, **alternative codings**, and **crosswalks** — making resources more useful for clinical and interoperability purposes.

Enrichment is always optional. Your resources are valid without it.

## Setup

Enrichment uses [`@fhirfly-io/terminology`](https://www.npmjs.com/package/@fhirfly-io/terminology), a separate npm package that connects to the FHIRfly terminology API.

```bash
npm install @fhirfly-io/fhir-builder @fhirfly-io/terminology
```

```typescript
import { FHIRBuilder } from '@fhirfly-io/fhir-builder';
import { Fhirfly } from '@fhirfly-io/terminology';

const fb = new FHIRBuilder();
const api = new Fhirfly({ apiKey: process.env.FHIRFLY_KEY });
```

Sign up for a free API key at [fhirfly.io](https://fhirfly.io).

## Enrichment by Resource Type

### Medications: NDC to RxNorm Crosswalk

This is the most common enrichment pattern. An NDC code alone is valid but lacks a display name and RxNorm crosswalk:

**Without enrichment:**

```typescript
const med = fb.medicationStatement()
  .medicationByNDC('0069-0151-01')
  .status('active')
  .subject('Patient/123')
  .build();
// Result: { medicationCodeableConcept: { coding: [{ system: "http://hl7.org/fhir/sid/ndc", code: "0069-0151-01" }] } }
```

**With enrichment:**

```typescript
const ndc = await api.ndc.lookup('0069-0151-01');

const med = fb.medicationStatement()
  .medicationByNDC('0069-0151-01', ndc.display?.full_name)
  .addCoding(ndc.fhir_coding.rxnorm)     // adds RxNorm crosswalk
  .status('active')
  .subject('Patient/123')
  .build();
// Result: { medicationCodeableConcept: { coding: [
//   { system: "http://hl7.org/fhir/sid/ndc", code: "0069-0151-01", display: "Lipitor 10mg Tablet" },
//   { system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "617312", display: "atorvastatin calcium 10 MG Oral Tablet [Lipitor]" }
// ] } }
```

### Conditions: ICD-10 to SNOMED Crosswalk

```typescript
// Without enrichment
const condition = fb.condition()
  .icd10('E11.9')
  .subject('Patient/123')
  .build();

// With enrichment
const icd = await api.icd10.lookup('E11.9');

const condition = fb.condition()
  .icd10('E11.9', icd.display?.short_name)
  .subject('Patient/123')
  .build();
```

### Observations: LOINC Display Names

```typescript
// Without enrichment
const obs = fb.observation()
  .loincCode('85354-9')
  .subject('Patient/123')
  .build();

// With enrichment
const loinc = await api.loinc.lookup('85354-9');

const obs = fb.observation()
  .loincCode('85354-9', loinc.display?.long_common_name)
  .subject('Patient/123')
  .build();
```

### Immunizations: CVX with MVX Manufacturer

```typescript
// Without enrichment
const imm = fb.immunization()
  .cvxCode('207')
  .patient('Patient/123')
  .occurrenceDateTime('2024-01-15')
  .build();

// With enrichment
const cvx = await api.cvx.lookup('207');

const imm = fb.immunization()
  .cvxCode('207', cvx.display?.short_description)
  .addCoding({ system: 'http://hl7.org/fhir/sid/mvx', code: 'MOD', display: 'Moderna US, Inc.' })
  .patient('Patient/123')
  .occurrenceDateTime('2024-01-15')
  .build();
```

### Procedures: CPT/HCPCS Display Names

```typescript
const proc = fb.procedure()
  .cptCode('27447')
  .subject('Patient/123')
  .build();

// With enrichment — add display name from the terminology API
const hcpcs = await api.hcpcs.lookup('27447');

const proc = fb.procedure()
  .cptCode('27447', hcpcs.display?.short_description)
  .subject('Patient/123')
  .build();
```

## Batch Enrichment

When processing multiple resources, look up codes in batch to reduce API calls:

```typescript
// Collect all NDC codes from your source data
const ndcCodes = sourceData.map(item => item.ndcCode);

// Batch lookup (up to 500 per call)
const ndcResults = await api.ndc.lookupMany(ndcCodes);

// Build enriched resources
const medications = sourceData.map((item, i) => {
  const ndc = ndcResults[i];
  const builder = fb.medicationStatement()
    .medicationByNDC(item.ndcCode, ndc?.display?.full_name)
    .status('active')
    .subject(`Patient/${item.patientId}`);

  // Add RxNorm crosswalk if available
  if (ndc?.fhir_coding?.rxnorm) {
    builder.addCoding(ndc.fhir_coding.rxnorm);
  }

  return builder.build();
});
```

Batch limits vary by endpoint: NDC supports 500, most others support 100. See the [`@fhirfly-io/terminology` docs](https://www.npmjs.com/package/@fhirfly-io/terminology) for details.

## The `fhir_coding` Field

The FHIRfly terminology API returns a `fhir_coding` field on many responses. This field is already in FHIR `Coding` format — ready to use directly with `.addCoding()`:

```typescript
const ndc = await api.ndc.lookup('0069-0151-01');

// ndc.fhir_coding = {
//   ndc:    { system: "http://hl7.org/fhir/sid/ndc", code: "0069-0151-01", display: "..." },
//   rxnorm: { system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "617312", display: "..." }
// }

builder.addCoding(ndc.fhir_coding.rxnorm);  // Works directly — no mapping needed
```

This is by design. The API returns data in the exact shape the builder expects.

## Offline-First, Enrich When Ready

A common pattern is to build all resources offline first, then optionally run an enrichment pass when an API key is available:

```typescript
import { FHIRBuilder } from '@fhirfly-io/fhir-builder';

const fb = new FHIRBuilder();

// Step 1: Build resources offline (always works, no API needed)
function buildResources(rawData) {
  return rawData.map(item => fb.medicationStatement()
    .medicationByNDC(item.ndcCode)
    .status(item.status)
    .subject(`Patient/${item.patientId}`)
    .build()
  );
}

// Step 2: Optionally enrich (only if API key is configured)
async function enrichResources(resources, api) {
  const ndcCodes = resources
    .map(r => r.medicationCodeableConcept?.coding?.[0]?.code)
    .filter(Boolean);

  const lookups = await api.ndc.lookupMany(ndcCodes);

  return resources.map((resource, i) => {
    const lookup = lookups[i];
    if (!lookup) return resource;

    // Add display name to existing coding
    if (resource.medicationCodeableConcept?.coding?.[0]) {
      resource.medicationCodeableConcept.coding[0].display = lookup.display?.full_name;
    }

    // Add RxNorm crosswalk
    if (lookup.fhir_coding?.rxnorm) {
      resource.medicationCodeableConcept.coding.push(lookup.fhir_coding.rxnorm);
    }

    return resource;
  });
}

// Step 3: Use
const resources = buildResources(rawData);

if (process.env.FHIRFLY_KEY) {
  const api = new Fhirfly({ apiKey: process.env.FHIRFLY_KEY });
  await enrichResources(resources, api);
}

// Step 4: Bundle
const bundle = fb.bundle('transaction')
  .add(...resources)
  .resolveReferences()
  .build();
```

## What Enrichment Adds

| Resource | Without Enrichment | With Enrichment |
|----------|-------------------|-----------------|
| MedicationStatement | NDC code only | + display name + RxNorm crosswalk |
| Condition | ICD-10 code only | + display name |
| Observation | LOINC code only | + long common name |
| Immunization | CVX code only | + vaccine name + MVX manufacturer |
| Procedure | CPT/HCPCS code only | + description |
| AllergyIntolerance | SNOMED/RxNorm code | + display name |

Enrichment makes your FHIR resources more readable and interoperable — but is never required for structural validity.
