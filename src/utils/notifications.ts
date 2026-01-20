import { notifications } from '@mantine/notifications';

/**
 * Centralized notification utility for consistent messaging across the app.
 * Provides type-safe methods for common notification patterns.
 */

interface NotifyOptions {
  title?: string;
  message: string;
  autoClose?: number | boolean;
}

export const notify = {
  /**
   * Show a success notification (green)
   */
  success: ({ title = 'Success', message, autoClose = 4000 }: NotifyOptions) => {
    notifications.show({
      title,
      message,
      color: 'green',
      autoClose,
    });
  },

  /**
   * Show an error notification (red)
   */
  error: ({ title = 'Error', message, autoClose = 5000 }: NotifyOptions) => {
    notifications.show({
      title,
      message,
      color: 'red',
      autoClose,
    });
  },

  /**
   * Show a warning notification (yellow/orange)
   */
  warning: ({ title = 'Warning', message, autoClose = 4000 }: NotifyOptions) => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      autoClose,
    });
  },

  /**
   * Show an info notification (blue)
   */
  info: ({ title = 'Info', message, autoClose = 4000 }: NotifyOptions) => {
    notifications.show({
      title,
      message,
      color: 'blue',
      autoClose,
    });
  },

  /**
   * Show a loading notification that can be updated later
   */
  loading: ({ title = 'Loading', message }: Omit<NotifyOptions, 'autoClose'>) => {
    return notifications.show({
      title,
      message,
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });
  },

  /**
   * Update an existing notification (useful for loading -> success/error transitions)
   */
  update: (id: string, options: NotifyOptions & { loading?: boolean; color?: string }) => {
    notifications.update({
      id,
      ...options,
      loading: options.loading ?? false,
      autoClose: options.autoClose ?? 4000,
    });
  },

  /**
   * Hide a specific notification
   */
  hide: (id: string) => {
    notifications.hide(id);
  },

  /**
   * Clear all notifications
   */
  clear: () => {
    notifications.clean();
  },
};

// Convenience shortcuts for common operations
export const showSuccess = (message: string, title?: string) => notify.success({ message, title });

export const showError = (message: string, title?: string) => notify.error({ message, title });

export const showWarning = (message: string, title?: string) => notify.warning({ message, title });

export const showInfo = (message: string, title?: string) => notify.info({ message, title });
