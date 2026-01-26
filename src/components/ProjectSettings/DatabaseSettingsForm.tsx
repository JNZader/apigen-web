import { Divider, NumberInput, Select, Stack, Switch } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function DatabaseSettingsForm({ form }: Readonly<SettingsFormProps>) {
  return (
    <Stack>
      <Select
        label="Database Type"
        data={[
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'mariadb', label: 'MariaDB' },
          { value: 'h2', label: 'H2 (Embedded)' },
          { value: 'oracle', label: 'Oracle' },
          { value: 'sqlserver', label: 'SQL Server' },
          { value: 'mongodb', label: 'MongoDB' },
        ]}
        {...form.getInputProps('database.type')}
      />

      <Switch
        label="Generate Migrations"
        description="Generate Flyway/Liquibase migrations"
        {...form.getInputProps('database.generateMigrations', { type: 'checkbox' })}
      />

      <Divider label="Connection Pool (HikariCP)" labelPosition="left" mt="md" />

      <NumberInput
        label="Maximum Pool Size"
        description="Maximum number of connections in the pool"
        min={1}
        max={100}
        {...form.getInputProps('database.hikari.maximumPoolSize')}
      />

      <NumberInput
        label="Minimum Idle"
        description="Minimum number of idle connections to maintain"
        min={0}
        max={50}
        {...form.getInputProps('database.hikari.minimumIdle')}
      />

      <NumberInput
        label="Connection Timeout (ms)"
        description="Maximum time to wait for a connection"
        min={1000}
        step={1000}
        {...form.getInputProps('database.hikari.connectionTimeoutMs')}
      />

      <NumberInput
        label="Idle Timeout (ms)"
        description="Maximum time a connection can remain idle"
        min={10000}
        step={1000}
        {...form.getInputProps('database.hikari.idleTimeoutMs')}
      />
    </Stack>
  );
}
