import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { JteTemplatesSettingsForm } from './JteTemplatesSettingsForm';

describe('JteTemplatesSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Language Support', () => {
    it('renders enable toggle for Java', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'java',
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-enable-toggle')).toBeInTheDocument();
      expect(screen.getByText('Enable JTE Templates')).toBeInTheDocument();
    });

    it('renders enable toggle for Kotlin', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'kotlin',
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-enable-toggle')).toBeInTheDocument();
      expect(screen.getByText('Enable JTE Templates')).toBeInTheDocument();
    });

    it('shows unavailable for Python', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'python',
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText('Not Available')).toBeInTheDocument();
      expect(screen.getByText(/Current language: python/)).toBeInTheDocument();
    });

    it('shows unavailable for TypeScript', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'typescript',
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText(/Current language: typescript/)).toBeInTheDocument();
    });

    it('shows unavailable for Go', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'go',
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText(/Current language: go/)).toBeInTheDocument();
    });

    it('shows unavailable for Rust', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'rust',
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText(/Current language: rust/)).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    beforeEach(() => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'java',
          },
          featurePackConfig: {
            ...useProjectStoreInternal.getState().project.featurePackConfig,
            jte: {
              ...useProjectStoreInternal.getState().project.featurePackConfig.jte,
              enabled: true,
            },
          },
        },
      });
    });

    it('shows template selection when enabled', () => {
      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-template-selection')).toBeInTheDocument();
      expect(screen.getByText('Select Templates to Generate:')).toBeInTheDocument();
    });

    it('shows Login Page template option', () => {
      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-template-login')).toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('shows Dashboard template option', () => {
      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.getByTestId('jte-template-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('hides template selection when disabled', () => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          featurePackConfig: {
            ...useProjectStoreInternal.getState().project.featurePackConfig,
            jte: {
              ...useProjectStoreInternal.getState().project.featurePackConfig.jte,
              enabled: false,
            },
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      expect(screen.queryByTestId('jte-template-selection')).not.toBeInTheDocument();
    });
  });

  describe('Store Interactions', () => {
    beforeEach(() => {
      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          targetConfig: {
            ...useProjectStoreInternal.getState().project.targetConfig,
            language: 'java',
          },
        },
      });
    });

    it('calls setFeaturePackConfig when toggling enable', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      const toggle = screen.getByTestId('jte-enable-toggle');
      await user.click(toggle);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.featurePackConfig.jte.enabled).toBe(true);
      });
    });

    it('calls updateJteConfig when toggling template', async () => {
      const user = userEvent.setup();

      useProjectStoreInternal.setState({
        project: {
          ...useProjectStoreInternal.getState().project,
          featurePackConfig: {
            ...useProjectStoreInternal.getState().project.featurePackConfig,
            jte: {
              ...useProjectStoreInternal.getState().project.featurePackConfig.jte,
              enabled: true,
            },
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      const loginCheckbox = screen.getByTestId('jte-template-login');
      await user.click(loginCheckbox);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        const selectedTemplates = (
          state.project.featurePackConfig.jte as { selectedTemplates?: string[] }
        ).selectedTemplates;
        expect(selectedTemplates).toContain('login');
      });
    });

    it('removes template when unchecking', async () => {
      const user = userEvent.setup();

      const baseProject = useProjectStoreInternal.getState().project;
      const baseJte = baseProject.featurePackConfig.jte;
      useProjectStoreInternal.setState({
        project: {
          ...baseProject,
          featurePackConfig: {
            ...baseProject.featurePackConfig,
            jte: {
              ...baseJte,
              enabled: true,
              selectedTemplates: ['login', 'dashboard'],
            } as typeof baseJte & { selectedTemplates: string[] },
          },
        },
      });

      render(
        <TestProviders>
          <JteTemplatesSettingsForm />
        </TestProviders>,
      );

      const loginCheckbox = screen.getByTestId('jte-template-login');
      await user.click(loginCheckbox);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        const selectedTemplates = (
          state.project.featurePackConfig.jte as { selectedTemplates?: string[] }
        ).selectedTemplates;
        expect(selectedTemplates).not.toContain('login');
        expect(selectedTemplates).toContain('dashboard');
      });
    });
  });
});
