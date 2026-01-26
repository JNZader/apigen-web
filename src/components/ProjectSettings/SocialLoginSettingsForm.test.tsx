import { useForm } from '@mantine/form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { SocialLoginSettingsForm } from './SocialLoginSettingsForm';

function TestWrapper({ initialValues }: { initialValues?: Partial<ProjectConfig> }) {
  const form = useForm<ProjectConfig>({
    initialValues: { ...defaultProjectConfig, ...initialValues },
  });

  return (
    <TestProviders>
      <SocialLoginSettingsForm form={form} />
    </TestProviders>
  );
}

describe('SocialLoginSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Rendering', () => {
    it('renders enable toggle', () => {
      render(<TestWrapper />);

      expect(screen.getByTestId('social-login-toggle')).toBeInTheDocument();
      expect(screen.getByText('Enable Social Login')).toBeInTheDocument();
    });

    it('shows provider options when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      expect(screen.getByTestId('provider-checkbox-google')).toBeInTheDocument();
      expect(screen.getByTestId('provider-checkbox-github')).toBeInTheDocument();
      expect(screen.getByTestId('provider-checkbox-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('provider-checkbox-apple')).toBeInTheDocument();
      expect(screen.getByTestId('provider-checkbox-microsoft')).toBeInTheDocument();
    });

    it('hides options when disabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: false },
          }}
        />,
      );

      // Mantine Collapse keeps elements in DOM but hides them visually
      expect(screen.queryByTestId('provider-checkbox-google')).not.toBeVisible();
      expect(screen.queryByTestId('provider-checkbox-github')).not.toBeVisible();
    });
  });

  describe('Toggle Interaction', () => {
    it('calls form onChange when toggling enabled', async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);

      const toggle = screen.getByTestId('social-login-toggle');
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId('provider-checkbox-google')).toBeInTheDocument();
      });
    });

    it('calls form onChange when selecting provider', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      const googleCheckbox = screen.getByTestId('provider-checkbox-google');
      await user.click(googleCheckbox);

      await waitFor(() => {
        expect(googleCheckbox).toBeChecked();
      });
    });
  });

  describe('Warning States', () => {
    it('shows warning when no providers selected', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      expect(screen.getByTestId('no-providers-warning')).toBeInTheDocument();
      expect(screen.getByText('No Providers Selected')).toBeInTheDocument();
    });

    it('hides warning when providers are selected', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              socialLogin: {
                ...defaultProjectConfig.featurePackConfig.socialLogin,
                providers: {
                  ...defaultProjectConfig.featurePackConfig.socialLogin.providers,
                  google: {
                    ...defaultProjectConfig.featurePackConfig.socialLogin.providers.google,
                    enabled: true,
                  },
                },
              },
            },
          }}
        />,
      );

      expect(screen.queryByTestId('no-providers-warning')).not.toBeInTheDocument();
    });
  });

  describe('Unsupported Language Alert', () => {
    it('shows unavailable message for unsupported language (Rust)', () => {
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

      expect(screen.getByTestId('social-login-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText('Feature Not Available')).toBeInTheDocument();
      expect(screen.getByText(/Social Login is not available for Rust/)).toBeInTheDocument();
    });

    it('shows unavailable message for unsupported language (Go)', () => {
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

      expect(screen.getByTestId('social-login-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText(/Social Login is not available for Go/)).toBeInTheDocument();
    });

    it('does not show unavailable message for supported language (Java)', () => {
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

      expect(screen.queryByTestId('social-login-unavailable-alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('social-login-toggle')).toBeInTheDocument();
    });
  });

  describe('Provider Configuration', () => {
    it('shows provider configuration fields when provider is enabled', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      const googleCheckbox = screen.getByTestId('provider-checkbox-google');
      await user.click(googleCheckbox);

      await waitFor(() => {
        expect(screen.getByTestId('provider-google-client-id')).toBeInTheDocument();
        expect(screen.getByTestId('provider-google-client-secret')).toBeInTheDocument();
      });
    });

    it('hides provider configuration when provider is disabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      // Mantine Collapse keeps elements in DOM but hides them visually
      expect(screen.queryByTestId('provider-google-client-id')).not.toBeVisible();
    });
  });

  describe('General Settings', () => {
    it('shows auto-link accounts toggle when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      expect(screen.getByTestId('auto-link-accounts-toggle')).toBeInTheDocument();
      expect(screen.getByText('Auto-link Accounts')).toBeInTheDocument();
    });

    it('shows require email verification toggle when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            features: { ...defaultProjectConfig.features, socialLogin: true },
          }}
        />,
      );

      expect(screen.getByTestId('require-email-verification-toggle')).toBeInTheDocument();
      expect(screen.getByText('Require Email Verification')).toBeInTheDocument();
    });
  });
});
