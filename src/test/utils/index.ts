/**
 * Test Utilities
 *
 * This module exports test utilities including custom render functions and test providers.
 */

// Re-export everything from @testing-library/react for convenience
export {
  act,
  cleanup,
  fireEvent,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
// Re-export userEvent setup
export { default as userEvent } from '@testing-library/user-event';
export { render } from './render';
// Store reset utilities
export {
  resetAllStores,
  resetCanvasStores,
  resetEntityStore,
  resetHistoryStore,
  resetRelationStore,
  resetServiceStores,
} from './storeReset';
export { TestProviders, TestProvidersMinimal } from './TestProviders';
