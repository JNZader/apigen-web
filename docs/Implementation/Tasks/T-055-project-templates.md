# T-055: Crear Sistema de Project Templates

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.2 Templates

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-055 |
| **Tipo** | Feature |
| **Estimado** | 3h |
| **Dependencias** | [[T-054]] |
| **Branch** | `feat/project-templates` |
| **Estado** | Pending |

---

## Objetivo

Crear sistema de plantillas predefinidas para iniciar proyectos rapidamente.

---

## Tareas

- [ ] Definir estructura de templates
- [ ] Crear templates predefinidos
- [ ] UI para seleccion de template
- [ ] Aplicar template al proyecto

---

## Archivos a Crear

```
src/config/
└── projectTemplates.ts  ← CREAR (~200 lineas)

src/components/ProjectWizard/
└── TemplateSelector.tsx ← CREAR (~150 lineas)
```

---

## Codigo de Referencia

```typescript
// src/config/projectTemplates.ts

import type { Entity } from '@/types/entity';
import type { TargetConfig } from '@/types/target';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'starter' | 'full-stack' | 'microservice' | 'enterprise';
  icon: string;
  preview?: string;
  targetConfig: Partial<TargetConfig>;
  features: string[];
  entities: Partial<Entity>[];
  tags: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with no entities',
    category: 'starter',
    icon: 'file',
    targetConfig: {
      language: 'java',
      framework: 'spring-boot',
    },
    features: [],
    entities: [],
    tags: ['minimal', 'empty'],
  },
  {
    id: 'blog-api',
    name: 'Blog API',
    description: 'Simple blog with posts, comments, and users',
    category: 'starter',
    icon: 'article',
    targetConfig: {
      language: 'java',
      framework: 'spring-boot',
    },
    features: ['authentication'],
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'username', type: 'String', unique: true },
          { name: 'email', type: 'String', unique: true },
          { name: 'passwordHash', type: 'String' },
          { name: 'createdAt', type: 'LocalDateTime' },
        ],
      },
      {
        name: 'Post',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'title', type: 'String' },
          { name: 'content', type: 'Text' },
          { name: 'slug', type: 'String', unique: true },
          { name: 'published', type: 'Boolean' },
          { name: 'publishedAt', type: 'LocalDateTime', nullable: true },
        ],
      },
      {
        name: 'Comment',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'content', type: 'Text' },
          { name: 'createdAt', type: 'LocalDateTime' },
        ],
      },
    ],
    tags: ['blog', 'content', 'cms'],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce API',
    description: 'Complete online store with products, orders, and payments',
    category: 'full-stack',
    icon: 'shopping-cart',
    targetConfig: {
      language: 'java',
      framework: 'spring-boot',
    },
    features: ['authentication', 'fileUpload', 'mailService'],
    entities: [
      {
        name: 'Product',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'name', type: 'String' },
          { name: 'description', type: 'Text' },
          { name: 'price', type: 'BigDecimal' },
          { name: 'stock', type: 'Integer' },
          { name: 'sku', type: 'String', unique: true },
        ],
      },
      {
        name: 'Category',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'name', type: 'String' },
          { name: 'slug', type: 'String', unique: true },
        ],
      },
      {
        name: 'Order',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'orderNumber', type: 'String', unique: true },
          { name: 'status', type: 'Enum', enumValues: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
          { name: 'total', type: 'BigDecimal' },
          { name: 'createdAt', type: 'LocalDateTime' },
        ],
      },
      {
        name: 'OrderItem',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'quantity', type: 'Integer' },
          { name: 'price', type: 'BigDecimal' },
        ],
      },
      {
        name: 'Customer',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'email', type: 'String', unique: true },
          { name: 'firstName', type: 'String' },
          { name: 'lastName', type: 'String' },
        ],
      },
    ],
    tags: ['ecommerce', 'shop', 'store'],
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Project and task management system',
    category: 'starter',
    icon: 'checklist',
    targetConfig: {
      language: 'java',
      framework: 'spring-boot',
    },
    features: ['authentication'],
    entities: [
      {
        name: 'Project',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'name', type: 'String' },
          { name: 'description', type: 'Text', nullable: true },
          { name: 'status', type: 'Enum', enumValues: ['ACTIVE', 'COMPLETED', 'ARCHIVED'] },
        ],
      },
      {
        name: 'Task',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'title', type: 'String' },
          { name: 'description', type: 'Text', nullable: true },
          { name: 'priority', type: 'Enum', enumValues: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          { name: 'status', type: 'Enum', enumValues: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] },
          { name: 'dueDate', type: 'LocalDate', nullable: true },
        ],
      },
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'username', type: 'String', unique: true },
          { name: 'email', type: 'String', unique: true },
        ],
      },
    ],
    tags: ['tasks', 'projects', 'productivity'],
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Complete user system with roles and permissions',
    category: 'microservice',
    icon: 'users',
    targetConfig: {
      language: 'java',
      framework: 'spring-boot',
    },
    features: ['authentication', 'socialLogin', 'passwordReset', 'mailService'],
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'username', type: 'String', unique: true },
          { name: 'email', type: 'String', unique: true },
          { name: 'passwordHash', type: 'String' },
          { name: 'active', type: 'Boolean' },
          { name: 'emailVerified', type: 'Boolean' },
          { name: 'lastLoginAt', type: 'LocalDateTime', nullable: true },
        ],
      },
      {
        name: 'Role',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'name', type: 'String', unique: true },
          { name: 'description', type: 'String', nullable: true },
        ],
      },
      {
        name: 'Permission',
        fields: [
          { name: 'id', type: 'Long', primaryKey: true },
          { name: 'name', type: 'String', unique: true },
          { name: 'resource', type: 'String' },
          { name: 'action', type: 'String' },
        ],
      },
    ],
    tags: ['auth', 'users', 'security'],
  },
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: ProjectTemplate['category']): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string): ProjectTemplate[] {
  const lower = query.toLowerCase();
  return PROJECT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}
```

---

## Criterios de Completado

- [ ] Al menos 5 templates definidos
- [ ] Templates tienen entidades predefinidas
- [ ] Templates tienen features predefinidas
- [ ] Sistema de busqueda/filtro
- [ ] `npm run check` pasa

---

## Pre-Commit Checklist

> **Antes de commitear**, ejecutar en orden:

```bash
npm run check:fix && npm run test:run && gga run
```

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato OK
- [ ] `npm run test:run` - Tests pasan
- [ ] `gga run` - STATUS: PASSED

> Ver detalles: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-5 #feature #pending

[[T-054]] → [[T-055]] → [[T-056]] | [[Phases/05-UX-IMPROVEMENTS]]
