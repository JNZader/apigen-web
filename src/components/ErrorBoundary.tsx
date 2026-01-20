import { Alert, Button, Code, Paper, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack || null });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    globalThis.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Stack p="xl" align="center" justify="center" style={{ minHeight: 400 }}>
          <Alert
            icon={<IconAlertTriangle size={24} />}
            title="Something went wrong"
            color="red"
            variant="filled"
            style={{ maxWidth: 600 }}
          >
            <Stack gap="sm">
              <Text size="sm">
                An unexpected error occurred. You can try to recover or reload the page.
              </Text>

              {this.state.error && (
                <Paper p="xs" bg="dark.7">
                  <Code block color="red">
                    {this.state.error.message}
                  </Code>
                </Paper>
              )}

              <Stack gap="xs" mt="sm">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="white"
                  color="red"
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button variant="outline" color="white" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </Stack>
            </Stack>
          </Alert>
        </Stack>
      );
    }

    return this.props.children;
  }
}
