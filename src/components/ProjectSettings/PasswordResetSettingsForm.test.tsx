import { useForm } from '@mantine/form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { PasswordResetSettingsForm } from './PasswordResetSettingsForm';

function TestWrapper({ initialValues }: { initialValues?: Partial<ProjectConfig> }) {
  const form = useForm<ProjectConfig>({
    initialValues: { ...defaultProjectConfig, ...initialValues },
  });

  return (
    <TestProviders>
      <PasswordResetSettingsForm form={form} />
    </TestProviders>
  );
}

describe('PasswordResetSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('renders enable toggle', () => {
    render(<TestWrapper />);

    expect(screen.getByText('Enable Password Reset')).toBeInTheDocument();
    expect(
      screen.getByText('Generate password reset functionality with email-based recovery'),
    ).toBeInTheDocument();
  });

  it('shows warning when mail is not enabled but password reset is', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
            mailService: false,
          },
        }}
      />,
    );

    expect(screen.getByText('Mail Service Required')).toBeInTheDocument();
    expect(screen.getByText(/Password Reset requires Mail Service/)).toBeInTheDocument();
  });

  it('does not show warning when mail is enabled', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
            mailService: true,
          },
        }}
      />,
    );

    expect(screen.queryByText('Mail Service Required')).not.toBeInTheDocument();
  });

  it('shows generated components when enabled', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
        }}
      />,
    );

    expect(screen.getByText('Generated Components')).toBeInTheDocument();
    expect(screen.getByText('The following will be generated:')).toBeInTheDocument();
  });

  it('shows PasswordResetToken in generated list', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
        }}
      />,
    );

    expect(screen.getByText('PasswordResetToken')).toBeInTheDocument();
    expect(screen.getByText(/Entity for storing reset tokens/)).toBeInTheDocument();
  });

  it('shows PasswordResetService in generated list', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
        }}
      />,
    );

    expect(screen.getByText('PasswordResetService')).toBeInTheDocument();
    expect(screen.getByText(/Business logic for password reset flow/)).toBeInTheDocument();
  });

  it('shows PasswordResetController in generated list', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
        }}
      />,
    );

    expect(screen.getByText('PasswordResetController')).toBeInTheDocument();
    expect(screen.getByText(/REST endpoints for password reset/)).toBeInTheDocument();
  });

  it('shows limited support warning for Rust', () => {
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

    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
        }}
      />,
    );

    expect(screen.getByText('Limited Support for Rust')).toBeInTheDocument();
    expect(screen.getByText(/JTE Templates are not available for Rust/)).toBeInTheDocument();
  });

  it('shows generated endpoints when enabled', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
        }}
      />,
    );

    expect(screen.getByText('Generated Endpoints')).toBeInTheDocument();
    expect(screen.getByText('POST /api/auth/password/forgot')).toBeInTheDocument();
    expect(screen.getByText('POST /api/auth/password/reset')).toBeInTheDocument();
  });

  it('toggles password reset on click', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    // Find the switch by its role (Mantine uses role="switch")
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();

    await user.click(toggle);

    await waitFor(() => {
      expect(toggle).toBeChecked();
    });
  });
});
