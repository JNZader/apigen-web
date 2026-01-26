import { Button, Group, Modal, Progress, Stack, Stepper } from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCode,
  IconFileDescription,
  IconSettings,
} from '@tabler/icons-react';
import { memo, useCallback, useState } from 'react';
import { useProjectStoreInternal } from '@/store/projectStore';
import type { Language, Framework } from '@/types/target';
import { notify } from '@/utils/notifications';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { LanguageStep } from './steps/LanguageStep';
import { SummaryStep } from './steps/SummaryStep';

interface ProjectWizardProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onComplete?: () => void;
}

interface WizardData {
  projectName: string;
  description: string;
  packageName: string;
  language: string;
  framework: string;
  features: string[];
}

const STEPS = [
  { label: 'Basic Info', icon: IconFileDescription },
  { label: 'Language', icon: IconCode },
  { label: 'Features', icon: IconSettings },
  { label: 'Summary', icon: IconCheck },
];

const INITIAL_DATA: WizardData = {
  projectName: '',
  description: '',
  packageName: 'com.example',
  language: 'java',
  framework: 'spring-boot',
  features: [],
};

export const ProjectWizard = memo(function ProjectWizard({
  opened,
  onClose,
  onComplete,
}: ProjectWizardProps) {
  const [active, setActive] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setProject = useProjectStoreInternal((s) => s.setProject);
  const setTargetConfig = useProjectStoreInternal((s) => s.setTargetConfig);
  const setFeaturePackConfig = useProjectStoreInternal((s) => s.setFeaturePackConfig);

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    const keys = Object.keys(updates);
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        delete next[k];
      }
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 0) {
        if (!data.projectName.trim()) {
          newErrors.projectName = 'Project name is required';
        } else if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(data.projectName)) {
          newErrors.projectName =
            'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores';
        }

        if (!data.packageName.trim()) {
          newErrors.packageName = 'Package name is required';
        } else if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/.test(data.packageName)) {
          newErrors.packageName =
            'Package name must be lowercase, start with a letter, and use dots as separators';
        }
      }

      if (step === 1) {
        if (!data.language) {
          newErrors.language = 'Please select a language';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [data]
  );

  const nextStep = useCallback(() => {
    if (validateStep(active)) {
      setActive((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [active, validateStep]);

  const prevStep = useCallback(() => {
    setActive((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleComplete = useCallback(() => {
    // Apply configuration to store
    setProject({
      name: data.projectName,
      description: data.description,
      groupId: data.packageName,
      artifactId: data.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    });

    setTargetConfig({
      language: data.language as Language,
      framework: data.framework as Framework,
    });

    // Apply selected features to featurePackConfig
    const featureUpdates: Record<string, { enabled: boolean }> = {};
    for (const feature of data.features) {
      const featureKey = feature.toLowerCase().replace(/_/g, '');
      if (feature === 'SOCIAL_LOGIN') {
        featureUpdates.socialLogin = { enabled: true };
      } else if (feature === 'MAIL_SERVICE') {
        featureUpdates.mailService = { enabled: true };
      } else if (feature === 'FILE_STORAGE') {
        featureUpdates.fileStorage = { enabled: true };
      } else if (feature === 'PASSWORD_RESET') {
        featureUpdates.passwordReset = { enabled: true };
      } else if (feature === 'JTE_TEMPLATES') {
        featureUpdates.jteTemplates = { enabled: true };
      }
    }
    if (Object.keys(featureUpdates).length > 0) {
      setFeaturePackConfig(featureUpdates);
    }

    notify.success({
      title: 'Project created',
      message: `Project "${data.projectName}" has been configured successfully`,
    });

    onComplete?.();
    handleClose();
  }, [data, setProject, setTargetConfig, setFeaturePackConfig, onComplete]);

  const handleClose = useCallback(() => {
    setActive(0);
    setData(INITIAL_DATA);
    setErrors({});
    onClose();
  }, [onClose]);

  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Project"
      size="lg"
      closeOnClickOutside={false}
    >
      <Stack gap="lg">
        <Progress value={progress} size="sm" aria-label="Wizard progress" />

        <Stepper active={active} size="sm">
          {STEPS.map((step) => (
            <Stepper.Step key={step.label} label={step.label} icon={<step.icon size={18} />} />
          ))}
        </Stepper>

        <div style={{ minHeight: 300 }}>
          {active === 0 && <BasicInfoStep data={data} errors={errors} onChange={updateData} />}
          {active === 1 && <LanguageStep data={data} errors={errors} onChange={updateData} />}
          {active === 2 && <FeaturesStep data={data} onChange={updateData} />}
          {active === 3 && <SummaryStep data={data} />}
        </div>

        <Group justify="space-between">
          <Button
            variant="default"
            onClick={prevStep}
            disabled={active === 0}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back
          </Button>

          {active < STEPS.length - 1 ? (
            <Button onClick={nextStep} rightSection={<IconArrowRight size={16} />}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} color="green" leftSection={<IconCheck size={16} />}>
              Create Project
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
});
