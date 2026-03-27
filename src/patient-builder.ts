// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Patient resources.
 *
 * ```typescript
 * const patient = new PatientBuilder()
 *   .name('Jane', 'Doe')
 *   .gender('female')
 *   .dob('1990-05-15')
 *   .mrn('12345', 'http://hospital.org/mrn')
 *   .race('2106-3', undefined, 'White')
 *   .build();
 * ```
 */

import { ResourceBuilder } from "./resource-builder.js";
import {
  buildCodeableConcept,
  buildHumanName,
  buildIdentifier,
  buildReference,
} from "./helpers.js";
import { CodeSystems } from "./code-systems.js";
import type {
  Address,
  AddressInput,
  AdministrativeGender,
  CodeableConcept,
  ContactPoint,
  Extension,
  HumanName,
  HumanNameInput,
  Identifier,
  NameUse,
  Period,
  Reference,
  Resource,
} from "./types.js";

// ---------------------------------------------------------------------------
// Patient Resource Type
// ---------------------------------------------------------------------------

export interface PatientResource extends Resource {
  resourceType: "Patient";
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: AdministrativeGender;
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Reference[];
  managingOrganization?: Reference;
  identifier?: Identifier[];
}

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: AdministrativeGender;
  period?: Period;
}

export interface PatientCommunication {
  language: CodeableConcept;
  preferred?: boolean;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class PatientBuilder extends ResourceBuilder<PatientResource> {
  private hasUsCoreExtension = false;

  constructor() {
    super("Patient");
  }

  // --- Name ---

  /** Add a name from given/family strings. */
  name(given: string, family: string, use?: NameUse): this {
    return this.nameObject({ given, family, use });
  }

  /** Add a name from a full input object. */
  nameObject(input: HumanNameInput): this {
    if (!this.resource.name) this.resource.name = [];
    this.resource.name.push(buildHumanName(input));
    return this;
  }

  // --- Demographics ---

  /** Set date of birth (YYYY-MM-DD). */
  dob(date: string): this {
    this.resource.birthDate = date;
    return this;
  }

  /** Set administrative gender. */
  gender(gender: AdministrativeGender): this {
    this.resource.gender = gender;
    return this;
  }

  /** Set active status. */
  active(active: boolean): this {
    this.resource.active = active;
    return this;
  }

  // --- Identifiers ---

  /** Add a Medical Record Number identifier. */
  mrn(value: string, system: string): this {
    return this.identifier(value, system, "MR");
  }

  /** Add an identifier. */
  identifier(value: string, system: string, typeCode?: string): this {
    if (!this.resource.identifier) this.resource.identifier = [];
    this.resource.identifier.push(buildIdentifier(value, system, typeCode));
    return this;
  }

  // --- Contact Info ---

  /** Add a telecom contact (phone, email, etc.). */
  telecom(
    system: ContactPoint["system"],
    value: string,
    use?: ContactPoint["use"]
  ): this {
    if (!this.resource.telecom) this.resource.telecom = [];
    const cp: ContactPoint = { system, value };
    if (use) cp.use = use;
    this.resource.telecom.push(cp);
    return this;
  }

  /** Add an address. */
  address(input: AddressInput): this {
    if (!this.resource.address) this.resource.address = [];
    const addr: Address = {};
    if (input.line) {
      addr.line = Array.isArray(input.line) ? input.line : [input.line];
    }
    if (input.city) addr.city = input.city;
    if (input.state) addr.state = input.state;
    if (input.postalCode) addr.postalCode = input.postalCode;
    if (input.country) addr.country = input.country;
    if (input.use) addr.use = input.use;
    this.resource.address.push(addr);
    return this;
  }

  // --- Marital Status / Deceased / MultipleBirth ---

  /** Set marital status. Defaults to v3-MaritalStatus system. */
  maritalStatus(code: string, system?: string, display?: string): this {
    this.resource.maritalStatus = buildCodeableConcept(
      code,
      system ?? "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
      display
    );
    return this;
  }

  /** Set deceased status (boolean or dateTime string). */
  deceased(value: boolean | string): this {
    if (typeof value === "boolean") {
      this.resource.deceasedBoolean = value;
    } else {
      this.resource.deceasedDateTime = value;
    }
    return this;
  }

  /** Set multiple birth (boolean or integer birth order). */
  multipleBirth(value: boolean | number): this {
    if (typeof value === "boolean") {
      this.resource.multipleBirthBoolean = value;
    } else {
      this.resource.multipleBirthInteger = value;
    }
    return this;
  }

  // --- Contact Person ---

  /** Add an emergency/next-of-kin contact. */
  contact(input: {
    name?: HumanNameInput;
    telecom?: { system: ContactPoint["system"]; value: string; use?: ContactPoint["use"] }[];
    address?: AddressInput;
    gender?: AdministrativeGender;
    relationship?: { code: string; system?: string; display?: string };
  }): this {
    if (!this.resource.contact) this.resource.contact = [];
    const c: PatientContact = {};

    if (input.name) c.name = buildHumanName(input.name);
    if (input.gender) c.gender = input.gender;

    if (input.relationship) {
      c.relationship = [
        buildCodeableConcept(
          input.relationship.code,
          input.relationship.system ??
            "http://terminology.hl7.org/CodeSystem/v2-0131",
          input.relationship.display
        ),
      ];
    }

    if (input.telecom) {
      c.telecom = input.telecom.map((t) => {
        const cp: ContactPoint = { system: t.system, value: t.value };
        if (t.use) cp.use = t.use;
        return cp;
      });
    }

    if (input.address) {
      const addr: Address = {};
      if (input.address.line) {
        addr.line = Array.isArray(input.address.line)
          ? input.address.line
          : [input.address.line];
      }
      if (input.address.city) addr.city = input.address.city;
      if (input.address.state) addr.state = input.address.state;
      if (input.address.postalCode) addr.postalCode = input.address.postalCode;
      if (input.address.country) addr.country = input.address.country;
      if (input.address.use) addr.use = input.address.use;
      c.address = addr;
    }

    this.resource.contact.push(c);
    return this;
  }

  // --- Communication ---

  /** Add a communication language. */
  communication(
    languageCode: string,
    preferred?: boolean,
    display?: string
  ): this {
    if (!this.resource.communication) this.resource.communication = [];
    const comm: PatientCommunication = {
      language: buildCodeableConcept(
        languageCode,
        "urn:ietf:bcp:47",
        display
      ),
    };
    if (preferred !== undefined) comm.preferred = preferred;
    this.resource.communication.push(comm);
    return this;
  }

  // --- References ---

  /** Add a general practitioner reference. */
  generalPractitioner(ref: Resource | string, display?: string): this {
    if (!this.resource.generalPractitioner) {
      this.resource.generalPractitioner = [];
    }
    this.resource.generalPractitioner.push(buildReference(ref, display));
    return this;
  }

  /** Set managing organization reference. */
  managingOrganization(ref: Resource | string, display?: string): this {
    this.resource.managingOrganization = buildReference(ref, display);
    return this;
  }

  // --- US Core Extensions ---

  /**
   * Add US Core Race extension.
   *
   * ```typescript
   * .race('2106-3', undefined, 'White')
   * .race('2106-3', '2108-9', 'White')  // with detailed race
   * ```
   *
   * @param ombCategory - OMB race category code (e.g., '2106-3' for White)
   * @param detailed - Optional detailed race code (e.g., '2108-9' for European)
   * @param text - Required text description
   */
  race(ombCategory: string, detailed?: string, text?: string): this {
    this.hasUsCoreExtension = true;
    const ext: Extension = {
      url: CodeSystems.US_CORE_RACE,
      extension: [
        {
          url: "ombCategory",
          valueCoding: {
            system: CodeSystems.CDC_RACE_ETHNICITY,
            code: ombCategory,
          },
        },
      ],
    };
    if (detailed) {
      ext.extension!.push({
        url: "detailed",
        valueCoding: {
          system: CodeSystems.CDC_RACE_ETHNICITY,
          code: detailed,
        },
      });
    }
    if (text) {
      ext.extension!.push({ url: "text", valueString: text });
    }
    this.extension(ext);
    return this;
  }

  /**
   * Add US Core Ethnicity extension.
   *
   * @param ombCategory - OMB ethnicity code ('2135-2' Hispanic, '2186-5' Non-Hispanic)
   * @param detailed - Optional detailed ethnicity code
   * @param text - Required text description
   */
  ethnicity(ombCategory: string, detailed?: string, text?: string): this {
    this.hasUsCoreExtension = true;
    const ext: Extension = {
      url: CodeSystems.US_CORE_ETHNICITY,
      extension: [
        {
          url: "ombCategory",
          valueCoding: {
            system: CodeSystems.CDC_RACE_ETHNICITY,
            code: ombCategory,
          },
        },
      ],
    };
    if (detailed) {
      ext.extension!.push({
        url: "detailed",
        valueCoding: {
          system: CodeSystems.CDC_RACE_ETHNICITY,
          code: detailed,
        },
      });
    }
    if (text) {
      ext.extension!.push({ url: "text", valueString: text });
    }
    this.extension(ext);
    return this;
  }

  /**
   * Add US Core Birth Sex extension.
   *
   * @param code - 'M', 'F', or 'UNK'
   */
  birthSex(code: "M" | "F" | "UNK"): this {
    this.hasUsCoreExtension = true;
    this.extension({
      url: CodeSystems.US_CORE_BIRTH_SEX,
      valueCode: code,
    });
    return this;
  }

  /**
   * Add US Core Gender Identity extension.
   *
   * @param code - Gender identity code (e.g., 'male', 'female', 'non-binary', 'transgender-male', 'transgender-female', 'other', 'non-disclose')
   */
  genderIdentity(code: string): this {
    this.hasUsCoreExtension = true;
    this.extension({
      url: CodeSystems.US_CORE_GENDER_IDENTITY,
      valueCodeableConcept: buildCodeableConcept(
        code,
        "http://terminology.hl7.org/CodeSystem/v3-NullFlavor"
      ),
    });
    return this;
  }

  // --- Build ---

  override build(): PatientResource {
    if (this.hasUsCoreExtension && !this.resource.meta?.profile?.length) {
      this.resource.meta = {
        ...this.resource.meta,
        profile: [CodeSystems.US_CORE_PATIENT],
      };
    }
    return super.build();
  }
}
