import { useForm } from '@mantine/form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { MailServiceSettingsForm } from './MailServiceSettingsForm';

// Wrapper component to provide form context
function TestWrapper({
  initialValues = defaultProjectConfig,
}: {
  readonly initialValues?: ProjectConfig;
}) {
  const form = useForm<ProjectConfig>({
    initialValues,
  });

  return (
    <TestProviders>
      <MailServiceSettingsForm form={form} />
    </TestProviders>
  );
}

describe('MailServiceSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Rendering', () => {
    it('renders enable toggle', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Enable Mail Service')).toBeInTheDocument();
      expect(screen.getByTestId('mail-enable-toggle')).toBeInTheDocument();
    });

    it('shows SMTP fields when enabled', () => {
      const config = {
        ...defaultProjectConfig,
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          mail: {
            ...defaultProjectConfig.featurePackConfig.mail,
            enabled: true,
          },
        },
      };

      render(<TestWrapper initialValues={config} />);

      expect(screen.getByTestId('smtp-host-input')).toBeInTheDocument();
      expect(screen.getByTestId('smtp-port-input')).toBeInTheDocument();
      expect(screen.getByTestId('smtp-username-input')).toBeInTheDocument();
      expect(screen.getByTestId('smtp-encryption-select')).toBeInTheDocument();
    });

    it('hides SMTP fields when disabled', () => {
      render(<TestWrapper />);

      // The Collapse component still renders content but hides it
      // Check that the toggle is unchecked (mail disabled)
      expect(screen.getByTestId('mail-enable-toggle')).not.toBeChecked();

      // SMTP fields are inside collapsed content and not visible
      const hostInput = screen.queryByTestId('smtp-host-input');
      if (hostInput) {
        expect(hostInput).not.toBeVisible();
      }
    });

    it('shows template checkboxes when enabled', () => {
      const config = {
        ...defaultProjectConfig,
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          mail: {
            ...defaultProjectConfig.featurePackConfig.mail,
            enabled: true,
          },
        },
      };

      render(<TestWrapper initialValues={config} />);

      expect(screen.getByTestId('template-welcome-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('template-password-reset-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('template-jte-checkbox')).toBeInTheDocument();
    });
  });

  describe('Unavailable for Rust', () => {
    it('shows unavailable alert for Rust language', () => {
      // Set store to Rust language
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

      expect(screen.getByTestId('mail-unavailable-alert')).toBeInTheDocument();
      expect(screen.getByText(/Mail Service is not available for Rust/i)).toBeInTheDocument();
      expect(screen.queryByTestId('mail-enable-toggle')).not.toBeInTheDocument();
    });

    it('shows form for non-Rust languages', () => {
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

      expect(screen.queryByTestId('mail-unavailable-alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('mail-enable-toggle')).toBeInTheDocument();
    });
  });

  describe('Email Validation', () => {
    it('validates email format for fromAddress', async () => {
      const config = {
        ...defaultProjectConfig,
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          mail: {
            ...defaultProjectConfig.featurePackConfig.mail,
            enabled: true,
            fromAddress: 'invalid-email',
          },
        },
      };

      render(<TestWrapper initialValues={config} />);

      // Wait for Collapse to expand and show the content
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('does not show error for valid email', () => {
      const config = {
        ...defaultProjectConfig,
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          mail: {
            ...defaultProjectConfig.featurePackConfig.mail,
            enabled: true,
            fromAddress: 'valid@example.com',
          },
        },
      };

      render(<TestWrapper initialValues={config} />);

      expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
    });

    it('does not show error for empty email', () => {
      const config = {
        ...defaultProjectConfig,
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          mail: {
            ...defaultProjectConfig.featurePackConfig.mail,
            enabled: true,
            fromAddress: '',
          },
        },
      };

      render(<TestWrapper initialValues={config} />);

      expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('toggles mail service on click', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      const toggle = screen.getByTestId('mail-enable-toggle');
      expect(toggle).not.toBeChecked();

      await user.click(toggle);

      expect(toggle).toBeChecked();
    });

    it('shows SMTP fields after enabling', async () => {
      const user = userEvent.setup();

      render(<TestWrapper />);

      // Before enabling, toggle should be unchecked
      expect(screen.getByTestId('mail-enable-toggle')).not.toBeChecked();

      await user.click(screen.getByTestId('mail-enable-toggle'));

      // After enabling, toggle should be checked
      expect(screen.getByTestId('mail-enable-toggle')).toBeChecked();

      // Wait for collapse animation to complete and SMTP fields to become visible
      await waitFor(() => {
        expect(screen.getByTestId('smtp-host-input')).toBeVisible();
      });
    });

    it('allows entering SMTP host', async () => {
      const user = userEvent.setup();
      const config = {
        ...defaultProjectConfig,
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          mail: {
            ...defaultProjectConfig.featurePackConfig.mail,
            enabled: true,
          },
        },
      };

      render(<TestWrapper initialValues={config} />);

      const hostInput = screen.getByTestId('smtp-host-input');
      await user.clear(hostInput);
      await user.type(hostInput, 'smtp.example.com');

      expect(hostInput).toHaveValue('smtp.example.com');
    });
  });
});
