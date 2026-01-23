/**
 * Test Infrastructure
 *
 * This module provides the main entry point for test utilities in APiGen Studio.
 * Import test utilities from here for a consistent testing experience.
 *
 * @example
 * ```tsx
 * // Import utilities for component testing
 * import { render, screen, resetAllStores } from '@/test';
 * import { createMockEntity } from '@/test/factories';
 *
 * describe('MyComponent', () => {
 *   beforeEach(() => {
 *     resetAllStores();
 *   });
 *
 *   it('should render entity', () => {
 *     const entity = createMockEntity({ name: 'Product' });
 *     render(<MyComponent entity={entity} />);
 *     expect(screen.getByText('Product')).toBeInTheDocument();
 *   });
 * });
 * ```
 */

// Test factories (mock data generators)
export * from './factories';
// Test mocks (React Flow, etc.)
export * from './mocks';
// Test utilities (custom render, providers, store reset)
export * from './utils';
