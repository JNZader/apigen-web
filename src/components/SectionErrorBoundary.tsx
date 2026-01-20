import { Alert, Button, Code, Group, Paper, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Component, type ReactNode } from 'react';

type SectionVariant = 'full' | 'panel' | 'inline' | 'modal';

interface Props {
  children: ReactNode;
  /** Section name for error reporting */
  section: string;
  /** Visual variant for different contexts */
  variant?: SectionVariant;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section-specific error boundary with graceful degradation.
 * Prevents errors in one section from crashing the entire app.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[${this.props.section}] Error:`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { variant = 'full', section } = this.props;
    const { error } = this.state;

    // Inline variant - minimal, single line
    if (variant === 'inline') {
      return (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          variant="light"
          py="xs"
        >
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" truncate>
              Error loading {section.toLowerCase()}
            </Text>
            <Button size="xs" variant="subtle" color="red" onClick={this.handleRetry}>
              Retry
            </Button>
          </Group>
        </Alert>
      );
    }

    // Panel variant - compact, for sidebars
    if (variant === 'panel') {
      return (
        <Stack p="md" align="center" justify="center" style={{ minHeight: 200 }}>
          <IconAlertTriangle size={32} color="var(--mantine-color-red-6)" />
          <Text size="sm" c="dimmed" ta="center">
            Failed to load {section.toLowerCase()}
          </Text>
          {error && (
            <Code block color="red" style={{ fontSize: 11, maxWidth: '100%' }}>
              {error.message}
            </Code>
          )}
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconRefresh size={14} />}
            onClick={this.handleRetry}
          >
            Try Again
          </Button>
        </Stack>
      );
    }

    // Modal variant - for dialogs and modals
    if (variant === 'modal') {
      return (
        <Stack p="lg" align="center" gap="md">
          <Alert
            icon={<IconAlertTriangle size={20} />}
            title={`Error in ${section}`}
            color="red"
            variant="light"
            style={{ width: '100%' }}
          >
            <Text size="sm" mb="sm">
              Something went wrong. Please try again.
            </Text>
            {error && (
              <Paper p="xs" bg="red.9" mb="sm">
                <Code block style={{ fontSize: 11 }}>
                  {error.message}
                </Code>
              </Paper>
            )}
            <Button
              size="sm"
              variant="filled"
              color="red"
              leftSection={<IconRefresh size={14} />}
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          </Alert>
        </Stack>
      );
    }

    // Full variant - for main content areas (default)
    return (
      <Stack
        p="xl"
        align="center"
        justify="center"
        style={{ minHeight: 300, width: '100%' }}
      >
        <Alert
          icon={<IconAlertTriangle size={24} />}
          title={`${section} Error`}
          color="red"
          variant="filled"
          style={{ maxWidth: 500 }}
        >
          <Stack gap="sm">
            <Text size="sm">
              An error occurred in the {section.toLowerCase()}. Other parts of the app
              should still work.
            </Text>

            {error && (
              <Paper p="xs" bg="dark.7">
                <Code block color="red" style={{ fontSize: 12 }}>
                  {error.message}
                </Code>
              </Paper>
            )}

            <Button
              leftSection={<IconRefresh size={16} />}
              variant="white"
              color="red"
              onClick={this.handleRetry}
              mt="xs"
            >
              Try Again
            </Button>
          </Stack>
        </Alert>
      </Stack>
    );
  }
}
