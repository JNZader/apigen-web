import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { LANGUAGE_METADATA, LANGUAGES } from '../../types/target';
import {
  FeatureMatrix,
  FEATURES,
  FEATURE_SUPPORT,
  FeatureSummary,
} from './FeatureMatrix';

describe('FeatureMatrix', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Rendering', () => {
    it('should render the feature matrix card', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-matrix')).toBeInTheDocument();
      expect(screen.getByText('Feature Support Matrix')).toBeInTheDocument();
    });

    it('should render all language headers', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      for (const language of LANGUAGES) {
        const meta = LANGUAGE_METADATA[language];
        expect(screen.getByTestId(`header-${language}`)).toBeInTheDocument();
        expect(screen.getByTestId(`header-${language}`)).toHaveTextContent(meta.label);
      }
    });

    it('should render all features', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      for (const feature of FEATURES) {
        expect(screen.getByTestId(`feature-row-${feature.id}`)).toBeInTheDocument();
        expect(screen.getByText(feature.name)).toBeInTheDocument();
      }
    });

    it('should render category rows when showCategories is true', () => {
      render(
        <TestProviders>
          <FeatureMatrix showCategories={true} />
        </TestProviders>,
      );

      expect(screen.getByTestId('category-row-core')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-database')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-api')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-security')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-observability')).toBeInTheDocument();
      expect(screen.getByTestId('category-row-advanced')).toBeInTheDocument();
    });

    it('should not render category rows when showCategories is false', () => {
      render(
        <TestProviders>
          <FeatureMatrix showCategories={false} />
        </TestProviders>,
      );

      expect(screen.queryByTestId('category-row-core')).not.toBeInTheDocument();
      expect(screen.queryByTestId('category-row-database')).not.toBeInTheDocument();
    });

    it('should render legend for support levels', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      expect(screen.getByText('Full support')).toBeInTheDocument();
      expect(screen.getByText('Partial support')).toBeInTheDocument();
      expect(screen.getByText('Not supported')).toBeInTheDocument();
    });
  });

  describe('Support Indicators', () => {
    it('should render correct support indicators for each feature/language combination', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      // Check a known "full" support cell (CRUD for Java)
      const crudJavaCell = screen.getByTestId('cell-crud-java');
      expect(within(crudJavaCell).getByTestId('support-indicator-full')).toBeInTheDocument();

      // Check a known "partial" support cell (validation for Go)
      const validationGoCell = screen.getByTestId('cell-validation-go');
      expect(within(validationGoCell).getByTestId('support-indicator-partial')).toBeInTheDocument();

      // Check a known "none" support cell (audit-log for Rust)
      const auditRustCell = screen.getByTestId('cell-audit-log-rust');
      expect(within(auditRustCell).getByTestId('support-indicator-none')).toBeInTheDocument();
    });

    it('should have correct aria-labels on support indicators', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      const crudJavaCell = screen.getByTestId('cell-crud-java');
      const indicator = within(crudJavaCell).getByTestId('support-indicator-full');
      expect(indicator).toHaveAttribute('aria-label', 'CRUD Operations Full support in Java');
    });
  });

  describe('Selected Language Highlighting', () => {
    it('should highlight the selected language column (default: Java)', () => {
      render(
        <TestProviders>
          <FeatureMatrix highlightSelected={true} />
        </TestProviders>,
      );

      const javaHeader = screen.getByTestId('header-java');
      expect(javaHeader).toHaveAttribute('data-selected', 'true');

      const pythonHeader = screen.getByTestId('header-python');
      expect(pythonHeader).toHaveAttribute('data-selected', 'false');
    });

    it('should highlight cells for the selected language', () => {
      render(
        <TestProviders>
          <FeatureMatrix highlightSelected={true} />
        </TestProviders>,
      );

      const javaCell = screen.getByTestId('cell-crud-java');
      expect(javaCell).toHaveAttribute('data-selected', 'true');

      const pythonCell = screen.getByTestId('cell-crud-python');
      expect(pythonCell).toHaveAttribute('data-selected', 'false');
    });

    it('should update highlighting when language changes', async () => {
      render(
        <TestProviders>
          <FeatureMatrix highlightSelected={true} />
        </TestProviders>,
      );

      // Initially Java is selected
      expect(screen.getByTestId('header-java')).toHaveAttribute('data-selected', 'true');

      // Change language in store
      useProjectStoreInternal.getState().setTargetConfig({ language: 'python' });

      // Re-render to see the change (state update)
      render(
        <TestProviders>
          <FeatureMatrix highlightSelected={true} />
        </TestProviders>,
      );

      // Now Python should be selected
      expect(screen.getByTestId('header-python')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('header-java')).toHaveAttribute('data-selected', 'false');
    });

    it('should not highlight when highlightSelected is false', () => {
      render(
        <TestProviders>
          <FeatureMatrix highlightSelected={false} />
        </TestProviders>,
      );

      const javaHeader = screen.getByTestId('header-java');
      expect(javaHeader).toHaveAttribute('data-selected', 'false');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table with aria-label', () => {
      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute(
        'aria-label',
        'Feature support matrix showing which features are supported by each programming language',
      );
    });

    it('should have tooltips on feature names', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <FeatureMatrix />
        </TestProviders>,
      );

      const crudFeature = screen.getByText('CRUD Operations');
      await user.hover(crudFeature);

      // Tooltip should appear
      expect(
        await screen.findByText('Basic Create, Read, Update, Delete operations for entities'),
      ).toBeInTheDocument();
    });
  });

  describe('Feature Support Data Integrity', () => {
    it('should have support data for all features', () => {
      for (const feature of FEATURES) {
        expect(FEATURE_SUPPORT[feature.id]).toBeDefined();
      }
    });

    it('should have support levels for all languages in each feature', () => {
      for (const feature of FEATURES) {
        for (const language of LANGUAGES) {
          const support = FEATURE_SUPPORT[feature.id]?.[language];
          expect(['full', 'partial', 'none']).toContain(support);
        }
      }
    });
  });
});

describe('FeatureSummary', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Rendering', () => {
    it('should render the feature summary card', () => {
      render(
        <TestProviders>
          <FeatureSummary />
        </TestProviders>,
      );

      expect(screen.getByTestId('feature-summary')).toBeInTheDocument();
    });

    it('should show the selected language name (default: Java)', () => {
      render(
        <TestProviders>
          <FeatureSummary />
        </TestProviders>,
      );

      expect(screen.getByText('Java Feature Coverage')).toBeInTheDocument();
    });

    it('should show counts for full, partial, and none support levels', () => {
      render(
        <TestProviders>
          <FeatureSummary />
        </TestProviders>,
      );

      // Java has mostly full support
      expect(screen.getByText(/\d+ full/)).toBeInTheDocument();
      expect(screen.getByText(/\d+ partial/)).toBeInTheDocument();
      expect(screen.getByText(/\d+ none/)).toBeInTheDocument();
    });

    it('should show coverage percentage', () => {
      render(
        <TestProviders>
          <FeatureSummary />
        </TestProviders>,
      );

      // Should have a percentage badge
      expect(screen.getByText(/%$/)).toBeInTheDocument();
    });
  });

  describe('Language Override', () => {
    it('should use provided language instead of selected', () => {
      render(
        <TestProviders>
          <FeatureSummary language="rust" />
        </TestProviders>,
      );

      expect(screen.getByText('Rust Feature Coverage')).toBeInTheDocument();
    });
  });

  describe('Coverage Calculation', () => {
    it('should calculate correct counts for Java', () => {
      render(
        <TestProviders>
          <FeatureSummary language="java" />
        </TestProviders>,
      );

      // Count Java supports from FEATURE_SUPPORT
      let full = 0;
      let partial = 0;
      let none = 0;

      for (const feature of FEATURES) {
        const support = FEATURE_SUPPORT[feature.id]?.java;
        if (support === 'full') full++;
        else if (support === 'partial') partial++;
        else none++;
      }

      expect(screen.getByText(`${full} full`)).toBeInTheDocument();
      expect(screen.getByText(`${partial} partial`)).toBeInTheDocument();
      expect(screen.getByText(`${none} none`)).toBeInTheDocument();
    });
  });
});
