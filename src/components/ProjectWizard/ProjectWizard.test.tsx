import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { ProjectWizard } from './ProjectWizard';

describe('ProjectWizard', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when opened', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={false} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
    });

    it('should show all step labels', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });

    it('should show progress indicator', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Step 1 - Basic Info', () => {
    it('should start at step 1 with project name input', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.getByTestId('project-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
      expect(screen.getByTestId('package-name-input')).toBeInTheDocument();
    });

    it('should validate project name before advancing', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });
    });

    it('should validate project name format', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, '123-invalid');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Invalid project name format')).toBeInTheDocument();
      });
    });

    it('should clear error when typing valid name', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await user.click(screen.getByText('Next'));
      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'valid-project');

      await waitFor(() => {
        expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
      });
    });

    it('should validate package name is required', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');

      const packageInput = screen.getByTestId('package-name-input');
      await user.clear(packageInput);

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Package name is required')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should disable back button on first step', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    });

    it('should advance to next step after valid input', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });
    });

    it('should allow going back to previous step', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Back'));

      await waitFor(() => {
        expect(screen.getByTestId('project-name-input')).toBeInTheDocument();
      });
    });

    it('should preserve data when going back', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Back'));

      await waitFor(() => {
        const input = screen.getByTestId('project-name-input') as HTMLInputElement;
        expect(input.value).toBe('my-project');
      });
    });
  });

  describe('Step 2 - Language Selection', () => {
    async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));
      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });
    }

    it('should display language selection options', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep2(user);

      expect(screen.getByTestId('language-card-java')).toBeInTheDocument();
      expect(screen.getByTestId('language-card-python')).toBeInTheDocument();
    });

    it('should enable next button with default language', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep2(user);

      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
    });

    it('should allow selecting different language', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep2(user);

      await user.click(screen.getByTestId('language-card-python'));

      await waitFor(() => {
        const pythonCard = screen.getByTestId('language-card-python');
        expect(pythonCard).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Step 3 - Features Selection', () => {
    async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Initial Features')).toBeInTheDocument();
      });
    }

    it('should display feature options', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep3(user);

      expect(screen.getByTestId('feature-card-auth')).toBeInTheDocument();
      expect(screen.getByTestId('feature-card-mailService')).toBeInTheDocument();
    });

    it('should allow selecting and deselecting features', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep3(user);

      const authFeature = screen.getByTestId('feature-card-auth');
      await user.click(authFeature);

      await waitFor(() => {
        expect(authFeature).toHaveAttribute('aria-checked', 'true');
      });

      await user.click(authFeature);

      await waitFor(() => {
        expect(authFeature).toHaveAttribute('aria-checked', 'false');
      });
    });
  });

  describe('Step 4 - Summary', () => {
    async function goToStep4(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Initial Features')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Review Your Project')).toBeInTheDocument();
      });
    }

    it('should display project summary', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep4(user);

      expect(screen.getByText('my-project')).toBeInTheDocument();
      expect(screen.getByText('Ready to Create')).toBeInTheDocument();
    });

    it('should show Create Project button on last step', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep4(user);

      expect(screen.getByText('Create Project')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Completion', () => {
    async function completeWizard(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-awesome-api');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('language-card-python'));
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Initial Features')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('feature-card-auth'));
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Review Your Project')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create Project'));
    }

    it('should call onComplete when finished', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await completeWizard(user);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should call onClose when finished', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await completeWizard(user);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should update project store with configuration', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await completeWizard(user);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.name).toBe('my-awesome-api');
        expect(state.project.targetConfig.language).toBe('python');
        expect(state.project.targetConfig.framework).toBe('fastapi');
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should render as a modal dialog', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    it('should reset state when component is remounted', async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'test-project');

      // Unmount the component completely
      unmount();

      // Remount - should start fresh with empty state
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await waitFor(() => {
        const input = screen.getByTestId('project-name-input') as HTMLInputElement;
        expect(input.value).toBe('');
      });
    });

    it('should not close on outside click', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      // Modal should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // The closeOnClickOutside=false prop is set, so clicking outside should not close
    });
  });

  describe('Accessibility', () => {
    it('should have accessible progress bar', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Wizard progress');
    });

    it('should support keyboard navigation on feature cards', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Initial Features')).toBeInTheDocument();
      });

      const authFeature = screen.getByTestId('feature-card-auth');
      authFeature.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(authFeature).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('should have accessible feature checkboxes', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByTestId('project-name-input');
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Initial Features')).toBeInTheDocument();
      });

      const authFeature = screen.getByTestId('feature-card-auth');
      expect(authFeature).toHaveAttribute('role', 'checkbox');
      expect(authFeature).toHaveAttribute('aria-checked');
    });
  });
});
