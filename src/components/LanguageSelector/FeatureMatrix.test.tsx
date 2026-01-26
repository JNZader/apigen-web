import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetAllStores, TestProviders } from '../../test/utils';
import type { Framework } from '../../types/target';
import { FRAMEWORK_METADATA } from '../../types/target';
import {
  DEFAULT_FEATURES,
  FeatureMatrix,
  type FeatureWithSupport,
  type SupportLevel,
} from './FeatureMatrix';

describe('FeatureMatrix', () => {
  const defaultFrameworks: Framework[] = ['spring-boot', 'fastapi', 'nestjs'];
  const mockOnFrameworkSelect = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the feature matrix container', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-matrix')).toBeInTheDocument();
    });

    it('should render all framework headers', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      for (const framework of defaultFrameworks) {
        const meta = FRAMEWORK_METADATA[framework];
        expect(screen.getByTestId(`framework-header-${framework}`)).toBeInTheDocument();
        expect(screen.getByText(meta.label)).toBeInTheDocument();
      }
    });

    it('should render all default features', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      for (const feature of DEFAULT_FEATURES) {
        expect(screen.getByTestId(`feature-row-${feature.id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`feature-name-${feature.id}`)).toHaveTextContent(feature.name);
      }
    });

    it('should render the Feature column header', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('should render cells for each feature-framework combination', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      for (const feature of DEFAULT_FEATURES) {
        for (const framework of defaultFrameworks) {
          expect(screen.getByTestId(`cell-${feature.id}-${framework}`)).toBeInTheDocument();
        }
      }
    });

    it('should render custom features when provided', () => {
      const customFeatures: FeatureWithSupport[] = [
        {
          id: 'custom-feature',
          name: 'Custom Feature',
          category: 'Custom',
          support: {
            'spring-boot': 'full',
            fastapi: 'partial',
            nestjs: 'none',
            laravel: 'full',
            gin: 'full',
            chi: 'full',
            axum: 'full',
            'aspnet-core': 'full',
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} features={customFeatures} />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-row-custom-feature')).toBeInTheDocument();
      expect(screen.getByText('Custom Feature')).toBeInTheDocument();
    });

    it('should render with a subset of frameworks', () => {
      const subsetFrameworks: Framework[] = ['gin', 'chi'];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={subsetFrameworks} />
        </TestProviders>,
      );

      expect(screen.getByTestId('framework-header-gin')).toBeInTheDocument();
      expect(screen.getByTestId('framework-header-chi')).toBeInTheDocument();
      expect(screen.queryByTestId('framework-header-spring-boot')).not.toBeInTheDocument();
    });

    it('should render with all 8 frameworks', () => {
      const allFrameworks: Framework[] = [
        'spring-boot',
        'fastapi',
        'nestjs',
        'laravel',
        'gin',
        'chi',
        'axum',
        'aspnet-core',
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={allFrameworks} />
        </TestProviders>,
      );

      for (const framework of allFrameworks) {
        expect(screen.getByTestId(`framework-header-${framework}`)).toBeInTheDocument();
      }
    });
  });

  describe('Support Indicators', () => {
    it('should render full support indicator with green color', () => {
      const features: FeatureWithSupport[] = [
        {
          id: 'test-full',
          name: 'Full Support Test',
          category: 'Test',
          support: {
            'spring-boot': 'full',
            fastapi: 'full',
            nestjs: 'full',
            laravel: 'full',
            gin: 'full',
            chi: 'full',
            axum: 'full',
            'aspnet-core': 'full',
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={['spring-boot']} features={features} />
        </TestProviders>,
      );

      const cell = screen.getByTestId('cell-test-full-spring-boot');
      const indicator = within(cell).getByTestId('support-indicator-full');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Fully supported');
    });

    it('should render partial support indicator with yellow color', () => {
      const features: FeatureWithSupport[] = [
        {
          id: 'test-partial',
          name: 'Partial Support Test',
          category: 'Test',
          support: {
            'spring-boot': 'partial',
            fastapi: 'partial',
            nestjs: 'partial',
            laravel: 'partial',
            gin: 'partial',
            chi: 'partial',
            axum: 'partial',
            'aspnet-core': 'partial',
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={['spring-boot']} features={features} />
        </TestProviders>,
      );

      const cell = screen.getByTestId('cell-test-partial-spring-boot');
      const indicator = within(cell).getByTestId('support-indicator-partial');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Partially supported');
    });

    it('should render no support indicator with red color', () => {
      const features: FeatureWithSupport[] = [
        {
          id: 'test-none',
          name: 'No Support Test',
          category: 'Test',
          support: {
            'spring-boot': 'none',
            fastapi: 'none',
            nestjs: 'none',
            laravel: 'none',
            gin: 'none',
            chi: 'none',
            axum: 'none',
            'aspnet-core': 'none',
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={['spring-boot']} features={features} />
        </TestProviders>,
      );

      const cell = screen.getByTestId('cell-test-none-spring-boot');
      const indicator = within(cell).getByTestId('support-indicator-none');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Not supported');
    });

    it('should render mixed support indicators correctly', () => {
      const features: FeatureWithSupport[] = [
        {
          id: 'mixed',
          name: 'Mixed Support',
          category: 'Test',
          support: {
            'spring-boot': 'full',
            fastapi: 'partial',
            nestjs: 'none',
            laravel: 'full',
            gin: 'full',
            chi: 'full',
            axum: 'full',
            'aspnet-core': 'full',
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={['spring-boot', 'fastapi', 'nestjs']} features={features} />
        </TestProviders>,
      );

      const fullCell = screen.getByTestId('cell-mixed-spring-boot');
      expect(within(fullCell).getByTestId('support-indicator-full')).toBeInTheDocument();

      const partialCell = screen.getByTestId('cell-mixed-fastapi');
      expect(within(partialCell).getByTestId('support-indicator-partial')).toBeInTheDocument();

      const noneCell = screen.getByTestId('cell-mixed-nestjs');
      expect(within(noneCell).getByTestId('support-indicator-none')).toBeInTheDocument();
    });

    it.each<[SupportLevel, string]>([
      ['full', 'Fully supported'],
      ['partial', 'Partially supported'],
      ['none', 'Not supported'],
    ])('should have correct aria-label for %s support level', (level, expectedLabel) => {
      const features: FeatureWithSupport[] = [
        {
          id: `test-${level}`,
          name: `${level} Test`,
          category: 'Test',
          support: {
            'spring-boot': level,
            fastapi: level,
            nestjs: level,
            laravel: level,
            gin: level,
            chi: level,
            axum: level,
            'aspnet-core': level,
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={['spring-boot']} features={features} />
        </TestProviders>,
      );

      const indicator = screen.getByTestId(`support-indicator-${level}`);
      expect(indicator).toHaveAttribute('aria-label', expectedLabel);
    });
  });

  describe('Selected Column', () => {
    it('should highlight the selected framework header', () => {
      render(
        <TestProviders>
          <FeatureMatrix
            frameworks={defaultFrameworks}
            selectedFramework="fastapi"
            onFrameworkSelect={mockOnFrameworkSelect}
          />
        </TestProviders>,
      );

      const selectedHeader = screen.getByTestId('framework-header-fastapi');
      expect(selectedHeader).toHaveAttribute('data-selected', 'true');

      const unselectedHeader = screen.getByTestId('framework-header-spring-boot');
      expect(unselectedHeader).toHaveAttribute('data-selected', 'false');
    });

    it('should highlight cells in the selected column', () => {
      render(
        <TestProviders>
          <FeatureMatrix
            frameworks={defaultFrameworks}
            selectedFramework="nestjs"
            onFrameworkSelect={mockOnFrameworkSelect}
          />
        </TestProviders>,
      );

      for (const feature of DEFAULT_FEATURES) {
        const selectedCell = screen.getByTestId(`cell-${feature.id}-nestjs`);
        expect(selectedCell).toHaveAttribute('data-selected', 'true');

        const unselectedCell = screen.getByTestId(`cell-${feature.id}-spring-boot`);
        expect(unselectedCell).toHaveAttribute('data-selected', 'false');
      }
    });

    it('should not highlight any column when no framework is selected', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      for (const framework of defaultFrameworks) {
        const header = screen.getByTestId(`framework-header-${framework}`);
        expect(header).toHaveAttribute('data-selected', 'false');
      }
    });

    it('should update highlighted column when selection changes', () => {
      const { rerender } = render(
        <TestProviders>
          <FeatureMatrix
            frameworks={defaultFrameworks}
            selectedFramework="spring-boot"
            onFrameworkSelect={mockOnFrameworkSelect}
          />
        </TestProviders>,
      );

      expect(screen.getByTestId('framework-header-spring-boot')).toHaveAttribute(
        'data-selected',
        'true',
      );

      rerender(
        <TestProviders>
          <FeatureMatrix
            frameworks={defaultFrameworks}
            selectedFramework="fastapi"
            onFrameworkSelect={mockOnFrameworkSelect}
          />
        </TestProviders>,
      );

      expect(screen.getByTestId('framework-header-spring-boot')).toHaveAttribute(
        'data-selected',
        'false',
      );
      expect(screen.getByTestId('framework-header-fastapi')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    it('should show aria-pressed true for selected header', () => {
      render(
        <TestProviders>
          <FeatureMatrix
            frameworks={defaultFrameworks}
            selectedFramework="spring-boot"
            onFrameworkSelect={mockOnFrameworkSelect}
          />
        </TestProviders>,
      );

      const selectedHeader = screen.getByTestId('framework-header-spring-boot');
      expect(selectedHeader).toHaveAttribute('aria-pressed', 'true');

      const unselectedHeader = screen.getByTestId('framework-header-fastapi');
      expect(unselectedHeader).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Header Click Interactions', () => {
    it('should call onFrameworkSelect when clicking a header', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-fastapi');
      await user.click(header);

      expect(mockOnFrameworkSelect).toHaveBeenCalledTimes(1);
      expect(mockOnFrameworkSelect).toHaveBeenCalledWith('fastapi');
    });

    it('should call onFrameworkSelect with correct framework for each header', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      for (const framework of defaultFrameworks) {
        mockOnFrameworkSelect.mockClear();
        const header = screen.getByTestId(`framework-header-${framework}`);
        await user.click(header);
        expect(mockOnFrameworkSelect).toHaveBeenCalledWith(framework);
      }
    });

    it('should support keyboard Enter key for header selection', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-nestjs');
      header.focus();
      await user.keyboard('{Enter}');

      expect(mockOnFrameworkSelect).toHaveBeenCalledWith('nestjs');
    });

    it('should support keyboard Space key for header selection', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-spring-boot');
      header.focus();
      await user.keyboard(' ');

      expect(mockOnFrameworkSelect).toHaveBeenCalledWith('spring-boot');
    });

    it('should not have button role when onFrameworkSelect is not provided', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-spring-boot');
      expect(header).not.toHaveAttribute('role', 'button');
    });

    it('should have button role when onFrameworkSelect is provided', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-spring-boot');
      expect(header).toHaveAttribute('role', 'button');
    });

    it('should be focusable when onFrameworkSelect is provided', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-spring-boot');
      expect(header).toHaveAttribute('tabIndex', '0');
    });

    it('should not be focusable when onFrameworkSelect is not provided', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      const header = screen.getByTestId('framework-header-spring-boot');
      expect(header).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label on framework headers', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} onFrameworkSelect={mockOnFrameworkSelect} />
        </TestProviders>,
      );

      for (const framework of defaultFrameworks) {
        const meta = FRAMEWORK_METADATA[framework];
        const header = screen.getByTestId(`framework-header-${framework}`);
        expect(header).toHaveAttribute('aria-label', `Select ${meta.label} framework`);
      }
    });

    it('should have aria-label on framework headers without onFrameworkSelect', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      for (const framework of defaultFrameworks) {
        const meta = FRAMEWORK_METADATA[framework];
        const header = screen.getByTestId(`framework-header-${framework}`);
        expect(header).toHaveAttribute('aria-label', meta.label);
      }
    });

    it('should render a table element for screen readers', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      const matrix = screen.getByTestId('feature-matrix');
      expect(matrix.querySelector('table')).toBeInTheDocument();
    });

    it('should have proper table header structure', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} />
        </TestProviders>,
      );

      const matrix = screen.getByTestId('feature-matrix');
      expect(matrix.querySelector('thead')).toBeInTheDocument();
      expect(matrix.querySelector('tbody')).toBeInTheDocument();
    });
  });

  describe('Default Features Coverage', () => {
    it('should include CRUD Operations feature', () => {
      expect(DEFAULT_FEATURES.find((f) => f.id === 'crud')).toBeDefined();
    });

    it('should include Input Validation feature', () => {
      expect(DEFAULT_FEATURES.find((f) => f.id === 'validation')).toBeDefined();
    });

    it('should include Authentication feature', () => {
      expect(DEFAULT_FEATURES.find((f) => f.id === 'auth')).toBeDefined();
    });

    it('should include OpenAPI/Swagger feature', () => {
      expect(DEFAULT_FEATURES.find((f) => f.id === 'openapi')).toBeDefined();
    });

    it('should include ORM Integration feature', () => {
      expect(DEFAULT_FEATURES.find((f) => f.id === 'orm')).toBeDefined();
    });

    it('should include Testing Framework feature', () => {
      expect(DEFAULT_FEATURES.find((f) => f.id === 'testing')).toBeDefined();
    });

    it('should have support definitions for all 8 frameworks in each feature', () => {
      const allFrameworks: Framework[] = [
        'spring-boot',
        'fastapi',
        'nestjs',
        'laravel',
        'gin',
        'chi',
        'axum',
        'aspnet-core',
      ];

      for (const feature of DEFAULT_FEATURES) {
        for (const framework of allFrameworks) {
          expect(feature.support[framework]).toBeDefined();
          expect(['full', 'partial', 'none']).toContain(feature.support[framework]);
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty frameworks array', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={[]} />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-matrix')).toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });

    it('should handle empty features array', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} features={[]} />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-matrix')).toBeInTheDocument();
      for (const framework of defaultFrameworks) {
        expect(screen.getByTestId(`framework-header-${framework}`)).toBeInTheDocument();
      }
    });

    it('should handle single framework', () => {
      render(
        <TestProviders>
          <FeatureMatrix frameworks={['axum']} />
        </TestProviders>,
      );

      expect(screen.getByTestId('framework-header-axum')).toBeInTheDocument();
      expect(screen.queryByTestId('framework-header-spring-boot')).not.toBeInTheDocument();
    });

    it('should handle single feature', () => {
      const singleFeature: FeatureWithSupport[] = [
        {
          id: 'single',
          name: 'Single Feature',
          category: 'Test',
          support: {
            'spring-boot': 'full',
            fastapi: 'full',
            nestjs: 'full',
            laravel: 'full',
            gin: 'full',
            chi: 'full',
            axum: 'full',
            'aspnet-core': 'full',
          },
        },
      ];

      render(
        <TestProviders>
          <FeatureMatrix frameworks={defaultFrameworks} features={singleFeature} />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-row-single')).toBeInTheDocument();
      expect(screen.queryByTestId('feature-row-crud')).not.toBeInTheDocument();
    });
  });
});
