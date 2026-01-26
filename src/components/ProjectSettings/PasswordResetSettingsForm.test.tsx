import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { PasswordResetSettingsForm } from './PasswordResetSettingsForm';

describe('PasswordResetSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('renders enable toggle', () => {
    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    expect(screen.getByTestId('password-reset-toggle')).toBeInTheDocument();
    expect(screen.getByText('Enable Password Reset')).toBeInTheDocument();
  });

  it('shows warning when mail is not enabled', async () => {
    const user = userEvent.setup();

    // Enable password reset but mail is disabled by default
    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    const toggle = screen.getByTestId('password-reset-toggle');
    await user.click(toggle);

    expect(screen.getByTestId('mail-required-warning')).toBeInTheDocument();
    expect(screen.getByText('Mail Service Required')).toBeInTheDocument();
  });

  it('does not show warning when mail is enabled', async () => {
    const user = userEvent.setup();

    // Enable mail service first
    useProjectStoreInternal.setState((state) => ({
      project: {
        ...state.project,
        featurePackConfig: {
          ...state.project.featurePackConfig,
          mail: {
            ...state.project.featurePackConfig.mail,
            enabled: true,
          },
        },
      },
    }));

    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    const toggle = screen.getByTestId('password-reset-toggle');
    await user.click(toggle);

    expect(screen.queryByTestId('mail-required-warning')).not.toBeInTheDocument();
  });

  it('shows what gets generated when enabled', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    // Initially, generated items should not be visible (Collapse keeps in DOM but hides)
    expect(screen.queryByTestId('generated-items-section')).not.toBeVisible();

    const toggle = screen.getByTestId('password-reset-toggle');
    await user.click(toggle);

    await waitFor(() => {
      expect(screen.getByTestId('generated-items-section')).toBeVisible();
    });
    expect(screen.getByText('This will generate:')).toBeInTheDocument();
  });

  it('shows PasswordResetToken in generated list', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    const toggle = screen.getByTestId('password-reset-toggle');
    await user.click(toggle);

    expect(screen.getByTestId('generated-item-token')).toBeInTheDocument();
    expect(screen.getByText('PasswordResetToken')).toBeInTheDocument();
  });

  it('shows PasswordResetService in generated list', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    const toggle = screen.getByTestId('password-reset-toggle');
    await user.click(toggle);

    expect(screen.getByTestId('generated-item-service')).toBeInTheDocument();
    expect(screen.getByText('PasswordResetService')).toBeInTheDocument();
  });

  it('shows PasswordResetController in generated list', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    const toggle = screen.getByTestId('password-reset-toggle');
    await user.click(toggle);

    expect(screen.getByTestId('generated-item-controller')).toBeInTheDocument();
    expect(screen.getByText('PasswordResetController')).toBeInTheDocument();
  });

  it('shows unavailable for Rust', () => {
    // Set language to Rust
    useProjectStoreInternal.setState((state) => ({
      project: {
        ...state.project,
        targetConfig: {
          ...state.project.targetConfig,
          language: 'rust',
          framework: 'axum',
        },
      },
    }));

    render(
      <TestProviders>
        <PasswordResetSettingsForm />
      </TestProviders>,
    );

    expect(screen.getByTestId('password-reset-unavailable-alert')).toBeInTheDocument();
    expect(screen.getByText('Not Available')).toBeInTheDocument();
    expect(screen.getByText(/Password Reset is not available for Rust/)).toBeInTheDocument();
  });
});
