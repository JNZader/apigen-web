# ADR 0001: Use Biome over ESLint + Prettier

## Status

Accepted

## Context

APiGen Studio needed a linting and formatting solution for its TypeScript/React codebase. The traditional choice in the React ecosystem is ESLint for linting combined with Prettier for formatting. However, this approach requires:

1. Maintaining two separate tools with different configurations
2. Resolving conflicts between ESLint and Prettier rules
3. Running two separate processes during CI/CD
4. Managing multiple plugin dependencies

We evaluated Biome as an alternative - a single tool that handles both linting and formatting.

## Decision

We chose to use **Biome** as our single tool for both linting and formatting, replacing the traditional ESLint + Prettier combination.

Configuration is maintained in a single `biome.json` file at the project root.

## Consequences

### Positive

- **Single tool instead of two**: Simpler mental model and fewer configuration files
- **Significantly faster execution**: Biome is 10-20x faster than ESLint + Prettier combined due to its Rust implementation
- **No configuration conflicts**: Eliminates the common problem of linter and formatter rules conflicting
- **Simpler CI/CD pipeline**: One command (`biome check`) handles everything
- **Consistent results**: Same tool handles both concerns with unified output
- **Lower maintenance burden**: Fewer dependencies to update and manage

### Negative

- **Less ecosystem support**: ESLint has a larger plugin ecosystem
- **Some ESLint rules not yet available**: Certain specialized rules may not have Biome equivalents
- **Team learning curve**: Developers familiar with ESLint need to learn Biome's rule names and configuration
- **Younger project**: Biome is newer, though actively maintained by the Rome Tools team

### Neutral

- Migration from ESLint was straightforward due to Biome's migration tooling
- IDE support is good (VS Code extension available)

## References

- [Biome Documentation](https://biomejs.dev/)
- [Biome vs ESLint Performance](https://biomejs.dev/blog/biome-v1-6/)
- [Biome Migration Guide](https://biomejs.dev/guides/migrate-eslint-prettier/)
