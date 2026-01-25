import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import {
  FRAMEWORK_METADATA,
  getDefaultFramework,
  LANGUAGE_METADATA,
  LANGUAGES,
} from '../../types/target';
import { LanguageSelector } from './LanguageSelector';

describe('LanguageSelector', () => {
  const mockOnLanguageChange = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all 8 languages', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      for (const language of LANGUAGES) {
        const meta = LANGUAGE_METADATA[language];
        expect(screen.getByText(meta.label)).toBeInTheDocument();
      }
    });

    it('should render language cards with correct test ids', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      for (const language of LANGUAGES) {
        expect(screen.getByTestId(`language-card-${language}`)).toBeInTheDocument();
      }
    });

    it('should show "Select Language" title', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      expect(screen.getByText('Select Language')).toBeInTheDocument();
    });

    it('should display selected configuration', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      expect(screen.getByText('Selected:')).toBeInTheDocument();
    });

    it('should show default Java selection on initial render', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const javaCard = screen.getByTestId('language-card-java');
      expect(javaCard).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Language Selection', () => {
    it('should select language when clicking a card', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector onLanguageChange={mockOnLanguageChange} />
        </TestProviders>,
      );

      const pythonCard = screen.getByTestId('language-card-python');
      await user.click(pythonCard);

      await waitFor(() => {
        expect(pythonCard).toHaveAttribute('aria-pressed', 'true');
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.targetConfig.language).toBe('python');
      expect(state.project.targetConfig.framework).toBe('fastapi');
    });

    it('should call onLanguageChange callback when selecting', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector onLanguageChange={mockOnLanguageChange} />
        </TestProviders>,
      );

      const rustCard = screen.getByTestId('language-card-rust');
      await user.click(rustCard);

      await waitFor(() => {
        expect(mockOnLanguageChange).toHaveBeenCalledWith('rust', 'axum');
      });
    });

    it('should update store with correct default versions', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const typescriptCard = screen.getByTestId('language-card-typescript');
      await user.click(typescriptCard);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.targetConfig.language).toBe('typescript');
        expect(state.project.targetConfig.languageVersion).toBe(
          LANGUAGE_METADATA.typescript.defaultVersion,
        );
        expect(state.project.targetConfig.framework).toBe('nestjs');
        expect(state.project.targetConfig.frameworkVersion).toBe(
          FRAMEWORK_METADATA.nestjs.defaultVersion,
        );
      });
    });
  });

  describe('Framework Selection for Go', () => {
    it('should show framework options when Go is selected', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const goCard = screen.getByTestId('language-card-go');
      await user.click(goCard);

      await waitFor(() => {
        expect(screen.getByText('Select Framework')).toBeInTheDocument();
        expect(screen.getByTestId('framework-badge-gin')).toBeInTheDocument();
        expect(screen.getByTestId('framework-badge-chi')).toBeInTheDocument();
      });
    });

    it('should select Gin framework by default for Go', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const goCard = screen.getByTestId('language-card-go');
      await user.click(goCard);

      await waitFor(() => {
        const ginBadge = screen.getByTestId('framework-badge-gin');
        expect(ginBadge).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should switch to Chi framework when clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector onLanguageChange={mockOnLanguageChange} />
        </TestProviders>,
      );

      const goCard = screen.getByTestId('language-card-go');
      await user.click(goCard);

      await waitFor(() => {
        expect(screen.getByTestId('framework-badge-chi')).toBeInTheDocument();
      });

      const chiBadge = screen.getByTestId('framework-badge-chi');
      await user.click(chiBadge);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.targetConfig.framework).toBe('chi');
        expect(mockOnLanguageChange).toHaveBeenLastCalledWith('go', 'chi');
      });
    });

    it('should not show framework selector for single-framework languages', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const javaCard = screen.getByTestId('language-card-java');
      await user.click(javaCard);

      await waitFor(() => {
        expect(screen.queryByText('Select Framework')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible language cards with correct roles', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      for (const language of LANGUAGES) {
        const card = screen.getByTestId(`language-card-${language}`);
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
      }
    });

    it('should have aria-pressed attribute on language cards', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const javaCard = screen.getByTestId('language-card-java');
      expect(javaCard).toHaveAttribute('aria-pressed', 'true');

      const pythonCard = screen.getByTestId('language-card-python');
      expect(pythonCard).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have descriptive aria-label on language cards', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const javaCard = screen.getByTestId('language-card-java');
      expect(javaCard).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Select Java programming language'),
      );
    });

    it('should support keyboard navigation with Enter key', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector onLanguageChange={mockOnLanguageChange} />
        </TestProviders>,
      );

      const kotlinCard = screen.getByTestId('language-card-kotlin');
      kotlinCard.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnLanguageChange).toHaveBeenCalledWith('kotlin', 'spring-boot');
      });
    });

    it('should support keyboard navigation with Space key', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector onLanguageChange={mockOnLanguageChange} />
        </TestProviders>,
      );

      const phpCard = screen.getByTestId('language-card-php');
      phpCard.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(mockOnLanguageChange).toHaveBeenCalledWith('php', 'laravel');
      });
    });

    it('should have accessible framework badges', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const goCard = screen.getByTestId('language-card-go');
      await user.click(goCard);

      await waitFor(() => {
        const ginBadge = screen.getByTestId('framework-badge-gin');
        expect(ginBadge).toHaveAttribute('role', 'button');
        expect(ginBadge).toHaveAttribute('tabIndex', '0');
        expect(ginBadge).toHaveAttribute('aria-label', 'Select Gin framework');
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should show version badge on selected language', () => {
      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const javaCard = screen.getByTestId('language-card-java');
      expect(javaCard).toHaveTextContent(`v${LANGUAGE_METADATA.java.defaultVersion}`);
    });

    it('should update selected config display when language changes', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <LanguageSelector />
        </TestProviders>,
      );

      const csharpCard = screen.getByTestId('language-card-csharp');
      await user.click(csharpCard);

      await waitFor(() => {
        expect(
          screen.getByText(`C# v${LANGUAGE_METADATA.csharp.defaultVersion}`),
        ).toBeInTheDocument();
        expect(
          screen.getByText(`ASP.NET Core v${FRAMEWORK_METADATA['aspnet-core'].defaultVersion}`),
        ).toBeInTheDocument();
      });
    });
  });

  describe('All Language/Framework Combinations', () => {
    it.each(LANGUAGES)('should correctly select %s and its default framework', async (language) => {
      const user = userEvent.setup();
      const expectedFramework = getDefaultFramework(language);

      render(
        <TestProviders>
          <LanguageSelector onLanguageChange={mockOnLanguageChange} />
        </TestProviders>,
      );

      const card = screen.getByTestId(`language-card-${language}`);
      await user.click(card);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.targetConfig.language).toBe(language);
        expect(state.project.targetConfig.framework).toBe(expectedFramework);
        expect(mockOnLanguageChange).toHaveBeenCalledWith(language, expectedFramework);
      });
    });
  });
});
