import {
  Box,
  Card,
  Center,
  Group,
  Loader,
  Overlay,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconCode } from '@tabler/icons-react';
import { memo } from 'react';

type LoadingVariant = 'spinner' | 'skeleton' | 'overlay';
type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingStateProps {
  /** Visual variant of the loading state */
  readonly variant?: LoadingVariant;
  /** Size of the loader */
  readonly size?: LoadingSize;
  /** Optional message to display */
  readonly message?: string;
  /** Minimum height for the container */
  readonly minHeight?: number;
}

/**
 * Consistent loading state component with multiple variants.
 * - spinner: Centered spinner with optional message
 * - skeleton: Placeholder skeleton (use LoadingSkeleton for lists)
 * - overlay: Semi-transparent overlay with spinner
 */
export const LoadingState = memo(function LoadingState({
  variant = 'spinner',
  size = 'md',
  message,
  minHeight = 200,
}: LoadingStateProps) {
  if (variant === 'overlay') {
    return (
      <Box pos="relative" style={{ minHeight }}>
        <Overlay color="#000" backgroundOpacity={0.3} blur={2}>
          <Center h="100%">
            <Stack align="center" gap="sm">
              <Loader size={size} color="white" />
              {message && (
                <Text size="sm" c="white" fw={500}>
                  {message}
                </Text>
              )}
            </Stack>
          </Center>
        </Overlay>
      </Box>
    );
  }

  if (variant === 'skeleton') {
    return (
      <Stack gap="sm" style={{ minHeight }}>
        <Skeleton height={40} radius="sm" />
        <Skeleton height={20} radius="sm" width="70%" />
        <Skeleton height={20} radius="sm" width="50%" />
      </Stack>
    );
  }

  // Default: spinner
  return (
    <Center style={{ minHeight }}>
      <Stack align="center" gap="sm">
        <Loader size={size} />
        {message && (
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        )}
      </Stack>
    </Center>
  );
});

interface LoadingSkeletonProps {
  /** Number of skeleton rows to display */
  readonly rows?: number;
  /** Height of each row */
  readonly rowHeight?: number;
  /** Gap between rows */
  readonly gap?: number;
  /** Whether to show a header skeleton */
  readonly showHeader?: boolean;
}

/**
 * Skeleton loading state for lists.
 * Displays multiple placeholder rows to indicate loading.
 */
export const LoadingSkeleton = memo(function LoadingSkeleton({
  rows = 3,
  rowHeight = 56,
  gap = 8,
  showHeader = false,
}: LoadingSkeletonProps) {
  return (
    <Stack gap={gap}>
      {showHeader && <Skeleton height={32} radius="sm" width="40%" mb="xs" />}
      {Array.from({ length: rows }).map((_, index) => (
        <Group key={`skeleton-row-${index}`} gap="sm" wrap="nowrap">
          <Skeleton height={rowHeight} circle width={rowHeight} />
          <Stack gap={4} style={{ flex: 1 }}>
            <Skeleton height={16} radius="sm" width={`${70 + Math.random() * 20}%`} />
            <Skeleton height={12} radius="sm" width={`${40 + Math.random() * 30}%`} />
          </Stack>
        </Group>
      ))}
    </Stack>
  );
});

interface CardSkeletonProps {
  /** Number of card skeletons to display */
  readonly count?: number;
  /** Height of each card */
  readonly cardHeight?: number;
  /** Whether to show fields within the card */
  readonly showFields?: boolean;
  /** Number of field skeletons per card */
  readonly fieldCount?: number;
}

/**
 * Skeleton loading state for cards.
 * Mimics EntityCard structure for consistent loading experience.
 */
export const CardSkeleton = memo(function CardSkeleton({
  count = 1,
  cardHeight = 200,
  showFields = true,
  fieldCount = 3,
}: CardSkeletonProps) {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, cardIndex) => (
        <Card
          key={`card-skeleton-${cardIndex}`}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{ minHeight: cardHeight }}
        >
          {/* Header section */}
          <Card.Section withBorder inheritPadding py="xs" bg="gray.1">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <Skeleton height={16} width={16} circle />
                <Skeleton height={16} width={120} radius="sm" />
              </Group>
              <Skeleton height={20} width={80} radius="xl" />
            </Group>
          </Card.Section>

          {/* Fields section */}
          {showFields && (
            <Stack gap="xs" mt="md">
              {Array.from({ length: fieldCount }).map((_, fieldIndex) => (
                <Group key={`field-skeleton-${fieldIndex}`} justify="space-between" wrap="nowrap">
                  <Skeleton height={14} width={`${60 + Math.random() * 30}%`} radius="sm" />
                  <Skeleton height={18} width={60} radius="xl" />
                </Group>
              ))}
            </Stack>
          )}

          {/* Actions section */}
          <Group mt="md" justify="flex-end" gap="xs" wrap="nowrap">
            <Skeleton height={28} width={28} radius="sm" />
            <Skeleton height={28} width={28} radius="sm" />
          </Group>
        </Card>
      ))}
    </Stack>
  );
});

type GenerationStep = 'preparing' | 'generating' | 'packaging' | 'complete';

interface GenerationProgressProps {
  /** Current step in the generation process */
  readonly step: GenerationStep;
  /** Progress percentage (0-100) */
  readonly progress: number;
  /** Current item being processed */
  readonly currentItem?: string;
  /** Total items to process */
  readonly totalItems?: number;
  /** Current item index */
  readonly currentIndex?: number;
}

const STEP_LABELS: Record<GenerationStep, string> = {
  preparing: 'Preparing project structure...',
  generating: 'Generating code...',
  packaging: 'Packaging files...',
  complete: 'Generation complete!',
};

const STEP_PROGRESS: Record<GenerationStep, number> = {
  preparing: 10,
  generating: 50,
  packaging: 90,
  complete: 100,
};

/**
 * Progress indicator for code generation process.
 * Shows detailed progress with steps and current item.
 */
export const GenerationProgress = memo(function GenerationProgress({
  step,
  progress,
  currentItem,
  totalItems,
  currentIndex,
}: GenerationProgressProps) {
  const isComplete = step === 'complete';
  const displayProgress = Math.max(progress, STEP_PROGRESS[step]);

  return (
    <Paper p="md" withBorder bg={isComplete ? 'green.0' : 'blue.0'}>
      <Stack gap="sm">
        <Group gap="sm" wrap="nowrap">
          <Loader size="sm" color={isComplete ? 'green' : 'blue'} type={isComplete ? 'dots' : 'oval'} />
          <Stack gap={2} style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {STEP_LABELS[step]}
            </Text>
            {currentItem && !isComplete && (
              <Group gap="xs">
                <IconCode size={12} color="var(--mantine-color-dimmed)" aria-hidden="true" />
                <Text size="xs" c="dimmed" truncate style={{ maxWidth: 300 }}>
                  {currentItem}
                </Text>
              </Group>
            )}
          </Stack>
          {totalItems && currentIndex !== undefined && !isComplete && (
            <Text size="xs" c="dimmed">
              {currentIndex}/{totalItems}
            </Text>
          )}
        </Group>

        <Progress
          value={displayProgress}
          size="sm"
          color={isComplete ? 'green' : 'blue'}
          animated={!isComplete}
          aria-label={`Generation progress: ${displayProgress}%`}
        />

        {!isComplete && (
          <Text size="xs" c="dimmed" ta="right">
            {displayProgress}%
          </Text>
        )}
      </Stack>
    </Paper>
  );
});
