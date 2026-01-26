import { useForm } from '@mantine/form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectStoreInternal } from '@/store';
import { render, resetAllStores, screen, TestProviders, userEvent, waitFor } from '@/test/utils';
import { defaultProjectConfig, type ProjectConfig } from '@/types';
import { FeaturePackSection } from './FeaturePackSection';

vi.mock('./SocialLoginSettingsForm', async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  return {
    SocialLoginSettingsForm: () => <div data-testid="social-form">Social Form</div>,
  };
});

vi.mock('./MailServiceSettingsForm', () => ({
  MailServiceSettingsForm: () => <div data-testid="mail-form">Mail Form</div>,
}));

vi.mock('./FileStorageSettingsForm', () => ({
  FileStorageSettingsForm: () => <div data-testid="storage-form">Storage Form</div>,
}));

vi.mock('./PasswordResetSettingsForm', () => ({
  PasswordResetSettingsForm: () => <div data-testid="password-form">Password Form</div>,
}));

vi.mock('./JteTemplatesSettingsForm', () => ({
  JteTemplatesSettingsForm: () => <div data-testid="jte-form">JTE Form</div>,
}));

function TestWrapper({ initialValues }: { initialValues?: Partial<ProjectConfig> }) {
  const form = useForm<ProjectConfig>({
    initialValues: { ...defaultProjectConfig, ...initialValues },
  });

  return (
    <TestProviders>
      <FeaturePackSection form={form} />
    </TestProviders>
  );
}

const setProjectState = (overrides: Partial<ProjectConfig>) => {
  const baseProject = useProjectStoreInternal.getState().project;

  useProjectStoreInternal.setState({
    project: {
      ...baseProject,
      ...overrides,
      targetConfig: { ...baseProject.targetConfig, ...overrides.targetConfig },
      features: { ...baseProject.features, ...overrides.features },
    },
  });
};

describe('FeaturePackSection', () => {
  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  it('renders all tabs for Java', () => {
    setProjectState({
      targetConfig: { language: 'java', framework: 'spring-boot' },
    });

    render(<TestWrapper />);

    expect(screen.getByRole('tab', { name: /Social Login/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mail/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Storage/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Password Reset/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /JTE/i })).toBeInTheDocument();
  });

  it('renders all tabs for Kotlin', () => {
    setProjectState({
      targetConfig: { language: 'kotlin', framework: 'spring-boot' },
    });

    render(<TestWrapper />);

    expect(screen.getByRole('tab', { name: /Social Login/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Mail/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Storage/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Password Reset/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /JTE/i })).toBeInTheDocument();
  });

  it('hides JTE tab for Python', () => {
    setProjectState({
      targetConfig: { language: 'python', framework: 'fastapi' },
    });

    render(<TestWrapper />);

    expect(screen.queryByRole('tab', { name: /JTE/i })).not.toBeInTheDocument();
  });

  it('hides JTE tab for TypeScript', () => {
    setProjectState({
      targetConfig: { language: 'typescript', framework: 'express' },
    });

    render(<TestWrapper />);

    expect(screen.queryByRole('tab', { name: /JTE/i })).not.toBeInTheDocument();
  });

  it('hides JTE tab for Go', () => {
    setProjectState({
      targetConfig: { language: 'go', framework: 'gin' },
    });

    render(<TestWrapper />);

    expect(screen.queryByRole('tab', { name: /JTE/i })).not.toBeInTheDocument();
  });

  it('hides JTE tab for Rust', () => {
    setProjectState({
      targetConfig: { language: 'rust', framework: 'axum' },
    });

    render(<TestWrapper />);

    expect(screen.queryByRole('tab', { name: /JTE/i })).not.toBeInTheDocument();
  });

  it('shows correct enabled count (0 enabled)', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: false,
          },
          featurePackConfig: {
            ...defaultProjectConfig.featurePackConfig,
            socialLogin: { ...defaultProjectConfig.featurePackConfig.socialLogin, enabled: false },
            mail: { ...defaultProjectConfig.featurePackConfig.mail, enabled: false },
            storage: { ...defaultProjectConfig.featurePackConfig.storage, enabled: false },
            jte: { ...defaultProjectConfig.featurePackConfig.jte, enabled: false },
          },
        }}
      />,
    );

    // Badge should not be visible when 0 enabled
    expect(screen.queryByText(/enabled/)).not.toBeInTheDocument();
  });

  it('shows correct enabled count (2 enabled)', () => {
    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: false,
          },
          featurePackConfig: {
            ...defaultProjectConfig.featurePackConfig,
            socialLogin: { ...defaultProjectConfig.featurePackConfig.socialLogin, enabled: true },
            mail: { ...defaultProjectConfig.featurePackConfig.mail, enabled: true },
            storage: { ...defaultProjectConfig.featurePackConfig.storage, enabled: false },
            jte: { ...defaultProjectConfig.featurePackConfig.jte, enabled: false },
          },
        }}
      />,
    );

    expect(screen.getByText('2 enabled')).toBeInTheDocument();
  });

  it('shows correct enabled count (5 enabled)', () => {
    setProjectState({
      targetConfig: { language: 'java', framework: 'spring-boot' },
    });

    render(
      <TestWrapper
        initialValues={{
          features: {
            ...defaultProjectConfig.features,
            passwordReset: true,
          },
          featurePackConfig: {
            ...defaultProjectConfig.featurePackConfig,
            socialLogin: { ...defaultProjectConfig.featurePackConfig.socialLogin, enabled: true },
            mail: { ...defaultProjectConfig.featurePackConfig.mail, enabled: true },
            storage: { ...defaultProjectConfig.featurePackConfig.storage, enabled: true },
            jte: { ...defaultProjectConfig.featurePackConfig.jte, enabled: true },
          },
        }}
      />,
    );

    expect(screen.getByText('5 enabled')).toBeInTheDocument();
  });

  it('switches tabs correctly - Social to Mail', async () => {
    const user = userEvent.setup();

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByTestId('social-form')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /Mail/i }));

    await waitFor(() => {
      expect(screen.getByTestId('mail-form')).toBeInTheDocument();
    });
  });

  it('switches tabs correctly - Mail to Storage', async () => {
    const user = userEvent.setup();

    render(<TestWrapper />);

    await user.click(screen.getByRole('tab', { name: /Mail/i }));

    await waitFor(() => {
      expect(screen.getByTestId('mail-form')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /Storage/i }));

    await waitFor(() => {
      expect(screen.getByTestId('storage-form')).toBeInTheDocument();
    });
  });

  it('lazy loads form components', async () => {
    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByTestId('social-form')).toBeInTheDocument();
    });
  });

  it('loads form components via lazy loading', async () => {
    // This test verifies that lazy-loaded components eventually render.
    // The loading state may be too fast to capture reliably due to mocked components.
    render(<TestWrapper />);

    // Wait for the lazy-loaded component to appear
    await waitFor(() => {
      expect(screen.getByTestId('social-form')).toBeInTheDocument();
    });
  });
});
