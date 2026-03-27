# Contributing to @fhirfly-io/fhir-builder

Thank you for your interest in contributing! We welcome contributions that help make FHIR resource construction simpler for developers.

## What We Accept

- **New resource builders** — following the existing builder pattern in `src/`
- **Bug fixes** — with a test that reproduces the issue
- **Documentation improvements** — typos, clarifications, new examples
- **Test coverage** — additional tests for existing builders

## What We Don't Accept

- Changes to enrichment integration or FHIRfly API connectivity
- FHIR server or storage functionality
- CCDA/HL7v2 conversion features
- FHIR R5/R6 support (R4 only for now)

## Development Setup

```bash
git clone https://github.com/FHIRfly-io/fhir-builder.git
cd fhir-builder
npm install
git config core.hooksPath .hooks

# Verify everything works
npm run typecheck
npm run lint
npm test
npm run build
```

## Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/resource-name`)
3. Write tests first (or simultaneously)
4. Implement the change
5. Ensure all checks pass: `npm run typecheck && npm run lint && npm test`
6. Commit with a descriptive message
7. Open a pull request

## Code Style

- All `.ts` files must start with the copyright header:
  ```typescript
  // Copyright 2026 FHIRfly.io LLC. All rights reserved.
  // Licensed under the Apache License, Version 2.0. See LICENSE file in the project root.
  ```
- Zero runtime dependencies
- Strict TypeScript (see `tsconfig.json`)
- ESLint must pass

## Adding a New Resource Builder

1. Create `src/{resource-name}-builder.ts`
2. Extend `ResourceBuilder<YourResourceType>`
3. Add fluent setter methods that return `this`
4. Add shorthand methods for common code systems (e.g., `.loincCode()`, `.icd10()`)
5. Export from `src/index.ts`
6. Add factory method to `FHIRBuilder` class
7. Write tests in `tests/{resource-name}-builder.test.ts`
8. Add to the resource table in `README.md`

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
