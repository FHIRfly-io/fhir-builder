// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * FHIR R4 data types used by the builder.
 *
 * These are lightweight interfaces matching the FHIR R4 spec. They cover the
 * subset needed for resource construction — not the full spec. For complete
 * type definitions, see @types/fhir (devDependency, used for type verification).
 */

// ---------------------------------------------------------------------------
// Primitives & Base
// ---------------------------------------------------------------------------

/** FHIR resource metadata. */
export interface Meta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: Coding[];
  tag?: Coding[];
}

/** FHIR Extension element. */
export interface Extension {
  url: string;
  valueString?: string;
  valueCode?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueDecimal?: number;
  valueDateTime?: string;
  valueCoding?: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueReference?: Reference;
  valuePeriod?: Period;
  extension?: Extension[];
}

// ---------------------------------------------------------------------------
// Data Types
// ---------------------------------------------------------------------------

/** FHIR Coding — a code from a terminology system. */
export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

/** FHIR CodeableConcept — a set of codes with optional text. */
export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

/** FHIR HumanName — a name of a person. */
export interface HumanName {
  use?: NameUse;
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

export type NameUse =
  | "usual"
  | "official"
  | "temp"
  | "nickname"
  | "anonymous"
  | "old"
  | "maiden";

/** FHIR Address — a postal/physical address. */
export interface Address {
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

/** FHIR ContactPoint — phone, email, or other contact mechanism. */
export interface ContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
  rank?: number;
  period?: Period;
}

/** FHIR Identifier — a business identifier for an entity. */
export interface Identifier {
  use?: "usual" | "official" | "temp" | "secondary" | "old";
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
}

/** FHIR Reference — a reference to another resource. */
export interface Reference {
  reference?: string;
  type?: string;
  display?: string;
  identifier?: Identifier;
}

/** FHIR Period — a time range. */
export interface Period {
  start?: string;
  end?: string;
}

/** FHIR Quantity — a measured or measurable amount. */
export interface Quantity {
  value?: number;
  comparator?: "<" | "<=" | ">=" | ">";
  unit?: string;
  system?: string;
  code?: string;
}

/** FHIR Range — a set of ordered Quantity values. */
export interface Range {
  low?: Quantity;
  high?: Quantity;
}

/** FHIR Annotation — a text note with attribution. */
export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: string;
  text: string;
}

/** FHIR Narrative — human-readable content. */
export interface Narrative {
  status: "generated" | "extensions" | "additional" | "empty";
  div: string;
}

// ---------------------------------------------------------------------------
// Resource Base
// ---------------------------------------------------------------------------

/** Base FHIR R4 Resource shape. All resources extend this. */
export interface Resource {
  resourceType: string;
  id?: string;
  meta?: Meta;
  extension?: Extension[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Builder-Specific Types
// ---------------------------------------------------------------------------

/** FHIR R4 administrative gender values. */
export type AdministrativeGender = "male" | "female" | "other" | "unknown";

/** Input for building a HumanName. */
export interface HumanNameInput {
  given: string | string[];
  family: string;
  prefix?: string | string[];
  suffix?: string | string[];
  use?: NameUse;
}

/** Input for building an Address. */
export interface AddressInput {
  line?: string | string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  use?: "home" | "work" | "temp" | "old" | "billing";
}

/** Input for building a Dosage. */
export interface DosageInput {
  text?: string;
  route?: { code: string; system?: string; display?: string };
  doseQuantity?: { value: number; unit: string; system?: string; code?: string };
  timing?: { frequency?: number; period?: number; periodUnit?: string };
  asNeeded?: boolean;
}
