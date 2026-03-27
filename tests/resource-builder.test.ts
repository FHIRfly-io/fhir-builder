// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
import { describe, it, expect } from "vitest";
import { ResourceBuilder } from "../src/resource-builder.js";
import type { Resource } from "../src/types.js";

/** Concrete test builder to exercise the abstract base class. */
class TestResourceBuilder extends ResourceBuilder<Resource> {
  constructor() {
    super("TestResource");
  }
}

describe("ResourceBuilder", () => {
  it("should set resourceType on construction", () => {
    const builder = new TestResourceBuilder();
    const resource = builder.build();
    expect(resource.resourceType).toBe("TestResource");
  });

  it("should auto-generate a UUID id when none is set", () => {
    const builder = new TestResourceBuilder();
    const resource = builder.build();
    expect(resource.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("should use the provided id when set", () => {
    const builder = new TestResourceBuilder();
    const resource = builder.id("custom-id-123").build();
    expect(resource.id).toBe("custom-id-123");
  });

  it("should set meta from a profile string", () => {
    const builder = new TestResourceBuilder();
    const resource = builder
      .meta("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient")
      .build();
    expect(resource.meta).toEqual({
      profile: [
        "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
      ],
    });
  });

  it("should set meta from a full Meta object", () => {
    const builder = new TestResourceBuilder();
    const resource = builder
      .meta({
        versionId: "1",
        lastUpdated: "2024-01-01T00:00:00Z",
        profile: ["http://example.com/profile"],
      })
      .build();
    expect(resource.meta?.versionId).toBe("1");
    expect(resource.meta?.lastUpdated).toBe("2024-01-01T00:00:00Z");
    expect(resource.meta?.profile).toEqual(["http://example.com/profile"]);
  });

  it("should add extensions", () => {
    const builder = new TestResourceBuilder();
    const resource = builder
      .extension({ url: "http://example.com/ext1", valueString: "hello" })
      .extension({ url: "http://example.com/ext2", valueBoolean: true })
      .build();
    expect(resource.extension).toHaveLength(2);
    expect(resource.extension?.[0]?.url).toBe("http://example.com/ext1");
    expect(resource.extension?.[1]?.valueBoolean).toBe(true);
  });

  it("should support fluent chaining", () => {
    const builder = new TestResourceBuilder();
    const result = builder
      .id("test-123")
      .meta("http://example.com/profile")
      .extension({ url: "http://example.com/ext", valueString: "val" });
    expect(result).toBe(builder);
  });

  it("should produce clean JSON without undefined values", () => {
    const builder = new TestResourceBuilder();
    const resource = builder.id("test-123").build();
    const json = JSON.stringify(resource);
    expect(json).not.toContain("undefined");
    expect(json).not.toContain("null");
  });

  it("toJSON should return a formatted JSON string", () => {
    const builder = new TestResourceBuilder();
    const json = builder.id("test-123").toJSON();
    const parsed = JSON.parse(json);
    expect(parsed.resourceType).toBe("TestResource");
    expect(parsed.id).toBe("test-123");
    // Should be pretty-printed
    expect(json).toContain("\n");
  });

  it("should generate different IDs for different builds", () => {
    const builder1 = new TestResourceBuilder();
    const builder2 = new TestResourceBuilder();
    const r1 = builder1.build();
    const r2 = builder2.build();
    expect(r1.id).not.toBe(r2.id);
  });
});
