// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import {
  BundleBuilder,
  FHIRBuilder,
  PatientBuilder,
  EncounterBuilder,
  ObservationBuilder,
  ConditionBuilder,
} from "../src/index.js";

// Helpers to create test resources with stable ids
const makePatient = () =>
  new PatientBuilder()
    .id("patient-1")
    .name("Jane", "Doe")
    .gender("female")
    .build();

const makeEncounter = () =>
  new EncounterBuilder()
    .id("enc-1")
    .subject("Patient/patient-1")
    .build();

const makeObservation = () =>
  new ObservationBuilder()
    .id("obs-1")
    .loincCode("85354-9", "Blood pressure")
    .subject("Patient/patient-1")
    .encounter("Encounter/enc-1")
    .build();

const makeCondition = () =>
  new ConditionBuilder()
    .id("cond-1")
    .icd10("E11.9", "Type 2 diabetes")
    .subject("Patient/patient-1")
    .encounter("Encounter/enc-1")
    .build();

// Helper to access nested resource properties (Resource has [key: string]: unknown)
function ref(resource: any, ...path: string[]): any {
  let current = resource;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

describe("BundleBuilder", () => {
  // --- Defaults ---

  it("should create a Bundle with defaults", () => {
    const bundle = new BundleBuilder().build();
    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
    expect(bundle.id).toBeDefined();
  });

  it("should be accessible via FHIRBuilder.bundle()", () => {
    const fb = new FHIRBuilder();
    expect(fb.bundle()).toBeInstanceOf(BundleBuilder);
  });

  // --- Type ---

  it("should set bundle type via constructor", () => {
    const bundle = new BundleBuilder("transaction").build();
    expect(bundle.type).toBe("transaction");
  });

  it("should set bundle type via method", () => {
    const bundle = new BundleBuilder().type("searchset").build();
    expect(bundle.type).toBe("searchset");
  });

  // --- Metadata ---

  it("should set timestamp", () => {
    const bundle = new BundleBuilder()
      .timestamp("2024-01-15T10:00:00Z")
      .build();
    expect(bundle.timestamp).toBe("2024-01-15T10:00:00Z");
  });

  it("should set identifier", () => {
    const bundle = new BundleBuilder()
      .identifier("bundle-001", "http://example.org/bundles")
      .build();
    expect(bundle.identifier?.value).toBe("bundle-001");
    expect(bundle.identifier?.system).toBe("http://example.org/bundles");
  });

  it("should set total", () => {
    const bundle = new BundleBuilder("searchset").total(42).build();
    expect(bundle.total).toBe(42);
  });

  it("should add links", () => {
    const bundle = new BundleBuilder("searchset")
      .link("self", "http://example.org/Patient?name=jane")
      .link("next", "http://example.org/Patient?name=jane&page=2")
      .build();
    expect(bundle.link).toHaveLength(2);
    expect(bundle.link?.[0]?.relation).toBe("self");
    expect(bundle.link?.[1]?.url).toContain("page=2");
  });

  // --- Adding Resources (Collection) ---

  it("should add resources to a collection bundle", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("collection").add(patient).build();
    expect(bundle.entry).toHaveLength(1);
    expect(bundle.entry?.[0]?.resource?.resourceType).toBe("Patient");
    expect(bundle.entry?.[0]?.fullUrl).toBe("urn:uuid:patient-1");
  });

  it("should not include request element for collection bundles", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("collection").add(patient).build();
    expect(bundle.entry?.[0]?.request).toBeUndefined();
  });

  it("should add multiple resources", () => {
    const bundle = new BundleBuilder("collection")
      .add(makePatient())
      .add(makeEncounter())
      .add(makeObservation())
      .build();
    expect(bundle.entry).toHaveLength(3);
  });

  // --- Transaction Bundles ---

  it("should auto-generate request for transaction bundles", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("transaction").add(patient).build();
    expect(bundle.entry?.[0]?.request?.method).toBe("POST");
    expect(bundle.entry?.[0]?.request?.url).toBe("Patient");
  });

  it("should auto-generate request for batch bundles", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("batch").add(patient).build();
    expect(bundle.entry?.[0]?.request?.method).toBe("POST");
    expect(bundle.entry?.[0]?.request?.url).toBe("Patient");
  });

  it("should allow overriding request method to PUT", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("transaction")
      .add(patient, { method: "PUT" })
      .build();
    expect(bundle.entry?.[0]?.request?.method).toBe("PUT");
    expect(bundle.entry?.[0]?.request?.url).toBe("Patient/patient-1");
  });

  it("should allow overriding request URL", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("transaction")
      .add(patient, { method: "PUT", url: "Patient?identifier=12345" })
      .build();
    expect(bundle.entry?.[0]?.request?.url).toBe(
      "Patient?identifier=12345"
    );
  });

  it("should support DELETE method", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("transaction")
      .add(patient, { method: "DELETE" })
      .build();
    expect(bundle.entry?.[0]?.request?.method).toBe("DELETE");
    expect(bundle.entry?.[0]?.request?.url).toBe("Patient/patient-1");
  });

  it("should support conditional create (ifNoneExist)", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("transaction")
      .add(patient, { ifNoneExist: "identifier=http://example.org|12345" })
      .build();
    expect(bundle.entry?.[0]?.request?.ifNoneExist).toBe(
      "identifier=http://example.org|12345"
    );
  });

  it("should support conditional update (ifMatch)", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("transaction")
      .add(patient, { method: "PUT", ifMatch: "W/\"1\"" })
      .build();
    expect(bundle.entry?.[0]?.request?.ifMatch).toBe("W/\"1\"");
  });

  // --- Custom fullUrl ---

  it("should allow custom fullUrl", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("collection")
      .add(patient, { fullUrl: "http://example.org/Patient/patient-1" })
      .build();
    expect(bundle.entry?.[0]?.fullUrl).toBe(
      "http://example.org/Patient/patient-1"
    );
  });

  // --- Searchset ---

  it("should add search info for searchset entries", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("searchset")
      .add(patient, { search: { mode: "match", score: 0.95 } })
      .build();
    expect(bundle.entry?.[0]?.search?.mode).toBe("match");
    expect(bundle.entry?.[0]?.search?.score).toBe(0.95);
  });

  // --- Deep Clone ---

  it("should deep-clone resources to avoid mutation", () => {
    const patient = makePatient();
    const bundle = new BundleBuilder("collection").add(patient).build();

    // Mutating the bundle entry should not affect the original
    const entryResource = bundle.entry?.[0]?.resource;
    if (entryResource) {
      (entryResource as Record<string, unknown>).id = "mutated";
    }
    expect(patient.id).toBe("patient-1");
  });

  it("should auto-generate id for resources without one", () => {
    const resource = { resourceType: "Basic" };
    const bundle = new BundleBuilder("collection").add(resource).build();
    const entryId = bundle.entry?.[0]?.resource?.id;
    expect(entryId).toBeDefined();
    expect(bundle.entry?.[0]?.fullUrl).toBe(`urn:uuid:${entryId}`);
  });

  // --- addEntry (raw) ---

  it("should add raw entries", () => {
    const bundle = new BundleBuilder("searchset")
      .addEntry({
        fullUrl: "http://example.org/Patient/1",
        resource: { resourceType: "Patient", id: "1" },
        search: { mode: "match" },
      })
      .build();
    expect(bundle.entry).toHaveLength(1);
    expect(bundle.entry?.[0]?.fullUrl).toBe("http://example.org/Patient/1");
    expect(bundle.entry?.[0]?.search?.mode).toBe("match");
  });

  it("should deep-clone raw entries", () => {
    const rawEntry = {
      fullUrl: "http://example.org/Patient/1",
      resource: { resourceType: "Patient", id: "1" },
    };
    const bundle = new BundleBuilder("collection")
      .addEntry(rawEntry)
      .build();
    // Mutating the bundle entry should not affect the original
    if (bundle.entry?.[0]?.resource) {
      (bundle.entry[0].resource as Record<string, unknown>).id = "mutated";
    }
    expect(rawEntry.resource.id).toBe("1");
  });

  // --- Reference Resolution ---

  it("should resolve internal references", () => {
    const patient = makePatient();
    const obs = makeObservation();

    const bundle = new BundleBuilder("transaction")
      .add(patient)
      .add(obs)
      .resolveReferences()
      .build();

    const obsResource = bundle.entry?.[1]?.resource;
    expect(ref(obsResource, "subject", "reference")).toBe(
      "urn:uuid:patient-1"
    );
  });

  it("should resolve multiple references across resources", () => {
    const patient = makePatient();
    const encounter = makeEncounter();
    const obs = makeObservation();

    const bundle = new BundleBuilder("transaction")
      .add(patient)
      .add(encounter)
      .add(obs)
      .resolveReferences()
      .build();

    // Observation.subject -> Patient
    expect(ref(bundle.entry?.[2]?.resource, "subject", "reference")).toBe(
      "urn:uuid:patient-1"
    );
    // Observation.encounter -> Encounter
    expect(ref(bundle.entry?.[2]?.resource, "encounter", "reference")).toBe(
      "urn:uuid:enc-1"
    );
    // Encounter.subject -> Patient
    expect(ref(bundle.entry?.[1]?.resource, "subject", "reference")).toBe(
      "urn:uuid:patient-1"
    );
  });

  it("should preserve references to resources not in bundle", () => {
    const obs = new ObservationBuilder()
      .id("obs-1")
      .subject("Patient/external-patient")
      .build();

    const bundle = new BundleBuilder("transaction")
      .add(obs)
      .resolveReferences()
      .build();

    expect(ref(bundle.entry?.[0]?.resource, "subject", "reference")).toBe(
      "Patient/external-patient"
    );
  });

  it("should resolve references in arrays", () => {
    const obs = new ObservationBuilder()
      .id("obs-1")
      .loincCode("85354-9")
      .build();

    const report = {
      resourceType: "DiagnosticReport",
      id: "dr-1",
      status: "final",
      code: { coding: [{ code: "blood-panel" }] },
      result: [{ reference: "Observation/obs-1" }],
    };

    const bundle = new BundleBuilder("transaction")
      .add(obs)
      .add(report)
      .resolveReferences()
      .build();

    expect(ref(bundle.entry?.[1]?.resource, "result", 0, "reference")).toBe(
      "urn:uuid:obs-1"
    );
  });

  it("should resolve references in deeply nested objects", () => {
    const patient = makePatient();
    const resource = {
      resourceType: "CarePlan",
      id: "cp-1",
      activity: [
        {
          detail: {
            performer: [{ reference: "Patient/patient-1" }],
          },
        },
      ],
    };

    const bundle = new BundleBuilder("collection")
      .add(patient)
      .add(resource)
      .resolveReferences()
      .build();

    expect(
      ref(
        bundle.entry?.[1]?.resource,
        "activity",
        0,
        "detail",
        "performer",
        0,
        "reference"
      )
    ).toBe("urn:uuid:patient-1");
  });

  it("should handle empty bundle gracefully", () => {
    const bundle = new BundleBuilder("transaction")
      .resolveReferences()
      .build();
    expect(bundle.entry).toBeUndefined();
  });

  it("should resolve with custom fullUrl", () => {
    const patient = makePatient();
    const obs = makeObservation();

    const bundle = new BundleBuilder("collection")
      .add(patient, { fullUrl: "http://example.org/Patient/patient-1" })
      .add(obs)
      .resolveReferences()
      .build();

    expect(ref(bundle.entry?.[1]?.resource, "subject", "reference")).toBe(
      "http://example.org/Patient/patient-1"
    );
  });

  // --- Convenience Factory Methods ---

  it("should create transaction bundle via FHIRBuilder.transactionBundle()", () => {
    const fb = new FHIRBuilder();
    const builder = fb.transactionBundle();
    expect(builder).toBeInstanceOf(BundleBuilder);
    const bundle = builder.build();
    expect(bundle.type).toBe("transaction");
  });

  it("should create document bundle via FHIRBuilder.documentBundle()", () => {
    const fb = new FHIRBuilder();
    const composition = {
      resourceType: "Composition",
      id: "comp-1",
      status: "final",
    };
    const patient = makePatient();
    const bundle = fb.documentBundle(composition, patient).build();
    expect(bundle.type).toBe("document");
    expect(bundle.entry).toHaveLength(2);
    expect(bundle.entry?.[0]?.resource?.resourceType).toBe("Composition");
    expect(bundle.entry?.[1]?.resource?.resourceType).toBe("Patient");
  });

  it("should create collection bundle via FHIRBuilder.collectionBundle()", () => {
    const fb = new FHIRBuilder();
    const patient = makePatient();
    const obs = makeObservation();
    const bundle = fb.collectionBundle(patient, obs).build();
    expect(bundle.type).toBe("collection");
    expect(bundle.entry).toHaveLength(2);
  });

  it("should pass bundle type to FHIRBuilder.bundle()", () => {
    const fb = new FHIRBuilder();
    const bundle = fb.bundle("batch").build();
    expect(bundle.type).toBe("batch");
  });

  // --- Full Workflow ---

  it("should support a realistic transaction workflow", () => {
    const patient = makePatient();
    const encounter = makeEncounter();
    const obs = makeObservation();
    const condition = makeCondition();

    const bundle = new BundleBuilder("transaction")
      .id("bundle-001")
      .timestamp("2024-01-15T10:00:00Z")
      .add(patient)
      .add(encounter)
      .add(obs)
      .add(condition)
      .resolveReferences()
      .build();

    expect(bundle.id).toBe("bundle-001");
    expect(bundle.type).toBe("transaction");
    expect(bundle.timestamp).toBe("2024-01-15T10:00:00Z");
    expect(bundle.entry).toHaveLength(4);

    // All entries have fullUrl and request
    for (const entry of bundle.entry!) {
      expect(entry.fullUrl).toMatch(/^urn:uuid:/);
      expect(entry.request?.method).toBe("POST");
    }

    // References are resolved
    expect(ref(bundle.entry?.[2]?.resource, "subject", "reference")).toBe(
      "urn:uuid:patient-1"
    );
    expect(ref(bundle.entry?.[2]?.resource, "encounter", "reference")).toBe(
      "urn:uuid:enc-1"
    );
    expect(ref(bundle.entry?.[3]?.resource, "subject", "reference")).toBe(
      "urn:uuid:patient-1"
    );
    expect(ref(bundle.entry?.[3]?.resource, "encounter", "reference")).toBe(
      "urn:uuid:enc-1"
    );
  });

  it("should support fluent chaining", () => {
    const bundle = new BundleBuilder("searchset")
      .id("search-result")
      .total(100)
      .link("self", "http://example.org/Patient?name=jane")
      .link("next", "http://example.org/Patient?name=jane&page=2")
      .add(makePatient(), { search: { mode: "match", score: 1.0 } })
      .build();

    expect(bundle.id).toBe("search-result");
    expect(bundle.type).toBe("searchset");
    expect(bundle.total).toBe(100);
    expect(bundle.link).toHaveLength(2);
    expect(bundle.entry).toHaveLength(1);
  });

  it("toJSON should produce valid JSON", () => {
    const patient = makePatient();
    const json = new BundleBuilder("collection").add(patient).toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("Bundle");
    expect(parsed.type).toBe("collection");
    expect(parsed.entry).toHaveLength(1);
  });
});
