import { useForm } from '@mantine/form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { JteTemplatesSettingsForm } from './JteTemplatesSettingsForm';

function TestWrapper({ initialValues }: { initialValues?: Partial<ProjectConfig> }) {
  const form = useForm<ProjectConfig>({
    initialValues: { ...defaultProjectConfig, ...initialValues },
  });

  return (
    <TestProviders>
      <JteTemplatesSettingsForm form={form} />
    </TestProviders>
  );
}

describe('JteTemplatesSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Language Support', () => {
    it('renders enable toggle for Java', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'java',
            framework: 'spring-boot',
          },
        },
      });

      render(<TestWrapper />);

      expect(screen.getByText('Enable JTE Templates')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders enable toggle for Kotlin', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'kotlin',
            framework: 'spring-boot',
          },
        },
      });

      render(<TestWrapper />);

      expect(screen.getByText('Enable JTE Templates')).toBeInTheDocument();
    });

    it('shows unavailable for Python', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'python',
            framework: 'fastapi',
          },
        },
      });

      render(<TestWrapper />);

      expect(screen.getByText('Language Not Supported')).toBeInTheDocument();
      expect(
        screen.getByText(/JTE.*templates are only available for Java and Kotlin/),
      ).toBeInTheDocument();
    });

    it('shows unavailable for TypeScript', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'typescript',
            framework: 'nestjs',
          },
        },
      });

      render(<TestWrapper />);

      expect(screen.getByText('Language Not Supported')).toBeInTheDocument();
    });

    it('shows unavailable for Go', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'go',
            framework: 'gin',
          },
        },
      });

      render(<TestWrapper />);

      expect(screen.getByText('Language Not Supported')).toBeInTheDocument();
    });

    it('shows unavailable for Rust', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'rust',
            framework: 'axum',
          },
        },
      });

      render(<TestWrapper />);

      expect(screen.getByText('Language Not Supported')).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    beforeEach(() => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'java',
            framework: 'spring-boot',
          },
        },
      });
    });

    it('shows template options when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, jteTemplates: true },
          }}
        />,
      );

      expect(screen.getByText('Select Templates')).toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('shows all available templates', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, jteTemplates: true },
          }}
        />,
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.getByText('Registration Page')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Error Pages')).toBeInTheDocument();
      expect(screen.getByText('Email Templates')).toBeInTheDocument();
    });

    it('shows what will be generated section', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, jteTemplates: true },
          }}
        />,
      );

      expect(screen.getByText('What will be generated')).toBeInTheDocument();
      expect(screen.getByText(/JTE Configuration/)).toBeInTheDocument();
      expect(screen.getByText(/Base Layout/)).toBeInTheDocument();
    });

    it('hides template selection when disabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, jteTemplates: false },
          }}
        />,
      );

      expect(screen.queryByText('Select Templates')).not.toBeVisible();
    });
  });

  describe('Toggle Interactions', () => {
    beforeEach(() => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          targetConfig: {
            ...defaultProjectConfig.targetConfig,
            language: 'java',
            framework: 'spring-boot',
          },
        },
      });
    });

    it('toggles JTE feature on click', async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);

      const toggle = screen.getByRole('switch', { name: /Enable JTE Templates/i });
      expect(toggle).not.toBeChecked();

      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toBeChecked();
      });
    });

    it('shows templates after enabling', async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);

      const toggle = screen.getByRole('switch', { name: /Enable JTE Templates/i });
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Select Templates')).toBeInTheDocument();
      });
    });

    it('can select template checkboxes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, jteTemplates: true },
          }}
        />,
      );

      const loginCheckbox = screen.getByRole('checkbox', { name: /Login Page/i });
      await user.click(loginCheckbox);

      await waitFor(() => {
        expect(loginCheckbox).toBeChecked();
      });
    });

    it('shows selected count badge', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, jteTemplates: true },
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              jte: {
                ...defaultProjectConfig.featurePackConfig.jte,
                selectedTemplates: ['login', 'dashboard'],
              },
            },
          }}
        />,
      );

      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
  });
});
