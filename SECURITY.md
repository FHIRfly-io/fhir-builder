# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in `@fhirfly-io/fhir-builder`, please report it responsibly:

1. **Email:** [security@fhirfly.io](mailto:security@fhirfly.io)
2. **Do not** open a public GitHub issue for security vulnerabilities
3. Include a description of the vulnerability, steps to reproduce, and potential impact

## Response Timeline

- **Acknowledgment:** Within 48 hours of receipt
- **Initial assessment:** Within 5 business days
- **Resolution:** Varies by severity; critical issues are prioritized

## Scope

`@fhirfly-io/fhir-builder` is a **pure data builder** with zero runtime dependencies. It does not:

- Make network requests
- Access the filesystem
- Execute external processes
- Handle authentication or credentials

The primary attack surface is malformed input data that could produce unexpected FHIR JSON output.

## Disclosure

We follow coordinated disclosure. We will work with you to understand and address the issue before any public disclosure.
