import { Box, Button, Group, Modal, Progress, Stack, Stepper, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconArrowRight, IconCheck, IconWand } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { useProjectActions } from '../../store';
import { defaultProjectConfig, type ProjectConfig } from '../../types';
import { notify } from '../../utils/notifications';
import { isValidArtifactId, isValidGroupId, isValidPackageName } from '../../utils/validation';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { LanguageStep } from './steps/LanguageStep';
import { SummaryStep } from './steps/SummaryStep';

interface ProjectWizardProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onComplete?: () => void;
}

const TOTAL_STEPS = 4;

export function ProjectWizard({ opened, onClose, onComplete }: ProjectWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { setProject } = useProjectActions();

  const form = useForm<ProjectConfig>({
    initialValues: defaultProjectConfig,
    validate: {
      name: (v) => (v ? null : 'Project name is required'),
      groupId: (v) => (isValidGroupId(v) ? null : 'Invalid group ID (e.g., com.example)'),
      artifactId: (v) =>
        isValidArtifactId(v) ? null : 'Invalid artifact ID (lowercase, hyphens allowed)',
      packageName: (v) =>
        isValidPackageName(v) ? null : 'Invalid package name (e.g., com.example.myapi)',
    },
    validateInputOnBlur: true,
  });

  const validateCurrentStep = useCallback((): boolean => {
    switch (activeStep) {
      case 0: {
        const validation = form.validateField('name');
        const groupValidation = form.validateField('groupId');
        const artifactValidation = form.validateField('artifactId');
        const packageValidation = form.validateField('packageName');
        return (
          !validation.hasError &&
          !groupValidation.hasError &&
          !artifactValidation.hasError &&
          !packageValidation.hasError
        );
      }
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  }, [activeStep, form]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setActiveStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
    }
  }, [validateCurrentStep]);

  const handleBack = useCallback(() => {
    setActiveStep((current) => Math.max(current - 1, 0));
  }, []);

  const handleStepClick = useCallback(
    (step: number) => {
      const canNavigateBack = step < activeStep;
      const canNavigateForward = step === activeStep + 1 && validateCurrentStep();
      if (canNavigateBack || canNavigateForward) {
        setActiveStep(step);
      }
    },
    [activeStep, validateCurrentStep],
  );

  const handleComplete = useCallback(() => {
    if (!validateCurrentStep()) return;

    setProject(form.values);
    notify.success({
      title: 'Project Created',
      message: `Project "${form.values.name}" has been configured successfully`,
    });
    onComplete?.();
    onClose();
    setActiveStep(0);
    form.reset();
  }, [form, onClose, onComplete, setProject, validateCurrentStep]);

  const handleClose = useCallback(() => {
    onClose();
    setActiveStep(0);
    form.reset();
  }, [form, onClose]);

  const progress = ((activeStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = activeStep === TOTAL_STEPS - 1;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <IconWand size={20} />
          <Text fw={500}>Project Setup Wizard</Text>
        </Group>
      }
      size="lg"
      padding="lg"
      centered
    >
      <Stack gap="lg">
        <Progress value={progress} size="sm" radius="xl" animated />

        <Stepper
          active={activeStep}
          onStepClick={handleStepClick}
          size="sm"
          allowNextStepsSelect={false}
        >
          <Stepper.Step label="Basic Info" description="Project details" />
          <Stepper.Step label="Language" description="Tech stack" />
          <Stepper.Step label="Features" description="Capabilities" />
          <Stepper.Step label="Summary" description="Review" />
        </Stepper>

        <Box mih={300}>
          {activeStep === 0 && <BasicInfoStep form={form} />}
          {activeStep === 1 && <LanguageStep />}
          {activeStep === 2 && <FeaturesStep />}
          {activeStep === 3 && <SummaryStep />}
        </Box>

        <Group justify="space-between" mt="md">
          <Button
            variant="default"
            onClick={handleBack}
            disabled={activeStep === 0}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back
          </Button>
          <Group gap="sm">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            {isLastStep ? (
              <Button color="teal" onClick={handleComplete} leftSection={<IconCheck size={16} />}>
                Create Project
              </Button>
            ) : (
              <Button onClick={handleNext} rightSection={<IconArrowRight size={16} />}>
                Next
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
