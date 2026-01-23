# ADR 0002: Zustand for State Management

## Status

Accepted

## Context

APiGen Studio requires global state management for:

- Entity definitions (names, fields, configurations)
- Relations between entities
- Services and their configurations
- Service connections
- Canvas UI state (positions, selections, view modes)
- Project settings
- Undo/redo history

We evaluated several options:
1. **Redux Toolkit**: Industry standard, powerful but verbose
2. **Zustand**: Minimalist, hook-based, excellent TypeScript support
3. **Jotai/Recoil**: Atomic state management
4. **React Context + useReducer**: Built-in solution

## Decision

We chose **Zustand** for state management across the application.

Key implementation patterns:
- Separate stores for different domains (entity, relation, service, etc.)
- Atomic selectors for optimized re-renders
- Immer integration for immutable updates
- Persistence via `zustand/middleware`

## Consequences

### Positive

- **Minimal boilerplate**: No actions, reducers, or action creators needed
- **Excellent TypeScript support**: Full type inference without additional setup
- **Atomic selectors**: `useStore(state => state.value)` prevents unnecessary re-renders
- **No Provider needed**: Stores work outside React components
- **Small bundle size**: ~1KB gzipped
- **Easy testing**: Direct state manipulation in tests
- **Immer integration**: Simple immutable updates with `produce`
- **Flexible persistence**: Easy localStorage/sessionStorage integration

### Negative

- **Less structure**: No enforced patterns like Redux's actions/reducers
- **Smaller community**: Fewer resources and plugins compared to Redux
- **No DevTools built-in**: Requires additional setup for debugging (though zustand/middleware provides this)
- **Manual selector optimization**: Developers must remember to use atomic selectors

### Neutral

- State is mutable by default (Immer recommended for complex updates)
- Multiple stores vs single store is a design choice left to the team

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand vs Redux Comparison](https://docs.pmnd.rs/zustand/getting-started/comparison)
- [React State Management in 2024](https://www.robinwieruch.de/react-state/)
