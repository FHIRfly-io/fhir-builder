# Validation Guide

`@fhirfly-io/fhir-builder` produces structurally valid FHIR R4 JSON by construction. For **profile validation** (US Core, IPS, custom Implementation Guides), use external validators.

This guide covers the most common validation tools and how to use them with builder output.

## HL7 FHIR Validator (CLI)

The official HL7 validator is the gold standard for FHIR validation.

### Installation

Requires Java 11 or later.

```bash
curl -L -o validator_cli.jar \
  https://github.com/hapifhir/org.hl7.fhir.core/releases/latest/download/validator_cli.jar
```

### Validate a Single Resource

```bash
# Save a resource to a file
node -e "
  const { PatientBuilder } = require('@fhirfly-io/fhir-builder');
  const patient = new PatientBuilder()
    .name('Jane', 'Doe')
    .dob('1990-01-15')
    .gender('female')
    .build();
  require('fs').writeFileSync('patient.json', JSON.stringify(patient, null, 2));
"

# Validate against base FHIR R4
java -jar validator_cli.jar patient.json -version 4.0.1

# Validate against US Core 6.1.0
java -jar validator_cli.jar patient.json -version 4.0.1 -ig hl7.fhir.us.core#6.1.0
```

### Validate a Bundle

```bash
java -jar validator_cli.jar bundle.json -version 4.0.1 -ig hl7.fhir.us.core#6.1.0
```

The validator checks all resources within the bundle, including reference integrity.

### Common Flags

| Flag | Purpose |
|------|---------|
| `-version 4.0.1` | FHIR R4 |
| `-ig hl7.fhir.us.core#6.1.0` | Load US Core IG |
| `-ig hl7.fhir.uv.ips#1.1.0` | Load IPS IG |
| `-profile <url>` | Validate against a specific profile |
| `-output results.json` | Save results to file |
| `-level errors` | Only show errors (not warnings/info) |

## Programmatic Validation in Node.js

You can shell out to the validator from Node.js:

```typescript
import { execSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateFHIR(
  resource: object,
  options?: { ig?: string; profile?: string }
): ValidationResult {
  const dir = mkdtempSync(join(tmpdir(), 'fhir-'));
  const file = join(dir, 'resource.json');

  try {
    writeFileSync(file, JSON.stringify(resource, null, 2));

    let cmd = `java -jar validator_cli.jar ${file} -version 4.0.1`;
    if (options?.ig) cmd += ` -ig ${options.ig}`;
    if (options?.profile) cmd += ` -profile ${options.profile}`;

    const output = execSync(cmd, { encoding: 'utf-8', timeout: 60_000 });

    const errors = output.split('\n').filter(l => l.includes('Error'));
    const warnings = output.split('\n').filter(l => l.includes('Warning'));

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Usage
const patient = new PatientBuilder().name('Jane', 'Doe').gender('female').build();
const result = validateFHIR(patient, { ig: 'hl7.fhir.us.core#6.1.0' });
console.log(result.valid ? 'Valid!' : `Errors: ${result.errors.join('\n')}`);
```

> **Note:** This is an example pattern, not a built-in feature of the library.

## Online Validators

For quick spot-checks during development:

- **[validator.fhir.org](https://validator.fhir.org)** — paste JSON, select version and IG, get results instantly
- **[inferno.healthit.gov](https://inferno.healthit.gov)** — tests your FHIR **server endpoints**, not individual resources; useful for end-to-end testing of a complete API implementation

## Common Validation Issues and Fixes

### Missing `meta.profile`

Some profiles require `meta.profile` to be set. The Patient builder auto-sets this when you use US Core extensions:

```typescript
// Auto-sets meta.profile to US Core Patient
const patient = fb.patient()
  .name('Jane', 'Doe')
  .race('2106-3', undefined, 'White')
  .build();
// patient.meta.profile = ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
```

For other profiles, set it manually:

```typescript
fb.observation()
  .meta('http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs')
  .loincCode('85354-9', 'Blood pressure')
  .build();
```

### Invalid Code in ValueSet

If the validator reports a code is not in a required ValueSet, the code may be misspelled or from the wrong system. Use enrichment to verify codes:

```typescript
const result = await api.icd10.lookup('E11.9');
// If this returns a result, the code is valid
```

### Missing Required Elements

US Core profiles require specific elements. For example, US Core Patient requires `name`, `gender`, and `identifier`. The builder doesn't enforce profile-level requirements (they vary by profile), but you can check by validating:

```typescript
// This is valid FHIR R4 but won't pass US Core Patient validation
const patient = fb.patient().build();

// This passes US Core Patient
const patient = fb.patient()
  .name('Jane', 'Doe')
  .gender('female')
  .identifier('12345', 'http://hospital.org/mrn')
  .build();
```

### Reference Targets Not in Bundle

In transaction bundles, all references should resolve to entries in the bundle. Use `.resolveReferences()` to fix internal references:

```typescript
const bundle = fb.bundle('transaction')
  .add(patient)
  .add(observation)  // references Patient/patient-1
  .resolveReferences()  // rewrites to urn:uuid:patient-1
  .build();
```

References to resources **not** in the bundle are preserved as-is — the validator may warn about these depending on the profile.
