import { notifications } from '@mantine/notifications';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notify, showError, showInfo, showSuccess, showWarning } from './notifications';

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
    update: vi.fn(),
    hide: vi.fn(),
    clean: vi.fn(),
  },
}));

describe('notifications utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notify.success', () => {
    it('should show success notification with defaults', () => {
      notify.success({ message: 'Operation completed' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Success',
        message: 'Operation completed',
        color: 'green',
        autoClose: 4000,
      });
    });

    it('should show success notification with custom title', () => {
      notify.success({ title: 'Custom Title', message: 'Custom message' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Custom Title',
        message: 'Custom message',
        color: 'green',
        autoClose: 4000,
      });
    });

    it('should show success notification with custom autoClose', () => {
      notify.success({ message: 'Quick message', autoClose: 2000 });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Success',
        message: 'Quick message',
        color: 'green',
        autoClose: 2000,
      });
    });
  });

  describe('notify.error', () => {
    it('should show error notification with defaults', () => {
      notify.error({ message: 'Something went wrong' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Error',
        message: 'Something went wrong',
        color: 'red',
        autoClose: 5000,
      });
    });

    it('should show error notification with custom title', () => {
      notify.error({ title: 'Validation Error', message: 'Invalid input' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Validation Error',
        message: 'Invalid input',
        color: 'red',
        autoClose: 5000,
      });
    });
  });

  describe('notify.warning', () => {
    it('should show warning notification with defaults', () => {
      notify.warning({ message: 'Be careful' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Warning',
        message: 'Be careful',
        color: 'yellow',
        autoClose: 4000,
      });
    });
  });

  describe('notify.info', () => {
    it('should show info notification with defaults', () => {
      notify.info({ message: 'FYI' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Info',
        message: 'FYI',
        color: 'blue',
        autoClose: 4000,
      });
    });
  });

  describe('notify.loading', () => {
    it('should show loading notification', () => {
      notify.loading({ message: 'Processing...' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Loading',
        message: 'Processing...',
        loading: true,
        autoClose: false,
        withCloseButton: false,
      });
    });

    it('should show loading notification with custom title', () => {
      notify.loading({ title: 'Please wait', message: 'Uploading file...' });

      expect(notifications.show).toHaveBeenCalledWith({
        title: 'Please wait',
        message: 'Uploading file...',
        loading: true,
        autoClose: false,
        withCloseButton: false,
      });
    });
  });

  describe('notify.update', () => {
    it('should update notification with new options', () => {
      notify.update('notification-id', { message: 'Updated message', color: 'green' });

      expect(notifications.update).toHaveBeenCalledWith({
        id: 'notification-id',
        message: 'Updated message',
        color: 'green',
        loading: false,
        autoClose: 4000,
      });
    });

    it('should update notification with loading state', () => {
      notify.update('notification-id', { message: 'Still loading...', loading: true });

      expect(notifications.update).toHaveBeenCalledWith({
        id: 'notification-id',
        message: 'Still loading...',
        loading: true,
        autoClose: 4000,
      });
    });

    it('should update notification with custom autoClose', () => {
      notify.update('notification-id', { message: 'Done', autoClose: 2000 });

      expect(notifications.update).toHaveBeenCalledWith({
        id: 'notification-id',
        message: 'Done',
        loading: false,
        autoClose: 2000,
      });
    });
  });

  describe('notify.hide', () => {
    it('should hide specific notification', () => {
      notify.hide('notification-id');

      expect(notifications.hide).toHaveBeenCalledWith('notification-id');
    });
  });

  describe('notify.clear', () => {
    it('should clear all notifications', () => {
      notify.clear();

      expect(notifications.clean).toHaveBeenCalled();
    });
  });

  describe('convenience shortcuts', () => {
    it('showSuccess should call notify.success', () => {
      showSuccess('Success message');

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Success message',
          color: 'green',
        }),
      );
    });

    it('showSuccess should accept custom title', () => {
      showSuccess('Success message', 'Custom Title');

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Custom Title',
          message: 'Success message',
        }),
      );
    });

    it('showError should call notify.error', () => {
      showError('Error message');

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error message',
          color: 'red',
        }),
      );
    });

    it('showWarning should call notify.warning', () => {
      showWarning('Warning message');

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Warning message',
          color: 'yellow',
        }),
      );
    });

    it('showInfo should call notify.info', () => {
      showInfo('Info message');

      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Info message',
          color: 'blue',
        }),
      );
    });
  });
});
