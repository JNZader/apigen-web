import {
  Button,
  Code,
  Group,
  Kbd,
  List,
  Modal,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconDownload,
  IconKeyboard,
  IconPlugConnected,
  IconRocket,
  IconTable,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useIsMac } from '../hooks';

const ONBOARDING_STORAGE_KEY = 'apigen-studio-onboarding-completed';

interface OnboardingProps {
  readonly forceShow?: boolean;
  readonly onClose?: () => void;
}

export function Onboarding({ forceShow = false, onClose }: Readonly<OnboardingProps>) {
  // Initialize opened state directly - no useEffect needed
  const [opened, setOpened] = useState(() => {
    if (forceShow) return true;
    return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
  });
  const [active, setActive] = useState(0);
  const isMac = useIsMac();

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setOpened(false);
    onClose?.();
  };

  const handleClose = () => {
    handleComplete();
  };

  const nextStep = () => setActive((c) => Math.min(c + 1, 4));
  const prevStep = () => setActive((c) => Math.max(c - 1, 0));

  const modKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="blue" size="lg" variant="light">
            <IconRocket size={20} />
          </ThemeIcon>
          <Text fw={600} size="lg">
            Welcome to APiGen Studio
          </Text>
        </Group>
      }
      size="lg"
      centered
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Stack>
        <Text c="dimmed" size="sm">
          Design your Spring Boot API visually. Let's get you started in just a few steps.
        </Text>

        <Stepper active={active} onStepClick={setActive} size="sm">
          <Stepper.Step
            icon={<IconTable size={16} />}
            label="Create Entities"
            description="Define your data models"
          >
            <Stack mt="md" gap="sm">
              <Text size="sm">
                <strong>Entities</strong> are the building blocks of your API. Each entity becomes:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>A JPA Entity class (extends Base)</List.Item>
                <List.Item>A DTO record for data transfer</List.Item>
                <List.Item>A Repository interface</List.Item>
                <List.Item>A Service implementation</List.Item>
                <List.Item>A REST Controller with 12+ endpoints</List.Item>
              </List>
              <Text size="sm" c="dimmed">
                Click <Code>Add Entity</Code> or press <Kbd>{modKey}</Kbd> + <Kbd>N</Kbd> to create
                your first entity.
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            icon={<IconPlugConnected size={16} />}
            label="Add Relations"
            description="Connect entities"
          >
            <Stack mt="md" gap="sm">
              <Text size="sm">
                <strong>Relations</strong> define how entities connect to each other:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <Code>OneToMany</Code> - One parent, many children (e.g., User → Posts)
                </List.Item>
                <List.Item>
                  <Code>ManyToOne</Code> - Many children, one parent (e.g., Post → User)
                </List.Item>
                <List.Item>
                  <Code>OneToOne</Code> - One-to-one mapping (e.g., User → Profile)
                </List.Item>
                <List.Item>
                  <Code>ManyToMany</Code> - Many-to-many (e.g., User ↔ Roles)
                </List.Item>
              </List>
              <Text size="sm" c="dimmed">
                In Canvas view, drag from one entity's handle to another to create a relation.
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            icon={<IconDownload size={16} />}
            label="Generate Code"
            description="Download your project"
          >
            <Stack mt="md" gap="sm">
              <Text size="sm">
                When you're ready, <strong>generate your complete Spring Boot project</strong>:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  Click the blue <Code>Download</Code> button in the header
                </List.Item>
                <List.Item>Choose "With APiGen Server" for full generation</List.Item>
                <List.Item>Download the ZIP file with your complete project</List.Item>
                <List.Item>
                  Unzip and run with <Code>./gradlew bootRun</Code>
                </List.Item>
              </List>
              <Text size="sm" c="dimmed">
                Your API will be ready to use immediately with all CRUD endpoints!
              </Text>
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            icon={<IconKeyboard size={16} />}
            label="Shortcuts"
            description="Work faster"
          >
            <Stack mt="md" gap="sm">
              <Text size="sm">
                <strong>Keyboard shortcuts</strong> to speed up your workflow:
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <Kbd>{modKey}</Kbd> + <Kbd>Z</Kbd> - Undo
                </List.Item>
                <List.Item>
                  <Kbd>{modKey}</Kbd> + <Kbd>Y</Kbd> - Redo
                </List.Item>
                <List.Item>
                  <Kbd>{modKey}</Kbd> + <Kbd>S</Kbd> - Quick save (export JSON)
                </List.Item>
                <List.Item>
                  <Kbd>{modKey}</Kbd> + <Kbd>N</Kbd> - Add new entity
                </List.Item>
                <List.Item>
                  <Kbd>Delete</Kbd> - Delete selected entity
                </List.Item>
                <List.Item>
                  <Kbd>Escape</Kbd> - Close modal / deselect
                </List.Item>
              </List>
            </Stack>
          </Stepper.Step>

          <Stepper.Completed>
            <Stack mt="md" gap="sm" align="center">
              <ThemeIcon size={60} radius="xl" color="green" variant="light">
                <IconRocket size={32} />
              </ThemeIcon>
              <Text ta="center" size="lg" fw={600}>
                You're all set!
              </Text>
              <Text ta="center" c="dimmed" size="sm">
                Start designing your API by creating your first entity.
                <br />
                You can always access help from the Templates menu.
              </Text>
            </Stack>
          </Stepper.Completed>
        </Stepper>

        <Group justify="space-between" mt="xl">
          {active === 0 ? (
            <Button variant="subtle" onClick={handleComplete}>
              Skip tutorial
            </Button>
          ) : (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          )}

          {active < 4 ? (
            <Button onClick={nextStep}>{active === 3 ? 'Finish' : 'Next'}</Button>
          ) : (
            <Button color="green" onClick={handleComplete}>
              Get Started
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}

/**
 * Hook to reset onboarding (for testing or "show again" feature)
 */
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };
}
