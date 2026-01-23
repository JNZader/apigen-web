# Changelog

All notable changes to APiGen Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test suite for `EntityForm` component (22 tests)
- Comprehensive test suite for `DesignerPage` component (20 tests)
- Testing infrastructure with store reset utilities
- GitHub Actions CI/CD pipeline with quality, test, E2E, and build jobs
- Pre-commit hooks with Husky and lint-staged
- Path aliases for cleaner imports (`@/`)
- Test factories for mock data generation

### Changed

- Refactored `ProjectSettings.tsx` into modular sub-components
- Migrated direct notification calls to centralized `notify.*` utilities
- Improved test isolation with proper store reset between tests

### Fixed

- CI workflow artifact upload failures with `continue-on-error`
- TypeScript errors in test utilities (`storeReset.ts`)
- ProjectSettings form fields alignment with type definitions
- Error Boundaries in modals causing intermittent issues

## [0.2.0] - 2025-01-20

### Added

- Performance optimizations with virtualized entity lists
- Centralized API client with AbortController, retry logic, and Zod validation
- Playwright E2E tests (9 tests)
- Custom hooks for DesignerCanvas (split from monolithic component)
- Service filter tabs and context menu assignment
- Vercel Analytics integration

### Changed

- Improved code quality and maintainability
- Refactored canvas hooks for better separation of concerns

### Fixed

- SonarQube issues (27 issues + 1 security hotspot)
- ServiceNode empty state text
- TypeScript types in test files

## [0.1.0] - 2025-01-15

### Added

- Initial release of APiGen Studio
- Visual API designer with React Flow canvas
- Entity creation and management
- Relation management between entities
- Service grouping functionality
- SQL import/export capabilities
- Code generation integration with backend API
- Project persistence with localStorage
- Undo/redo functionality
- Dark mode support
- Export to ZIP functionality

### Technical Stack

- React 19 with TypeScript
- Mantine UI components
- Zustand for state management
- Vite for build tooling
- Biome for linting and formatting
- Vitest for unit testing
- Playwright for E2E testing

[Unreleased]: https://github.com/JNZader/apigen-web/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/JNZader/apigen-web/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/JNZader/apigen-web/releases/tag/v0.1.0
