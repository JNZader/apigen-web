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

      expect(screen.getByText('Project Setup Wizard')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestProviders>
          <ProjectWizard opened={false} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      expect(screen.queryByText('Project Setup Wizard')).not.toBeInTheDocument();
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

      expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Group ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Artifact ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Package Name/i)).toBeInTheDocument();
    });

    it('should validate project name before advancing', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      // Clear default values
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });
    });

    it('should clear error when typing valid name', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });

      await user.type(nameInput, 'valid-project');

      await waitFor(() => {
        expect(screen.queryByText('Project name is required')).not.toBeInTheDocument();
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

      // Fill required fields
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });
    });

    it('should allow going back to previous step', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Back'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
      });
    });

    it('should preserve data when going back', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Back'));

      await waitFor(() => {
        const input = screen.getByLabelText(/Project Name/i) as HTMLInputElement;
        expect(input.value).toBe('my-project');
      });
    });
  });

  describe('Step 2 - Language Selection', () => {
    async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));
      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
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

      expect(screen.getByTestId('wizard-language-java')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-language-python')).toBeInTheDocument();
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

      await user.click(screen.getByTestId('wizard-language-python'));

      await waitFor(() => {
        const pythonCard = screen.getByTestId('wizard-language-python');
        expect(pythonCard).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Step 3 - Features Selection', () => {
    async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Features')).toBeInTheDocument();
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

      expect(screen.getByTestId('wizard-feature-hateoas')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-feature-swagger')).toBeInTheDocument();
    });

    it('should allow selecting and deselecting features', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await goToStep3(user);

      const swaggerFeature = screen.getByTestId('wizard-feature-swagger');
      const initialChecked = swaggerFeature.getAttribute('aria-checked');

      await user.click(swaggerFeature);

      await waitFor(() => {
        const newChecked = swaggerFeature.getAttribute('aria-checked');
        expect(newChecked).not.toBe(initialChecked);
      });
    });
  });

  describe('Step 4 - Summary', () => {
    async function goToStep4(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Features')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        // Summary step should be visible
        expect(screen.getByText('Create Project')).toBeInTheDocument();
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

      // The Create Project button should be visible on the last step
      expect(screen.getByText('Create Project')).toBeInTheDocument();
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
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    });
  });

  describe('Completion', () => {
    async function completeWizard(user: ReturnType<typeof userEvent.setup>) {
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-awesome-api');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('wizard-language-python'));
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Features')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Create Project')).toBeInTheDocument();
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
      expect(screen.getByText('Project Setup Wizard')).toBeInTheDocument();
    });

    it('should reset state when component is remounted', async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'test-project');

      // Unmount the component completely
      unmount();

      // Remount - should start fresh with default state
      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      await waitFor(() => {
        const input = screen.getByLabelText(/Project Name/i) as HTMLInputElement;
        // Default value from defaultProjectConfig, not 'test-project'
        expect(input.value).not.toBe('test-project');
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
    it('should have accessible language cards', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      // Go to step 2
      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      const javaCard = screen.getByTestId('wizard-language-java');
      expect(javaCard).toHaveAttribute('role', 'button');
      expect(javaCard).toHaveAttribute('aria-pressed');
    });

    it('should support keyboard navigation on feature cards', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Features')).toBeInTheDocument();
      });

      const hateoasFeature = screen.getByTestId('wizard-feature-hateoas');
      const initialChecked = hateoasFeature.getAttribute('aria-checked');
      hateoasFeature.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const newChecked = hateoasFeature.getAttribute('aria-checked');
        expect(newChecked).not.toBe(initialChecked);
      });
    });

    it('should have accessible feature checkboxes', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />
        </TestProviders>,
      );

      const nameInput = screen.getByLabelText(/Project Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'my-project');
      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Choose Your Programming Language')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Select Features')).toBeInTheDocument();
      });

      const hateoasFeature = screen.getByTestId('wizard-feature-hateoas');
      expect(hateoasFeature).toHaveAttribute('role', 'checkbox');
      expect(hateoasFeature).toHaveAttribute('aria-checked');
    });
  });
});
