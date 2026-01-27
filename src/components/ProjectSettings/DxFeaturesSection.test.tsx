import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '@/store';
import { render, resetAllStores, screen, userEvent, waitFor } from '@/test/utils';
import type { ProjectFeatures } from '@/types';
import { DxFeaturesSection } from './DxFeaturesSection';

const setProjectState = (overrides: { features?: Partial<ProjectFeatures> }) => {
  const baseProject = useProjectStoreInternal.getState().project;

  useProjectStoreInternal.setState({
    project: {
      ...baseProject,
      features: { ...baseProject.features, ...overrides.features },
    },
  });
};

describe('DxFeaturesSection', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('renders all DX feature cards', () => {
    render(<DxFeaturesSection />);

    expect(screen.getByText('Mise Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pre-commit Hooks')).toBeInTheDocument();
    expect(screen.getByText('Setup Scripts')).toBeInTheDocument();
    expect(screen.getByText('GitHub Templates')).toBeInTheDocument();
    expect(screen.getByText('Dev Compose')).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(<DxFeaturesSection />);

    expect(screen.getByText('Developer Experience')).toBeInTheDocument();
  });

  it('shows correct enabled count when all enabled (default)', () => {
    render(<DxFeaturesSection />);

    expect(screen.getByText('5/5 enabled')).toBeInTheDocument();
  });

  it('shows correct enabled count when none enabled', () => {
    setProjectState({
      features: {
        miseTasks: false,
        preCommit: false,
        setupScript: false,
        githubTemplates: false,
        devCompose: false,
      },
    });

    render(<DxFeaturesSection />);

    expect(screen.getByText('0/5 enabled')).toBeInTheDocument();
  });

  it('shows correct enabled count when some enabled', () => {
    setProjectState({
      features: {
        miseTasks: true,
        preCommit: true,
        setupScript: false,
        githubTemplates: false,
        devCompose: false,
      },
    });

    render(<DxFeaturesSection />);

    expect(screen.getByText('2/5 enabled')).toBeInTheDocument();
  });

  it('toggles individual feature on click', async () => {
    const user = userEvent.setup();

    setProjectState({
      features: {
        miseTasks: true,
        preCommit: true,
        setupScript: true,
        githubTemplates: true,
        devCompose: true,
      },
    });

    render(<DxFeaturesSection />);

    // Find the switch for "Mise Tasks" and click it
    const miseTasksSwitch = screen.getByRole('switch', { name: 'Enable Mise Tasks' });
    expect(miseTasksSwitch).toBeChecked();

    await user.click(miseTasksSwitch);

    await waitFor(() => {
      expect(useProjectStoreInternal.getState().project.features.miseTasks).toBe(false);
    });
  });

  it('toggles all features on when "All" switch is clicked', async () => {
    const user = userEvent.setup();

    setProjectState({
      features: {
        miseTasks: false,
        preCommit: false,
        setupScript: false,
        githubTemplates: false,
        devCompose: false,
      },
    });

    render(<DxFeaturesSection />);

    // Find the "All" toggle and click it
    const allSwitch = screen.getByRole('switch', { name: 'All' });
    expect(allSwitch).not.toBeChecked();

    await user.click(allSwitch);

    await waitFor(() => {
      const { features } = useProjectStoreInternal.getState().project;
      expect(features.miseTasks).toBe(true);
      expect(features.preCommit).toBe(true);
      expect(features.setupScript).toBe(true);
      expect(features.githubTemplates).toBe(true);
      expect(features.devCompose).toBe(true);
    });
  });

  it('toggles all features off when "All" switch is clicked while all enabled', async () => {
    const user = userEvent.setup();

    setProjectState({
      features: {
        miseTasks: true,
        preCommit: true,
        setupScript: true,
        githubTemplates: true,
        devCompose: true,
      },
    });

    render(<DxFeaturesSection />);

    // Find the "All" toggle and click it
    const allSwitch = screen.getByRole('switch', { name: 'All' });
    expect(allSwitch).toBeChecked();

    await user.click(allSwitch);

    await waitFor(() => {
      const { features } = useProjectStoreInternal.getState().project;
      expect(features.miseTasks).toBe(false);
      expect(features.preCommit).toBe(false);
      expect(features.setupScript).toBe(false);
      expect(features.githubTemplates).toBe(false);
      expect(features.devCompose).toBe(false);
    });
  });

  it('displays file badges for each feature', () => {
    render(<DxFeaturesSection />);

    // Check for some file badges
    expect(screen.getByText('mise.toml')).toBeInTheDocument();
    expect(screen.getByText('.pre-commit-config.yaml')).toBeInTheDocument();
    expect(screen.getByText('scripts/setup.sh')).toBeInTheDocument();
  });

  it('displays info alert about DX features', () => {
    render(<DxFeaturesSection />);

    expect(
      screen.getByText(/These features generate configuration files for development tooling/),
    ).toBeInTheDocument();
  });
});
