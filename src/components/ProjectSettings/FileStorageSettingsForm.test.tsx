import { useForm } from '@mantine/form';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, resetAllStores, screen, userEvent, waitFor } from '../../test/utils';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { FileStorageSettingsForm } from './FileStorageSettingsForm';

function TestWrapper({ initialValues }: { initialValues?: Partial<ProjectConfig> }) {
  const form = useForm<ProjectConfig>({
    initialValues: { ...defaultProjectConfig, ...initialValues },
  });

  return <FileStorageSettingsForm form={form} />;
}

describe('FileStorageSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Basic Rendering', () => {
    it('renders the enable file storage switch', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Enable File Storage')).toBeInTheDocument();
    });

    it('renders storage type options when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Storage Provider')).toBeInTheDocument();
      expect(screen.getByText('Local')).toBeInTheDocument();
      expect(screen.getByText('Amazon S3')).toBeInTheDocument();
      expect(screen.getByText('Azure Blob')).toBeInTheDocument();
    });

    it('shows upload limits section when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Upload Limits')).toBeInTheDocument();
      expect(screen.getByText('Max File Size (MB)')).toBeInTheDocument();
      expect(screen.getByText('Allowed Extensions')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - Local Storage', () => {
    it('shows local path field for local storage', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
                provider: 'local',
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Local Storage Configuration')).toBeInTheDocument();
      expect(screen.getByText('Base Path')).toBeInTheDocument();
      expect(screen.getByText('Create Directories')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - S3 Storage', () => {
    it('shows S3 fields when S3 is selected', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
                provider: 's3',
              },
            },
          }}
        />,
      );

      expect(screen.getByText('S3 Configuration')).toBeInTheDocument();
      expect(screen.getByText('Bucket Name')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Access Key ID')).toBeInTheDocument();
      expect(screen.getByText('Secret Access Key')).toBeInTheDocument();
      expect(screen.getByText('Path Style Access')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - Azure Storage', () => {
    it('shows Azure fields when Azure is selected', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
                provider: 'azure',
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Azure Blob Storage Configuration')).toBeInTheDocument();
      expect(screen.getByText('Account Name')).toBeInTheDocument();
      expect(screen.getByText('Account Key')).toBeInTheDocument();
      expect(screen.getByText('Container Name')).toBeInTheDocument();
    });
  });

  describe('Hidden Options', () => {
    it('hides options when file upload is disabled', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: false,
              },
            },
          }}
        />,
      );

      // Check that the toggle is unchecked
      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
    });
  });

  describe('Interaction', () => {
    it('enables storage options when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Storage Provider')).toBeInTheDocument();
      });
    });

    it('shows validation switches when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Validate Content Type')).toBeInTheDocument();
      expect(screen.getByText('Generate Unique Names')).toBeInTheDocument();
    });

    it('shows options divider when enabled', () => {
      render(
        <TestWrapper
          initialValues={{
            featurePackConfig: {
              ...defaultProjectConfig.featurePackConfig,
              storage: {
                ...defaultProjectConfig.featurePackConfig.storage,
                enabled: true,
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Options')).toBeInTheDocument();
    });
  });
});
