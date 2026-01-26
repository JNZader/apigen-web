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
import { useTargetConfigActions } from '@/store';
import { useProjectStoreInternal } from '@/store/projectStore';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { LanguageStep } from './steps/LanguageStep';
import { SummaryStep } from './steps/SummaryStep';

interface ProjectWizardProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onComplete: () => void;
}

export interface WizardData {
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
] as const;

export const ProjectWizard = memo(function ProjectWizard({
  opened,
  onClose,
  onComplete,
}: ProjectWizardProps) {
  const [active, setActive] = useState(0);
  const [data, setData] = useState<WizardData>({
    projectName: '',
    description: '',
    packageName: 'com.example',
    language: 'java',
    framework: 'spring-boot',
    features: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setProject = useProjectStoreInternal((s) => s.setProject);
  const { setTargetConfig } = useTargetConfigActions();

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
          newErrors.projectName = 'Invalid project name format';
        }

        if (!data.packageName.trim()) {
          newErrors.packageName = 'Package name is required';
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
    [data],
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
    setProject({
      name: data.projectName,
      description: data.description,
      packageName: data.packageName,
    });

    setTargetConfig({
      language: data.language as
        | 'java'
        | 'kotlin'
        | 'python'
        | 'typescript'
        | 'php'
        | 'go'
        | 'rust'
        | 'csharp',
      framework: data.framework as
        | 'spring-boot'
        | 'fastapi'
        | 'nestjs'
        | 'laravel'
        | 'gin'
        | 'chi'
        | 'axum'
        | 'aspnet-core',
    });

    onComplete();
    onClose();
  }, [data, setProject, setTargetConfig, onComplete, onClose]);

  const handleClose = useCallback(() => {
    setActive(0);
    setData({
      projectName: '',
      description: '',
      packageName: 'com.example',
      language: 'java',
      framework: 'spring-boot',
      features: [],
    });
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
