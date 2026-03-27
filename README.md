# @fhirfly-io/fhir-builder

[![npm version](https://img.shields.io/npm/v/@fhirfly-io/fhir-builder.svg)](https://www.npmjs.com/package/@fhirfly-io/fhir-builder)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Build valid FHIR R4 resources in TypeScript with a fluent API. No server required. Works entirely offline.

## Quick Start

```bash
npm install @fhirfly-io/fhir-builder
```

```typescript
import { FHIRBuilder } from '@fhirfly-io/fhir-builder';

const fb = new FHIRBuilder();

const patient = fb.patient()
  .name('Jane', 'Doe')
  .dob('1990-01-15')
  .gender('female')
  .mrn('12345', 'http://my-hospital.org/mrn')
  .build();
```

## Features

- Fluent builder API for 12+ FHIR R4 resource types
- Bundle builder with automatic reference resolution
- US Core extensions (race, ethnicity, birth sex) built correctly out of the box
- Common code system URIs baked in (LOINC, SNOMED, ICD-10, NDC, RxNorm, CVX, HCPCS, CPT)
- Zero runtime dependencies
- Full TypeScript support with strict types

## Supported Resources

| Resource | Builder | Common Code Systems |
|----------|---------|-------------------|
| Patient | `fb.patient()` | — |
| Observation | `fb.observation()` | LOINC, UCUM |
| Condition | `fb.condition()` | ICD-10, SNOMED |
| MedicationStatement | `fb.medicationStatement()` | NDC, RxNorm |
| MedicationRequest | `fb.medicationRequest()` | NDC, RxNorm |
| AllergyIntolerance | `fb.allergyIntolerance()` | SNOMED, RxNorm |
| Immunization | `fb.immunization()` | CVX, MVX |
| Procedure | `fb.procedure()` | SNOMED, HCPCS, CPT |
| Encounter | `fb.encounter()` | ActCode |
| Coverage | `fb.coverage()` | — |
| ExplanationOfBenefit | `fb.explanationOfBenefit()` | HCPCS, CPT, NDC |
| DiagnosticReport | `fb.diagnosticReport()` | LOINC |
| Bundle | `fb.bundle()` | — |

## Enrichment (Optional)

Resources built with `@fhirfly-io/fhir-builder` are structurally valid on their own. For richer output — display names, crosswalks, and additional FHIR Codings — pair with [`@fhirfly-io/terminology`](https://www.npmjs.com/package/@fhirfly-io/terminology):

```typescript
import { FHIRBuilder } from '@fhirfly-io/fhir-builder';
import { Fhirfly } from '@fhirfly-io/terminology';

const fb = new FHIRBuilder();
const api = new Fhirfly({ apiKey: process.env.FHIRFLY_KEY });

// Look up the NDC code
const ndc = await api.ndc.lookup('0069-0151-01');

// Build an enriched medication statement
const med = fb.medicationStatement()
  .medicationByNDC('0069-0151-01', ndc.display)
  .addCoding(ndc.fhir_coding.rxnorm)
  .status('active')
  .subject(patient)
  .build();
```

Without enrichment, you get a valid code with system and code. With enrichment, you also get display names and crosswalked codings from RxNorm, SNOMED, and more.

See the [Enrichment Guide](docs/enrichment-guide.md) for detailed examples.

## Validation

This library produces valid FHIR R4 JSON by construction. For full profile validation (US Core, IPS, custom IGs), use the [HL7 FHIR Validator](https://github.com/hapifhir/org.hl7.fhir.core/releases/latest/download/validator_cli.jar):

```bash
java -jar validator_cli.jar resource.json -version 4.0.1 -ig hl7.fhir.us.core#6.1.0
```

See the [Validation Guide](docs/validation-guide.md) for more examples.

## Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Enrichment Guide](docs/enrichment-guide.md)
- [Validation Guide](docs/validation-guide.md)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
