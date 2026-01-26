/**
 * Project Template Configuration
 *
 * This module provides template definitions for the ProjectWizard.
 * Templates define pre-configured project setups with entities and features.
 */

export type TemplateCategory = 'starter' | 'full-stack' | 'microservice' | 'enterprise';

export interface ProjectTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: TemplateCategory;
  readonly tags: readonly string[];
  readonly entities: readonly TemplateEntity[];
  readonly features: readonly string[];
}

export interface TemplateEntity {
  readonly name: string;
  readonly fields: readonly string[];
}

export const PROJECT_TEMPLATES: readonly ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty project',
    icon: 'file',
    category: 'starter',
    tags: ['minimal', 'basic'],
    entities: [],
    features: [],
  },
  {
    id: 'blog-api',
    name: 'Blog API',
    description: 'A blog backend with posts, comments, and tags',
    icon: 'article',
    category: 'starter',
    tags: ['blog', 'content', 'cms'],
    entities: [
      { name: 'Post', fields: ['title', 'content', 'slug', 'published'] },
      { name: 'Comment', fields: ['content', 'authorName', 'approved'] },
      { name: 'Tag', fields: ['name', 'slug'] },
    ],
    features: ['auth'],
  },
  {
    id: 'ecommerce-api',
    name: 'E-Commerce API',
    description: 'Complete e-commerce backend with products, orders, and customers',
    icon: 'shopping-cart',
    category: 'full-stack',
    tags: ['ecommerce', 'shop', 'payments'],
    entities: [
      { name: 'Product', fields: ['name', 'price', 'sku', 'stock'] },
      { name: 'Category', fields: ['name', 'slug'] },
      { name: 'Order', fields: ['total', 'status', 'orderNumber'] },
      { name: 'Customer', fields: ['email', 'firstName', 'lastName'] },
      { name: 'OrderItem', fields: ['quantity', 'unitPrice'] },
    ],
    features: ['auth', 'mailService', 'fileStorage'],
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Project and task management API',
    icon: 'checklist',
    category: 'starter',
    tags: ['todo', 'tasks', 'projects'],
    entities: [
      { name: 'Project', fields: ['name', 'description'] },
      { name: 'Task', fields: ['title', 'description', 'status', 'priority'] },
      { name: 'User', fields: ['email', 'name'] },
    ],
    features: ['auth'],
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description: 'Multi-tenant SaaS application foundation',
    icon: 'server',
    category: 'enterprise',
    tags: ['saas', 'multi-tenant', 'subscription'],
    entities: [
      { name: 'Organization', fields: ['name', 'slug', 'plan'] },
      { name: 'User', fields: ['email', 'name', 'role'] },
      { name: 'Subscription', fields: ['plan', 'status', 'expiresAt'] },
    ],
    features: ['auth', 'socialLogin', 'mailService'],
  },
  {
    id: 'inventory-api',
    name: 'Inventory API',
    description: 'Warehouse and inventory management',
    icon: 'server',
    category: 'full-stack',
    tags: ['inventory', 'warehouse', 'stock'],
    entities: [
      { name: 'Warehouse', fields: ['name', 'address', 'capacity'] },
      { name: 'Product', fields: ['sku', 'name', 'unitCost'] },
      { name: 'Stock', fields: ['quantity', 'reservedQuantity'] },
      { name: 'StockMovement', fields: ['type', 'quantity', 'reference'] },
    ],
    features: ['auth', 'caching'],
  },
] as const;

/**
 * Get all unique categories from templates
 */
export function getTemplateCategories(): TemplateCategory[] {
  const categories = new Set<TemplateCategory>();
  for (const template of PROJECT_TEMPLATES) {
    categories.add(template.category);
  }
  return Array.from(categories);
}

/**
 * Search templates by name, description, or tags
 */
export function searchTemplates(query: string): readonly ProjectTemplate[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return PROJECT_TEMPLATES;

  return PROJECT_TEMPLATES.filter((template) => {
    const nameMatch = template.name.toLowerCase().includes(lowerQuery);
    const descMatch = template.description.toLowerCase().includes(lowerQuery);
    const tagMatch = template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
    return nameMatch || descMatch || tagMatch;
  });
}

/**
 * Filter templates by category
 */
export function filterTemplatesByCategory(
  templates: readonly ProjectTemplate[],
  category: TemplateCategory | null,
): readonly ProjectTemplate[] {
  if (!category) return templates;
  return templates.filter((t) => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}
