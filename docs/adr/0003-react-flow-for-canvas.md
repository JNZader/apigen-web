# ADR 0003: React Flow for Canvas Visualization

## Status

Accepted

## Context

APiGen Studio's core feature is a visual canvas where users can:

- Create and position entity nodes
- Create and position service nodes
- Draw relations between entities
- Draw connections between services
- Pan and zoom the canvas
- Export canvas as image

We evaluated several libraries:
1. **React Flow (@xyflow/react)**: Purpose-built for node-based UIs
2. **Konva/React-Konva**: General-purpose 2D canvas
3. **D3.js**: Low-level visualization library
4. **Cytoscape.js**: Graph theory library
5. **Custom Canvas API**: Build from scratch

## Decision

We chose **React Flow** (@xyflow/react) as the canvas visualization library.

Key features used:
- Custom node types (EntityNode, ServiceNode)
- Custom edge types (RelationEdge, ServiceConnectionEdge)
- Built-in controls (zoom, pan, fit view)
- MiniMap for navigation
- Background patterns
- Connection handling

## Consequences

### Positive

- **Purpose-built for node UIs**: Designed exactly for our use case
- **Excellent React integration**: Components are first-class React components
- **Rich feature set**: Pan, zoom, minimap, controls included
- **Custom nodes/edges**: Full control over appearance and behavior
- **TypeScript support**: Well-typed API
- **Active maintenance**: Regular updates and bug fixes
- **Good documentation**: Comprehensive guides and examples
- **Performance**: Handles hundreds of nodes efficiently
- **Accessibility**: Keyboard navigation support

### Negative

- **Bundle size**: Adds ~50KB gzipped to the bundle
- **Learning curve**: Specific API patterns to learn
- **Customization complexity**: Some advanced customizations require deep library knowledge
- **Version migrations**: Breaking changes between major versions (v11 to v12)

### Neutral

- Pro version available with additional features (not needed for current scope)
- CSS must be imported separately

## References

- [React Flow Documentation](https://reactflow.dev/)
- [React Flow Examples](https://reactflow.dev/examples)
- [React Flow GitHub](https://github.com/xyflow/xyflow)
