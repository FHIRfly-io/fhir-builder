# API Reference

Complete reference for all builders, methods, and types in `@fhirfly-io/fhir-builder`.

## Table of Contents

- [FHIRBuilder](#fhirbuilder)
- [ResourceBuilder (Base)](#resourcebuilder-base)
- [PatientBuilder](#patientbuilder)
- [EncounterBuilder](#encounterbuilder)
- [CoverageBuilder](#coveragebuilder)
- [ObservationBuilder](#observationbuilder)
- [ConditionBuilder](#conditionbuilder)
- [DiagnosticReportBuilder](#diagnosticreportbuilder)
- [MedicationStatementBuilder](#medicationstatementbuilder)
- [MedicationRequestBuilder](#medicationrequestbuilder)
- [AllergyIntoleranceBuilder](#allergyintolerancebuilder)
- [ImmunizationBuilder](#immunizationbuilder)
- [ProcedureBuilder](#procedurebuilder)
- [ExplanationOfBenefitBuilder](#explanationofbenefitbuilder)
- [BundleBuilder](#bundlebuilder)
- [CodeSystems](#codesystems)
- [Helper Functions](#helper-functions)

---

## FHIRBuilder

Main entry point. Provides factory methods for all resource builders and data type helpers.

```typescript
import { FHIRBuilder } from '@fhirfly-io/fhir-builder';
const fb = new FHIRBuilder();
```

### Resource Factories

| Method | Returns |
|--------|---------|
| `fb.patient()` | `PatientBuilder` |
| `fb.encounter()` | `EncounterBuilder` |
| `fb.coverage()` | `CoverageBuilder` |
| `fb.observation()` | `ObservationBuilder` |
| `fb.condition()` | `ConditionBuilder` |
| `fb.diagnosticReport()` | `DiagnosticReportBuilder` |
| `fb.medicationStatement()` | `MedicationStatementBuilder` |
| `fb.medicationRequest()` | `MedicationRequestBuilder` |
| `fb.allergyIntolerance()` | `AllergyIntoleranceBuilder` |
| `fb.immunization()` | `ImmunizationBuilder` |
| `fb.procedure()` | `ProcedureBuilder` |
| `fb.explanationOfBenefit()` | `ExplanationOfBenefitBuilder` |
| `fb.bundle(type?)` | `BundleBuilder` |

### Bundle Shortcuts

| Method | Description |
|--------|-------------|
| `fb.transactionBundle()` | Bundle with `type: "transaction"` |
| `fb.documentBundle(composition, ...resources)` | Document bundle; Composition is first entry |
| `fb.collectionBundle(...resources)` | Collection bundle pre-populated with resources |

### Data Type Helpers

| Method | Returns |
|--------|---------|
| `fb.generateId()` | UUID v4 string |
| `fb.codeableConcept(code, system, display?, text?)` | `CodeableConcept` |
| `fb.coding(code, system, display?)` | `Coding` |
| `fb.humanName(givenOrInput, family?, use?)` | `HumanName` |
| `fb.identifier(value, system, typeCode?)` | `Identifier` |
| `fb.reference(resourceOrRef, display?)` | `Reference` |
| `fb.period(start?, end?)` | `Period` |
| `fb.quantity(value, unit, systemOrCode?, code?)` | `Quantity` |

---

## ResourceBuilder (Base)

Abstract base class. All resource builders inherit these methods.

| Method | Description |
|--------|-------------|
| `.id(id)` | Set the resource id. Auto-generated UUID if not called. |
| `.meta(profileOrMeta)` | Set meta. Accepts a profile URI string or a `Meta` object. |
| `.extension(ext)` | Add an extension to the resource. |
| `.build()` | Build and return the FHIR resource (auto-generates id if unset). |
| `.toJSON()` | Build and serialize to a JSON string (pretty-printed). |

---

## PatientBuilder

**Default:** `resourceType: "Patient"`

**Types:** `PatientResource`, `PatientContact`, `PatientCommunication`

### Demographics

| Method | Description |
|--------|-------------|
| `.name(given, family, use?)` | Add a name (string shorthand) |
| `.nameObject(input)` | Add a name from `HumanNameInput` (prefix, suffix, multiple givens) |
| `.dob(date)` | Set birth date |
| `.gender(gender)` | `"male"` \| `"female"` \| `"other"` \| `"unknown"` |
| `.active(active)` | Set active flag |
| `.deceased(value)` | `boolean` or `string` (dateTime) |
| `.multipleBirth(value)` | `boolean` or `number` (birth order) |
| `.maritalStatus(code, system?, display?)` | Set marital status |

### Identifiers & Contact

| Method | Description |
|--------|-------------|
| `.mrn(value, system)` | Add a Medical Record Number identifier |
| `.identifier(value, system, typeCode?)` | Add a generic identifier |
| `.telecom(system, value, use?)` | Add phone/email/fax |
| `.address(input)` | Add an address from `AddressInput` |

### Relationships

| Method | Description |
|--------|-------------|
| `.contact(input)` | Add a contact person (name, telecom, relationship, etc.) |
| `.communication(languageCode, preferred?, display?)` | Add a communication language |
| `.generalPractitioner(ref, display?)` | Set general practitioner reference |
| `.managingOrganization(ref, display?)` | Set managing organization reference |

### US Core Extensions

| Method | Description |
|--------|-------------|
| `.race(ombCategory, detailed?, text?)` | US Core Race extension (auto-sets profile) |
| `.ethnicity(ombCategory, detailed?, text?)` | US Core Ethnicity extension |
| `.birthSex(code)` | `"M"` \| `"F"` \| `"UNK"` |
| `.genderIdentity(code)` | Gender identity code |

---

## EncounterBuilder

**Defaults:** `status: "unknown"`, `class: { code: "AMB" }`

**Types:** `EncounterResource`, `EncounterStatus`, `EncounterParticipant`, `EncounterHospitalization`, `EncounterLocation`

| Method | Description |
|--------|-------------|
| `.status(status)` | `"planned"` \| `"arrived"` \| `"triaged"` \| `"in-progress"` \| `"onleave"` \| `"finished"` \| `"cancelled"` \| ... |
| `.encounterClass(code, system?, display?)` | Set class (AMB, IMP, EMER, etc.) |
| `.type(code, system, display?)` | Set encounter type |
| `.subject(ref, display?)` | Patient reference |
| `.participant(individual, typeCode?, typeSystem?, typeDisplay?)` | Add participant |
| `.period(start?, end?)` | Set encounter period |
| `.reasonCode(code, system, display?)` | Add reason code |
| `.reasonReference(ref, display?)` | Add reason reference |
| `.hospitalization(input)` | Set hospitalization details (admit/discharge) |
| `.serviceProvider(ref, display?)` | Set service provider organization |
| `.location(ref, status?, period?)` | Add location |

---

## CoverageBuilder

**Default:** `status: "active"`

**Types:** `CoverageResource`, `CoverageStatus`, `CoverageClass`

| Method | Description |
|--------|-------------|
| `.status(status)` | `"active"` \| `"cancelled"` \| `"draft"` \| `"entered-in-error"` |
| `.beneficiary(ref, display?)` | Patient reference |
| `.payor(ref, display?)` | Insurer/payer reference |
| `.type(code, system?, display?)` | Coverage type |
| `.policyHolder(ref, display?)` | Policy holder reference |
| `.subscriber(ref, display?)` | Subscriber reference |
| `.subscriberId(value)` | Subscriber ID |
| `.dependent(value)` | Dependent number |
| `.relationship(code, system?, display?)` | Beneficiary relationship to subscriber |
| `.period(start?, end?)` | Coverage period |
| `.classInfo(type, value, name?)` | Add a coverage class (group, plan, etc.) |
| `.network(value)` | Network name |
| `.order(order)` | Coordination of benefit order |

---

## ObservationBuilder

**Default:** `status: "final"`

**Types:** `ObservationResource`, `ObservationStatus`, `ObservationComponent`, `ObservationReferenceRange`

### Code & Category

| Method | Description |
|--------|-------------|
| `.code(code, system, display?)` | Set observation code |
| `.loincCode(code, display?)` | Shorthand: set code with LOINC system |
| `.category(code, system?, display?)` | Add category (vital-signs, laboratory, etc.) |

### Context

| Method | Description |
|--------|-------------|
| `.status(status)` | `"registered"` \| `"preliminary"` \| `"final"` \| `"amended"` \| `"corrected"` \| `"cancelled"` \| ... |
| `.subject(ref, display?)` | Patient reference |
| `.encounter(ref, display?)` | Encounter reference |
| `.effectiveDateTime(dateTime)` | When observed |
| `.effectivePeriod(start, end?)` | Observation period |
| `.issued(instant)` | When issued |
| `.performer(ref, display?)` | Who performed |

### Value

| Method | Description |
|--------|-------------|
| `.valueQuantity(value, unit, systemOrCode?, code?)` | Numeric value with units |
| `.valueCodeableConcept(code, system, display?)` | Coded value |
| `.valueString(value)` | String value |
| `.valueBoolean(value)` | Boolean value |
| `.dataAbsentReason(code, display?)` | Why value is missing |

### Additional

| Method | Description |
|--------|-------------|
| `.interpretation(code, system?, display?)` | Result interpretation (H, L, N, etc.) |
| `.referenceRange(low?, high?, text?)` | Normal/expected range |
| `.component(code, system, value, display?)` | Add component (e.g., systolic/diastolic) |
| `.bodySite(code, system, display?)` | Body site |
| `.method(code, system, display?)` | Method used |
| `.note(text)` | Add a note |

---

## ConditionBuilder

**Types:** `ConditionResource`, `ConditionClinicalStatus`, `ConditionVerificationStatus`, `ConditionStage`, `ConditionEvidence`

### Status & Category

| Method | Description |
|--------|-------------|
| `.clinicalStatus(status)` | `"active"` \| `"recurrence"` \| `"relapse"` \| `"inactive"` \| `"remission"` \| `"resolved"` |
| `.verificationStatus(status)` | `"unconfirmed"` \| `"provisional"` \| `"differential"` \| `"confirmed"` \| `"refuted"` \| `"entered-in-error"` |
| `.category(code, system?, display?)` | Category (problem-list-item, encounter-diagnosis) |
| `.severity(code, system?, display?)` | Severity |

### Code

| Method | Description |
|--------|-------------|
| `.code(code, system, display?)` | Set condition code |
| `.icd10(code, display?)` | Shorthand: ICD-10-CM system |
| `.snomedCode(code, display?)` | Shorthand: SNOMED CT system |

### Context

| Method | Description |
|--------|-------------|
| `.subject(ref, display?)` | Patient reference |
| `.encounter(ref, display?)` | Encounter reference |
| `.recordedDate(dateTime)` | When recorded |
| `.recorder(ref, display?)` | Who recorded |
| `.asserter(ref, display?)` | Who asserted |

### Onset & Abatement

| Method | Description |
|--------|-------------|
| `.onsetDateTime(dateTime)` | Onset date |
| `.onsetAge(value, unit)` | Onset age |
| `.onsetPeriod(start, end?)` | Onset period |
| `.onsetString(text)` | Onset description |
| `.abatementDateTime(dateTime)` | Abatement date |
| `.abatementAge(value, unit)` | Abatement age |
| `.abatementString(text)` | Abatement description |

### Additional

| Method | Description |
|--------|-------------|
| `.bodySite(code, system?, display?)` | Affected body site |
| `.stage(summary?, assessment?)` | Add stage information |
| `.evidence(code?, detail?)` | Add supporting evidence |
| `.note(text)` | Add a note |

---

## DiagnosticReportBuilder

**Default:** `status: "final"`

**Types:** `DiagnosticReportResource`, `DiagnosticReportStatus`, `PresentedForm`

| Method | Description |
|--------|-------------|
| `.status(status)` | `"registered"` \| `"partial"` \| `"preliminary"` \| `"final"` \| `"amended"` \| ... |
| `.code(code, system, display?)` | Report code |
| `.loincCode(code, display?)` | Shorthand: LOINC system |
| `.category(code, system?, display?)` | Report category |
| `.subject(ref, display?)` | Patient reference |
| `.encounter(ref, display?)` | Encounter reference |
| `.effectiveDateTime(dateTime)` | Clinically relevant time |
| `.effectivePeriod(start, end?)` | Relevant period |
| `.issued(instant)` | When issued |
| `.performer(ref, display?)` | Who produced |
| `.result(ref, display?)` | Add an Observation result reference |
| `.conclusion(text)` | Clinical conclusion text |
| `.conclusionCode(code, system, display?)` | Coded conclusion |
| `.presentedForm(contentType, data?, url?)` | Add attached report (PDF, etc.) |

---

## MedicationStatementBuilder

**Types:** `MedicationStatementResource`, `MedicationStatementStatus`, `Dosage`

| Method | Description |
|--------|-------------|
| `.status(status)` | `"active"` \| `"completed"` \| `"entered-in-error"` \| `"intended"` \| ... |
| `.subject(ref, display?)` | Patient reference |
| `.medicationCode(code, system, display?)` | Set medication code |
| `.medicationByNDC(ndcCode, display?)` | Shorthand: NDC system |
| `.medicationByRxNorm(rxcui, display?)` | Shorthand: RxNorm system |
| `.addCoding(coding)` | Add additional coding (enrichment crosswalk) |
| `.medicationReference(ref, display?)` | Reference to a Medication resource |
| `.context(ref, display?)` | Encounter/EpisodeOfCare reference |
| `.effectiveDateTime(dateTime)` | When taken |
| `.effectivePeriod(start, end?)` | Period of use |
| `.dateAsserted(dateTime)` | When statement was asserted |
| `.informationSource(ref, display?)` | Who provided the information |
| `.reasonCode(code, system, display?)` | Reason for taking |
| `.reasonReference(ref, display?)` | Reason reference |
| `.category(code, system?, display?)` | Category |
| `.dosage(input)` | Add dosage instructions |
| `.note(text)` | Add a note |

---

## MedicationRequestBuilder

**Defaults:** `status: "active"`, `intent: "order"`

**Types:** `MedicationRequestResource`, `MedicationRequestStatus`, `MedicationRequestIntent`, `MedicationRequestPriority`, `DispenseRequest`, `MedicationRequestSubstitution`

| Method | Description |
|--------|-------------|
| `.status(status)` | `"active"` \| `"on-hold"` \| `"cancelled"` \| `"completed"` \| ... |
| `.intent(intent)` | `"proposal"` \| `"plan"` \| `"order"` \| `"original-order"` \| ... |
| `.subject(ref, display?)` | Patient reference |
| `.medicationCode(code, system, display?)` | Set medication code |
| `.medicationByNDC(ndcCode, display?)` | Shorthand: NDC system |
| `.medicationByRxNorm(rxcui, display?)` | Shorthand: RxNorm system |
| `.addCoding(coding)` | Add additional coding (enrichment crosswalk) |
| `.medicationReference(ref, display?)` | Reference to a Medication resource |
| `.encounter(ref, display?)` | Encounter reference |
| `.authoredOn(dateTime)` | When written |
| `.requester(ref, display?)` | Who requested |
| `.priority(priority)` | `"routine"` \| `"urgent"` \| `"asap"` \| `"stat"` |
| `.category(code, system?, display?)` | Category |
| `.reasonCode(code, system, display?)` | Reason for prescribing |
| `.reasonReference(ref, display?)` | Reason reference |
| `.dosageInstruction(input)` | Add dosage instruction |
| `.dispenseRequest(input)` | Set dispense details (quantity, supply, refills) |
| `.substitution(allowed, reason?)` | Substitution rules |
| `.note(text)` | Add a note |

---

## AllergyIntoleranceBuilder

**Types:** `AllergyIntoleranceResource`, `AllergyClinicalStatus`, `AllergyVerificationStatus`, `AllergyType`, `AllergyCategory`, `AllergyCriticality`, `AllergyReaction`

### Status & Classification

| Method | Description |
|--------|-------------|
| `.clinicalStatus(status)` | `"active"` \| `"inactive"` \| `"resolved"` |
| `.verificationStatus(status)` | `"unconfirmed"` \| `"confirmed"` \| `"refuted"` \| `"entered-in-error"` |
| `.type(type)` | `"allergy"` \| `"intolerance"` |
| `.category(category)` | `"food"` \| `"medication"` \| `"environment"` \| `"biologic"` |
| `.criticality(criticality)` | `"low"` \| `"high"` \| `"unable-to-assess"` |

### Code

| Method | Description |
|--------|-------------|
| `.code(code, system, display?)` | Set allergy code |
| `.snomedCode(code, display?)` | Shorthand: SNOMED CT system |
| `.rxNormCode(rxcui, display?)` | Shorthand: RxNorm system |

### Context

| Method | Description |
|--------|-------------|
| `.patient(ref, display?)` | Patient reference |
| `.encounter(ref, display?)` | Encounter reference |
| `.onsetDateTime(dateTime)` | When allergy started |
| `.onsetAge(value, unit)` | Onset age |
| `.onsetString(text)` | Onset description |
| `.recordedDate(dateTime)` | When recorded |
| `.recorder(ref, display?)` | Who recorded |
| `.asserter(ref, display?)` | Who asserted |
| `.lastOccurrence(dateTime)` | Last known occurrence |
| `.note(text)` | Add a note |

### Reactions

| Method | Description |
|--------|-------------|
| `.reaction(input)` | Add a reaction (substance, manifestations, severity, onset, etc.) |

Reaction input:
```typescript
.reaction({
  manifestation: [{ code: '39579001', system: CodeSystems.SNOMED, display: 'Anaphylaxis' }],
  severity: 'severe',
  onset: '2024-01-15',
  description: 'Patient experienced anaphylaxis',
})
```

---

## ImmunizationBuilder

**Default:** `status: "completed"`

**Types:** `ImmunizationResource`, `ImmunizationStatus`, `ImmunizationPerformer`, `ImmunizationProtocolApplied`

### Vaccine

| Method | Description |
|--------|-------------|
| `.vaccineCode(code, system, display?)` | Set vaccine code |
| `.cvxCode(code, display?)` | Shorthand: CVX system |
| `.addCoding(coding)` | Add additional coding (e.g., MVX manufacturer) |

### Context

| Method | Description |
|--------|-------------|
| `.status(status)` | `"completed"` \| `"entered-in-error"` \| `"not-done"` |
| `.statusReason(code, system?, display?)` | Why not done |
| `.patient(ref, display?)` | Patient reference |
| `.encounter(ref, display?)` | Encounter reference |
| `.occurrenceDateTime(dateTime)` | When administered |
| `.occurrenceString(text)` | Approximate occurrence |
| `.recorded(dateTime)` | When recorded |
| `.primarySource(value)` | Is this from the primary source? |
| `.reportOrigin(code, system?, display?)` | Origin of report (if not primary source) |

### Administration

| Method | Description |
|--------|-------------|
| `.location(ref, display?)` | Where administered |
| `.manufacturer(ref, display?)` | Vaccine manufacturer |
| `.lotNumber(value)` | Lot number |
| `.expirationDate(date)` | Expiration date |
| `.site(code, system?, display?)` | Body site (defaults to SNOMED) |
| `.route(code, system?, display?)` | Route of administration |
| `.doseQuantity(value, unit)` | Dose amount |
| `.performer(actor, functionCode?, functionSystem?, functionDisplay?)` | Add performer |
| `.isSubpotent(value)` | Is this a subpotent dose? |

### Protocol

| Method | Description |
|--------|-------------|
| `.protocolApplied(input)` | Add protocol (series, doseNumber, seriesDoses, targetDisease) |
| `.reasonCode(code, system, display?)` | Reason for immunization |
| `.note(text)` | Add a note |

Protocol input:
```typescript
.protocolApplied({
  series: 'COVID-19 Primary Series',
  doseNumber: 2,        // or "Booster" (string)
  seriesDoses: 2,
  targetDisease: [{ code: '840539006', system: CodeSystems.SNOMED, display: 'COVID-19' }],
})
```

---

## ProcedureBuilder

**Default:** `status: "completed"`

**Types:** `ProcedureResource`, `ProcedureStatus`, `ProcedurePerformer`

### Code

| Method | Description |
|--------|-------------|
| `.code(code, system, display?)` | Set procedure code |
| `.snomedCode(code, display?)` | Shorthand: SNOMED CT |
| `.cptCode(code, display?)` | Shorthand: CPT |
| `.hcpcsCode(code, display?)` | Shorthand: HCPCS |

### Context

| Method | Description |
|--------|-------------|
| `.status(status)` | `"preparation"` \| `"in-progress"` \| `"not-done"` \| `"on-hold"` \| `"stopped"` \| `"completed"` \| ... |
| `.subject(ref, display?)` | Patient reference |
| `.encounter(ref, display?)` | Encounter reference |
| `.performedDateTime(dateTime)` | When performed |
| `.performedPeriod(start, end?)` | Performance period |
| `.performedString(text)` | Approximate timing |
| `.recorder(ref, display?)` | Who recorded |
| `.asserter(ref, display?)` | Who asserted |

### Performer

| Method | Description |
|--------|-------------|
| `.performer(actor, functionCode?, onBehalfOf?)` | Add performer |
| `.location(ref, display?)` | Where performed |

### Clinical Detail

| Method | Description |
|--------|-------------|
| `.reasonCode(code, system, display?)` | Why performed |
| `.reasonReference(ref, display?)` | Reason reference |
| `.bodySite(code, system?, display?)` | Body site (defaults to SNOMED) |
| `.outcome(code, system, display?)` | Procedure outcome |
| `.complication(code, system, display?)` | Add complication |
| `.followUp(code, system, display?)` | Add follow-up instruction |
| `.note(text)` | Add a note |

---

## ExplanationOfBenefitBuilder

**Defaults:** `status: "active"`, `type: "institutional"`, `use: "claim"`, `outcome: "complete"`, `created: now()`

**Types:** `ExplanationOfBenefitResource`, `EOBStatus`, `EOBUse`, `EOBOutcome`, `Money`, `EOBInsurance`, `EOBItem`, `EOBItemAdjudication`, `EOBTotal`, `EOBPayment`, `EOBCareTeam`, `EOBDiagnosis`, `EOBProcedure`, `EOBSupportingInfo`

### Required Fields

| Method | Description |
|--------|-------------|
| `.status(status)` | `"active"` \| `"cancelled"` \| `"draft"` \| `"entered-in-error"` |
| `.type(code, system?, display?)` | Claim type (institutional, professional, pharmacy, etc.) |
| `.use(use)` | `"claim"` \| `"preauthorization"` \| `"predetermination"` |
| `.patient(ref, display?)` | Patient reference |
| `.insurer(ref, display?)` | Insurer reference |
| `.provider(ref, display?)` | Provider reference |
| `.outcome(outcome)` | `"queued"` \| `"complete"` \| `"error"` \| `"partial"` |
| `.created(dateTime)` | When created |

### Insurance & Period

| Method | Description |
|--------|-------------|
| `.insurance(coverageRef, focal?)` | Add insurance entry |
| `.billablePeriod(start, end?)` | Set billable period |

### Line Items

| Method | Description |
|--------|-------------|
| `.item(input)` | Add a claim line item (sequence, productOrService, adjudication, etc.) |
| `.total(category, amount, currency?)` | Add a total (submitted, benefit, copay, etc.) |
| `.payment(input)` | Set payment details (type, date, amount) |

Item input:
```typescript
.item({
  sequence: 1,
  productOrService: { code: '99213', system: CodeSystems.CPT, display: 'Office visit' },
  servicedDate: '2024-01-15',
  quantity: { value: 1 },
  unitPrice: { value: 150.00 },
  net: { value: 150.00 },
  adjudication: [
    { category: 'submitted', amount: { value: 150.00 } },
    { category: 'benefit', amount: { value: 120.00 } },
    { category: 'copay', amount: { value: 30.00 } },
  ],
  diagnosisSequence: [1],
  careTeamSequence: [1],
})
```

### Care Team & Clinical

| Method | Description |
|--------|-------------|
| `.careTeam(sequence, provider, role?, qualification?)` | Add care team member |
| `.diagnosis(sequence, code, system, display?, type?)` | Add diagnosis |
| `.procedure(sequence, code, system, display?, date?)` | Add procedure |
| `.supportingInfo(sequence, categoryCode, code?, value?)` | Add supporting info |

### Additional

| Method | Description |
|--------|-------------|
| `.priority(code)` | Set processing priority |
| `.facility(ref, display?)` | Facility reference |
| `.prescription(ref)` | Prescription reference |
| `.claim(ref)` | Original claim reference |
| `.claimResponse(ref)` | Claim response reference |

---

## BundleBuilder

**Default:** `type: "collection"`

**Types:** `BundleResource`, `BundleType`, `BundleEntry`, `BundleEntryRequest`, `BundleEntrySearch`, `BundleEntryResponse`, `BundleLink`, `HTTPVerb`, `SearchEntryMode`, `AddEntryOptions`

### Configuration

| Method | Description |
|--------|-------------|
| `.type(type)` | `"transaction"` \| `"batch"` \| `"document"` \| `"collection"` \| `"message"` \| `"searchset"` |
| `.timestamp(instant)` | Bundle timestamp |
| `.identifier(value, system)` | Bundle identifier |
| `.total(count)` | Total count (for searchset) |
| `.link(relation, url)` | Add link (self, next, prev) |

### Adding Resources

| Method | Description |
|--------|-------------|
| `.add(resource, options?)` | Add a resource (deep-cloned; auto-generates fullUrl and request for transaction/batch) |
| `.addEntry(entry)` | Add a raw `BundleEntry` (no auto-generation) |

`AddEntryOptions`:
```typescript
{
  method?: 'POST' | 'PUT' | 'DELETE' | ...  // Default: POST for transaction/batch
  url?: string,               // Request URL override
  fullUrl?: string,           // Override urn:uuid:{id}
  search?: { mode?, score? }, // For searchset entries
  ifNoneExist?: string,       // Conditional create
  ifMatch?: string,           // Conditional update (ETag)
  ifNoneMatch?: string,       // Conditional read
}
```

### Reference Resolution

| Method | Description |
|--------|-------------|
| `.resolveReferences()` | Rewrite internal `ResourceType/id` references to `urn:uuid:id` fullUrls. External references are preserved. |

**Before:**
```json
{ "subject": { "reference": "Patient/patient-1" } }
```
**After:**
```json
{ "subject": { "reference": "urn:uuid:patient-1" } }
```

---

## CodeSystems

Common FHIR code system URI constants.

```typescript
import { CodeSystems } from '@fhirfly-io/fhir-builder';
```

| Constant | URI |
|----------|-----|
| `CodeSystems.LOINC` | `http://loinc.org` |
| `CodeSystems.SNOMED` | `http://snomed.info/sct` |
| `CodeSystems.ICD10CM` | `http://hl7.org/fhir/sid/icd-10-cm` |
| `CodeSystems.ICD10PCS` | `http://www.cms.gov/Medicare/Coding/ICD10` |
| `CodeSystems.NDC` | `http://hl7.org/fhir/sid/ndc` |
| `CodeSystems.RXNORM` | `http://www.nlm.nih.gov/research/umls/rxnorm` |
| `CodeSystems.CVX` | `http://hl7.org/fhir/sid/cvx` |
| `CodeSystems.MVX` | `http://hl7.org/fhir/sid/mvx` |
| `CodeSystems.CPT` | `http://www.ama-assn.org/go/cpt` |
| `CodeSystems.HCPCS` | `https://www.cms.gov/Medicare/Coding/HCPCSReleaseCodeSets` |
| `CodeSystems.UCUM` | `http://unitsofmeasure.org` |
| `CodeSystems.ACT_CODE` | `http://terminology.hl7.org/CodeSystem/v3-ActCode` |
| `CodeSystems.OBSERVATION_CATEGORY` | `http://terminology.hl7.org/CodeSystem/observation-category` |
| `CodeSystems.CONDITION_CATEGORY` | `http://terminology.hl7.org/CodeSystem/condition-category` |
| `CodeSystems.CONDITION_CLINICAL` | `http://terminology.hl7.org/CodeSystem/condition-clinical` |
| `CodeSystems.CONDITION_VERIFICATION` | `http://terminology.hl7.org/CodeSystem/condition-ver-status` |
| `CodeSystems.ALLERGY_CLINICAL` | `http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical` |
| `CodeSystems.ALLERGY_VERIFICATION` | `http://terminology.hl7.org/CodeSystem/allergyintolerance-verification` |
| `CodeSystems.IDENTIFIER_TYPE` | `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `CodeSystems.US_CORE_RACE` | `http://hl7.org/fhir/us/core/StructureDefinition/us-core-race` |
| `CodeSystems.US_CORE_ETHNICITY` | `http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity` |
| `CodeSystems.US_CORE_BIRTH_SEX` | `http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex` |
| `CodeSystems.US_CORE_GENDER_IDENTITY` | `http://hl7.org/fhir/us/core/StructureDefinition/us-core-genderIdentity` |
| `CodeSystems.CDC_RACE_ETHNICITY` | `urn:oid:2.16.840.1.113883.6.238` |
| `CodeSystems.US_CORE_PATIENT` | `http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient` |

---

## Helper Functions

Low-level building blocks used by the builders. Also available for direct use.

```typescript
import { generateId, buildCodeableConcept, buildReference } from '@fhirfly-io/fhir-builder';
```

| Function | Description |
|----------|-------------|
| `generateId()` | Generate a UUID v4 string |
| `buildCodeableConcept(code, system, display?, text?)` | Build a `CodeableConcept` |
| `buildCoding(code, system, display?)` | Build a `Coding` |
| `addCodingToCodeableConcept(cc, coding)` | Add a coding to an existing `CodeableConcept` (immutable) |
| `buildHumanName(givenOrInput, family?, use?)` | Build a `HumanName` |
| `buildIdentifier(value, system, typeCode?)` | Build an `Identifier` |
| `buildReference(resourceOrRef, display?)` | Build a `Reference` from a resource or string |
| `buildPeriod(start?, end?)` | Build a `Period` |
| `buildQuantity(value, unit, systemOrCode?, code?)` | Build a `Quantity` (defaults to UCUM) |
| `cleanObject(obj)` | Remove `undefined`/`null` values (shallow) |
