// Copyright 2026 FHIRfly.io LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.

/**
 * Fluent builder for FHIR R4 Bundle resources.
 *
 * Bundles tie individual resources together and are the #1 source of developer
 * errors in FHIR (broken references, missing fullUrls, wrong request methods).
 * This builder eliminates those pitfalls with automatic fullUrl generation,
 * smart transaction defaults, and one-call reference resolution.
 *
 * ```typescript
 * const bundle = new BundleBuilder('transaction')
 *   .add(patient)
 *   .add(encounter)
 *   .add(observation)
 *   .resolveReferences()
 *   .build();
 * ```
 *
 * ### Enrichment hooks (via @fhirfly-io/terminology)
 * Bundle-level enrichment is typically done per-resource before adding to
 * the bundle. See individual resource builder docs for enrichment patterns.
 */

import { ResourceBuilder } from "./resource-builder.js";
import { generateId, cleanObject, isUUID } from "./helpers.js";
import type { Identifier, Resource } from "./types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** FHIR Bundle type codes. */
export type BundleType =
  | "transaction"
  | "batch"
  | "document"
  | "collection"
  | "message"
  | "searchset";

/** HTTP verbs for Bundle entry requests. */
export type HTTPVerb = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH";

/** Search entry mode for searchset bundles. */
export type SearchEntryMode = "match" | "include" | "outcome";

/** A link in the bundle (self, next, prev for pagination). */
export interface BundleLink {
  relation: string;
  url: string;
}

/** Request element for transaction/batch entries. */
export interface BundleEntryRequest {
  method: HTTPVerb;
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

/** Search element for searchset entries. */
export interface BundleEntrySearch {
  mode?: SearchEntryMode;
  score?: number;
}

/** Response element (typically on transaction-response). */
export interface BundleEntryResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
}

/** A single entry in the bundle. */
export interface BundleEntry {
  fullUrl?: string;
  resource?: Resource;
  request?: BundleEntryRequest;
  response?: BundleEntryResponse;
  search?: BundleEntrySearch;
  link?: BundleLink[];
}

/** The built Bundle resource shape. */
export interface BundleResource extends Resource {
  resourceType: "Bundle";
  type: BundleType;
  total?: number;
  timestamp?: string;
  identifier?: Identifier;
  link?: BundleLink[];
  entry?: BundleEntry[];
}

/** Options for adding a resource to the bundle via `.add()`. */
export interface AddEntryOptions {
  /** HTTP method for transaction/batch entries. Default: POST. */
  method?: HTTPVerb;
  /** Request URL override. Auto-generated if omitted. */
  url?: string;
  /** Override the auto-generated fullUrl (urn:uuid:{id}). */
  fullUrl?: string;
  /** Search info for searchset entries. */
  search?: BundleEntrySearch;
  /** Conditional create: only create if no match. */
  ifNoneExist?: string;
  /** Conditional update: ETag match. */
  ifMatch?: string;
  /** Conditional read: ETag no-match. */
  ifNoneMatch?: string;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export class BundleBuilder extends ResourceBuilder<BundleResource> {
  private entries: BundleEntry[] = [];
  private bundleLinks: BundleLink[] = [];

  constructor(type: BundleType = "collection") {
    super("Bundle");
    (this.resource as Record<string, unknown>).type = type;
  }

  /** Set the bundle type. */
  type(type: BundleType): this {
    (this.resource as Record<string, unknown>).type = type;
    return this;
  }

  /** Set the bundle timestamp (instant). */
  timestamp(instant: string): this {
    (this.resource as Record<string, unknown>).timestamp = instant;
    return this;
  }

  /** Set the bundle identifier. */
  identifier(value: string, system: string): this {
    (this.resource as Record<string, unknown>).identifier = { system, value };
    return this;
  }

  /** Set the bundle total (for searchset bundles). */
  total(count: number): this {
    (this.resource as Record<string, unknown>).total = count;
    return this;
  }

  /**
   * Add a link to the bundle (self, next, prev for pagination).
   *
   * ```typescript
   * builder.link('self', 'http://example.org/Patient?name=jane')
   *        .link('next', 'http://example.org/Patient?name=jane&page=2');
   * ```
   */
  link(relation: string, url: string): this {
    this.bundleLinks.push({ relation, url });
    return this;
  }

  /**
   * Add a resource to the bundle.
   *
   * The resource is deep-cloned so the original is never modified by
   * `resolveReferences()` or any other mutation.
   *
   * For transaction/batch bundles, a `request` element is auto-generated:
   * - Default: `method=POST`, `url={resourceType}`
   * - PUT/DELETE: `url={resourceType}/{id}`
   * - Override with `options.method` and `options.url`
   *
   * The `fullUrl` defaults to `urn:uuid:{resource.id}`.
   */
  add(resource: Resource, options?: AddEntryOptions): this {
    // Deep-clone to avoid mutating the caller's object
    const cloned = JSON.parse(JSON.stringify(resource)) as Resource;

    // Ensure the resource has an id for reference resolution
    if (!cloned.id) {
      cloned.id = generateId();
    }

    const fullUrl = options?.fullUrl ?? `urn:uuid:${isUUID(cloned.id!) ? cloned.id : generateId()}`;

    const entry: BundleEntry = {
      fullUrl,
      resource: cloned,
    };

    // Auto-generate request for transaction/batch bundles
    const bundleType = (this.resource as Record<string, unknown>)
      .type as BundleType;
    if (bundleType === "transaction" || bundleType === "batch") {
      const method = options?.method ?? "POST";
      let url: string;
      if (options?.url) {
        url = options.url;
      } else if (method === "PUT" || method === "DELETE") {
        url = `${cloned.resourceType}/${cloned.id}`;
      } else {
        url = cloned.resourceType;
      }

      const request: BundleEntryRequest = { method, url };
      if (options?.ifNoneMatch) request.ifNoneMatch = options.ifNoneMatch;
      if (options?.ifMatch) request.ifMatch = options.ifMatch;
      if (options?.ifNoneExist) request.ifNoneExist = options.ifNoneExist;
      entry.request = request;
    }

    // Search info for searchset entries
    if (options?.search) {
      entry.search = options.search;
    }

    this.entries.push(entry);
    return this;
  }

  /**
   * Add a raw BundleEntry for advanced use cases.
   * No auto-generation of fullUrl or request — you control everything.
   */
  addEntry(entry: BundleEntry): this {
    this.entries.push(JSON.parse(JSON.stringify(entry)) as BundleEntry);
    return this;
  }

  /**
   * Resolve internal references within the bundle.
   *
   * Scans all resources for FHIR Reference fields (`{ reference: "..." }`) and
   * rewrites them to use the entry's `fullUrl` when the referenced resource
   * exists in the bundle.
   *
   * References to resources **not** in the bundle are preserved as-is.
   *
   * ```typescript
   * // Before: observation.subject.reference = "Patient/patient-1"
   * // After:  observation.subject.reference = "urn:uuid:patient-1"
   * bundle.resolveReferences();
   * ```
   */
  resolveReferences(): this {
    // Build index: "ResourceType/id" -> fullUrl
    const refMap = new Map<string, string>();
    for (const entry of this.entries) {
      const resource = entry.resource;
      if (resource?.id) {
        const key = `${resource.resourceType}/${resource.id}`;
        refMap.set(key, entry.fullUrl ?? `urn:uuid:${isUUID(resource.id) ? resource.id : generateId()}`);
      }
    }

    // Walk each resource and rewrite matching references
    for (const entry of this.entries) {
      if (entry.resource) {
        walkAndResolve(entry.resource, refMap);
      }
    }

    return this;
  }

  /**
   * Build the Bundle resource.
   *
   * Assembles all entries and links into the final resource.
   * Auto-generates a UUID if no id was set.
   */
  build(): BundleResource {
    if (!this.resource.id) {
      this.resource.id = generateId();
    }

    const bundle = cleanObject(
      this.resource as Record<string, unknown>
    ) as BundleResource;

    if (this.entries.length > 0) {
      bundle.entry = this.entries.map(
        (e) => cleanObject(e as Record<string, unknown>) as BundleEntry
      );
    }

    if (this.bundleLinks.length > 0) {
      bundle.link = [...this.bundleLinks];
    }

    return bundle;
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Recursively walk an object graph and rewrite FHIR Reference fields
 * that match entries in the refMap.
 */
function walkAndResolve(
  obj: unknown,
  refMap: Map<string, string>
): void {
  if (obj === null || obj === undefined || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      walkAndResolve(item, refMap);
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  // If this object has a "reference" string field, check if it's resolvable
  if (typeof record.reference === "string") {
    const resolved = refMap.get(record.reference);
    if (resolved) {
      record.reference = resolved;
    }
  }

  // Recurse into all object/array child properties
  for (const value of Object.values(record)) {
    if (typeof value === "object" && value !== null) {
      walkAndResolve(value, refMap);
    }
  }
}
