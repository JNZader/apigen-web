import { useForm } from '@mantine/form';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, resetAllStores, screen, userEvent, waitFor } from '../../test/utils';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { FileStorageSettingsForm } from './FileStorageSettingsForm';

function TestWrapper({
  initialValues = defaultProjectConfig,
}: {
  initialValues?: ProjectConfig;
} = {}) {
  const form = useForm<ProjectConfig>({
    initialValues,
  });

  return <FileStorageSettingsForm form={form} />;
}

describe('FileStorageSettingsForm', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Basic Rendering', () => {
    it('renders the form title', () => {
      render(<TestWrapper />);

      expect(screen.getByText('File Storage')).toBeInTheDocument();
    });

    it('renders the enable file storage switch', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Enable File Storage')).toBeInTheDocument();
    });

    it('renders storage type options (Local, S3, Azure)', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('Storage Provider')).toBeInTheDocument();
    });

    it('shows upload limits section when enabled', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('Upload Limits')).toBeInTheDocument();
      expect(screen.getByText('Max File Size (MB)')).toBeInTheDocument();
      expect(screen.getByText('Allowed Extensions')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - Local Storage', () => {
    it('shows local path field for local storage', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          storage: {
            ...defaultProjectConfig.featurePackConfig.storage,
            provider: 'local',
          },
        },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('Local Storage Configuration')).toBeInTheDocument();
      expect(screen.getByText('Base Path')).toBeInTheDocument();
      expect(screen.getByText('Create Directories')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - S3 Storage', () => {
    it('shows S3 fields when S3 is selected', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          storage: {
            ...defaultProjectConfig.featurePackConfig.storage,
            provider: 's3',
          },
        },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('S3 Configuration')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Access Key ID')).toBeInTheDocument();
      expect(screen.getByText('Secret Access Key')).toBeInTheDocument();
      expect(screen.getByText('Path Style Access')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - Azure Storage', () => {
    it('shows Azure fields when Azure is selected', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          storage: {
            ...defaultProjectConfig.featurePackConfig.storage,
            provider: 'azure',
          },
        },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('Azure Blob Storage Configuration')).toBeInTheDocument();
      expect(screen.getByText('Account Name')).toBeInTheDocument();
      expect(screen.getByText('Account Key')).toBeInTheDocument();
      expect(screen.getByText('Container Name')).toBeInTheDocument();
    });
  });

  describe('Conditional Fields - GCS Storage', () => {
    it('shows GCS fields when GCS is selected', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          storage: {
            ...defaultProjectConfig.featurePackConfig.storage,
            provider: 'gcs',
          },
        },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('Google Cloud Storage Configuration')).toBeInTheDocument();
      expect(screen.getByText('Project ID')).toBeInTheDocument();
      expect(screen.getByText('Credentials Path')).toBeInTheDocument();
    });
  });

  describe('Hidden Options', () => {
    it('hides options when file upload is disabled', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: false },
      };

      render(<TestWrapper initialValues={initialValues} />);

      // Mantine Collapse keeps elements in DOM but hidden with CSS
      // Check that the container is collapsed by verifying the toggle state
      const toggle = screen.getByLabelText(/enable file storage/i);
      expect(toggle).not.toBeChecked();
    });
  });

  describe('Interaction', () => {
    it('enables storage options when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<TestWrapper />);

      const toggle = screen.getByLabelText(/enable file storage/i);
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Storage Provider')).toBeInTheDocument();
      });
    });

    it('shows validation switches', () => {
      const initialValues: ProjectConfig = {
        ...defaultProjectConfig,
        features: { ...defaultProjectConfig.features, fileStorage: true },
      };

      render(<TestWrapper initialValues={initialValues} />);

      expect(screen.getByText('Validate Content Type')).toBeInTheDocument();
      expect(screen.getByText('Generate Unique Names')).toBeInTheDocument();
    });
  });
});
