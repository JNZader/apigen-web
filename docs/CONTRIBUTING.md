# Contributing to APiGen Studio

First off, thank you for considering contributing to APiGen Studio! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful, constructive, and collaborative.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Docker (optional, for containerized development)

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/apigen-web.git
cd apigen-web

# Install dependencies
npm install

# Start development server
npm run dev

# Or use Docker
docker compose up dev
```

### Project Structure

```
src/
├── components/    # React components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── store/         # Zustand stores
├── types/         # TypeScript types
└── utils/         # Utility functions
```

---

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment info** (browser, OS, etc.)

### Suggesting Features

Feature requests are welcome! Please include:

- **Use case** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought of
- **Mockups** (optional) - Visual examples if applicable

### Code Contributions

1. **Find or create an issue** to work on
2. **Fork the repository** to your account
3. **Create a branch** from `main`
4. **Make your changes** following our style guide
5. **Write/update tests** if applicable
6. **Submit a pull request**

---

## Style Guide

### TypeScript

```typescript
// Use explicit types
function addEntity(name: string): EntityDesign {
  // ...
}

// Use interfaces for objects
interface EntityDesign {
  id: string;
  name: string;
  fields: FieldDesign[];
}

// Use type for unions/primitives
type JavaType = 'String' | 'Long' | 'Integer';
```

### React Components

```tsx
// Functional components with explicit return type
export function EntityCard({ entity, onEdit }: EntityCardProps): JSX.Element {
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}

// Props interface naming convention
interface EntityCardProps {
  entity: EntityDesign;
  onEdit: () => void;
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `EntityCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useSelectedEntity.ts`)
- Utils: `camelCase.ts` (e.g., `codeGenerator.ts`)
- Types: `camelCase.ts` (e.g., `entity.ts`)

### Imports

```typescript
// Order: React, external libs, internal modules, types
import { useState, useCallback } from 'react';
import { Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useProjectStore } from '../store/projectStore';
import type { EntityDesign } from '../types';
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(entity): add field validation preview
fix(canvas): prevent infinite re-render on drag
docs(readme): add Docker setup instructions
refactor(store): use atomic selectors for performance
```

---

## Pull Request Process

### Before Submitting

1. **Update your fork** with latest `main`
2. **Run linting**: `npm run lint`
3. **Run build**: `npm run build`
4. **Test your changes** manually

### PR Requirements

- [ ] Descriptive title following commit conventions
- [ ] Description of changes made
- [ ] Link to related issue (if any)
- [ ] Screenshots for UI changes
- [ ] No linting errors
- [ ] Build passes successfully

### Review Process

1. **Automated checks** run on PR
2. **Maintainer review** within 1-3 days
3. **Address feedback** if requested
4. **Merge** when approved

---

## Development Tips

### Using Atomic Selectors

```typescript
// ✅ Good - subscribes only to what's needed
const entities = useEntities();
const { addEntity } = useEntityActions();

// ❌ Bad - subscribes to entire store
const { entities, addEntity } = useProjectStore();
```

### Memoization

```typescript
// Memoize expensive computations
const filtered = useMemo(
  () => entities.filter(e => e.name.includes(search)),
  [entities, search]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Adding New Components

1. Create component file in `src/components/`
2. Add types to `src/types/` if needed
3. Export from index if public API
4. Add to store if state management needed

---

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion for ideas
- Reach out to maintainers

Thank you for contributing! 🎉
