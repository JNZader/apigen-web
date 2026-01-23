import type { UseFormReturnType } from '@mantine/form';
import type { ProjectConfig } from '../../types';

export interface SettingsFormProps {
  readonly form: UseFormReturnType<ProjectConfig>;
}
