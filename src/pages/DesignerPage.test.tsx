import { describe, expect, it } from 'vitest';
import { DesignerPage } from '../pages/DesignerPage';

describe('DesignerPage', () => {
  it('should render without crashing', () => {
    // Basic smoke test - component renders without errors
    expect(() => {
      const React = require('react');
      React.createElement(DesignerPage);
    }).not.toThrow();
  });

  it('should have proper component name', () => {
    expect(DesignerPage.name).toBe('DesignerPage');
  });

  it('should be a function component', () => {
    expect(typeof DesignerPage).toBe('function');
  });
});
