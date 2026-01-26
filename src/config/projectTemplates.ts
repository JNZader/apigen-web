import { nanoid } from 'nanoid';
import type { EntityDesign } from '../types';
import type { RelationDesign } from '../types/relation';

export type TemplateCategory = 'starter' | 'full-stack' | 'microservice';

export interface TemplateRelation {
  sourceEntityName: string;
  targetEntityName: string;
  type: RelationDesign['type'];
  bidirectional: boolean;
  fetchType: RelationDesign['fetchType'];
  cascade: RelationDesign['cascade'];
  foreignKey: RelationDesign['foreignKey'];
  joinTable?: RelationDesign['joinTable'];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: TemplateCategory;
  tags: string[];
  entities: Omit<EntityDesign, 'id'>[];
  relations: TemplateRelation[];
}

export const TEMPLATE_CATEGORIES: {
  value: TemplateCategory;
  label: string;
  description: string;
}[] = [
  { value: 'starter', label: 'Starter', description: 'Simple projects to get started quickly' },
  {
    value: 'full-stack',
    label: 'Full-Stack',
    description: 'Complete applications with multiple features',
  },
  {
    value: 'microservice',
    label: 'Microservice',
    description: 'Focused services for specific domains',
  },
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty project',
    icon: 'IconFile',
    category: 'starter',
    tags: ['empty', 'scratch', 'custom'],
    entities: [],
    relations: [],
  },
  {
    id: 'blog',
    name: 'Blog API',
    description: 'Posts, authors, categories, comments, tags',
    icon: 'IconNews',
    category: 'starter',
    tags: ['blog', 'cms', 'content', 'posts', 'articles'],
    entities: [
      {
        name: 'Author',
        tableName: 'authors',
        description: 'Blog authors',
        position: { x: 50, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'email',
            columnName: 'email',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Email' }],
          },
          {
            id: nanoid(),
            name: 'bio',
            columnName: 'bio',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'avatarUrl',
            columnName: 'avatar_url',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Post',
        tableName: 'posts',
        description: 'Blog posts',
        position: { x: 350, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'title',
            columnName: 'title',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '5,200' }],
          },
          {
            id: nanoid(),
            name: 'slug',
            columnName: 'slug',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'content',
            columnName: 'content',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'excerpt',
            columnName: 'excerpt',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [{ type: 'Size', value: '0,500' }],
          },
          {
            id: nanoid(),
            name: 'published',
            columnName: 'published',
            type: 'Boolean',
            nullable: false,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'publishedAt',
            columnName: 'published_at',
            type: 'LocalDateTime',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'featuredImage',
            columnName: 'featured_image',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Category',
        tableName: 'categories',
        description: 'Post categories',
        position: { x: 350, y: 300 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'slug',
            columnName: 'slug',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Tag',
        tableName: 'tags',
        description: 'Post tags',
        position: { x: 650, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'slug',
            columnName: 'slug',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Comment',
        tableName: 'comments',
        description: 'Post comments',
        position: { x: 650, y: 300 },
        fields: [
          {
            id: nanoid(),
            name: 'authorName',
            columnName: 'author_name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'authorEmail',
            columnName: 'author_email',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }, { type: 'Email' }],
          },
          {
            id: nanoid(),
            name: 'content',
            columnName: 'content',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '1,2000' }],
          },
          {
            id: nanoid(),
            name: 'approved',
            columnName: 'approved',
            type: 'Boolean',
            nullable: false,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
    ],
    relations: [
      {
        sourceEntityName: 'Post',
        targetEntityName: 'Author',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'author_id',
          nullable: false,
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Post',
        targetEntityName: 'Category',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'category_id',
          nullable: true,
          onDelete: 'SET_NULL',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Post',
        targetEntityName: 'Tag',
        type: 'ManyToMany',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'post_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        joinTable: { name: 'post_tags', joinColumn: 'post_id', inverseJoinColumn: 'tag_id' },
      },
      {
        sourceEntityName: 'Comment',
        targetEntityName: 'Post',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'post_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce API',
    description: 'Products, categories, orders, customers, reviews',
    icon: 'IconShoppingCart',
    category: 'full-stack',
    tags: ['ecommerce', 'shop', 'store', 'products', 'orders', 'cart'],
    entities: [
      {
        name: 'Category',
        tableName: 'categories',
        description: 'Product categories',
        position: { x: 50, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '2,100' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'slug',
            columnName: 'slug',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Product',
        tableName: 'products',
        description: 'Products for sale',
        position: { x: 350, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '2,200' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'price',
            columnName: 'price',
            type: 'BigDecimal',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }, { type: 'PositiveOrZero' }],
          },
          {
            id: nanoid(),
            name: 'stock',
            columnName: 'stock',
            type: 'Integer',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }, { type: 'PositiveOrZero' }],
          },
          {
            id: nanoid(),
            name: 'sku',
            columnName: 'sku',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'imageUrl',
            columnName: 'image_url',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Customer',
        tableName: 'customers',
        description: 'Registered customers',
        position: { x: 50, y: 300 },
        fields: [
          {
            id: nanoid(),
            name: 'email',
            columnName: 'email',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Email' }],
          },
          {
            id: nanoid(),
            name: 'firstName',
            columnName: 'first_name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'lastName',
            columnName: 'last_name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'phone',
            columnName: 'phone',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'address',
            columnName: 'address',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
      {
        name: 'Order',
        tableName: 'orders',
        description: 'Customer orders',
        position: { x: 350, y: 300 },
        fields: [
          {
            id: nanoid(),
            name: 'orderNumber',
            columnName: 'order_number',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'total',
            columnName: 'total',
            type: 'BigDecimal',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }, { type: 'PositiveOrZero' }],
          },
          {
            id: nanoid(),
            name: 'status',
            columnName: 'status',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'shippingAddress',
            columnName: 'shipping_address',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'orderDate',
            columnName: 'order_date',
            type: 'LocalDateTime',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
      {
        name: 'OrderItem',
        tableName: 'order_items',
        description: 'Items in an order',
        position: { x: 650, y: 300 },
        fields: [
          {
            id: nanoid(),
            name: 'quantity',
            columnName: 'quantity',
            type: 'Integer',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }, { type: 'Positive' }],
          },
          {
            id: nanoid(),
            name: 'unitPrice',
            columnName: 'unit_price',
            type: 'BigDecimal',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }, { type: 'PositiveOrZero' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
      {
        name: 'Review',
        tableName: 'reviews',
        description: 'Product reviews',
        position: { x: 650, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'rating',
            columnName: 'rating',
            type: 'Integer',
            nullable: false,
            unique: false,
            validations: [
              { type: 'NotNull' },
              { type: 'Min', value: '1' },
              { type: 'Max', value: '5' },
            ],
          },
          {
            id: nanoid(),
            name: 'comment',
            columnName: 'comment',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [{ type: 'Size', value: '0,1000' }],
          },
          {
            id: nanoid(),
            name: 'reviewDate',
            columnName: 'review_date',
            type: 'LocalDateTime',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
    ],
    relations: [
      {
        sourceEntityName: 'Product',
        targetEntityName: 'Category',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'category_id',
          nullable: false,
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Order',
        targetEntityName: 'Customer',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'customer_id',
          nullable: false,
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'OrderItem',
        targetEntityName: 'Order',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'order_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'OrderItem',
        targetEntityName: 'Product',
        type: 'ManyToOne',
        bidirectional: false,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'product_id',
          nullable: false,
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Review',
        targetEntityName: 'Product',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'product_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Review',
        targetEntityName: 'Customer',
        type: 'ManyToOne',
        bidirectional: false,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'customer_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
    ],
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Projects, tasks, users, labels, comments',
    icon: 'IconCheckbox',
    category: 'starter',
    tags: ['tasks', 'projects', 'todo', 'productivity', 'kanban'],
    entities: [
      {
        name: 'Project',
        tableName: 'projects',
        description: 'Projects containing tasks',
        position: { x: 50, y: 150 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '2,100' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'color',
            columnName: 'color',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'archived',
            columnName: 'archived',
            type: 'Boolean',
            nullable: false,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Task',
        tableName: 'tasks',
        description: 'Tasks to complete',
        position: { x: 350, y: 150 },
        fields: [
          {
            id: nanoid(),
            name: 'title',
            columnName: 'title',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '2,200' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'priority',
            columnName: 'priority',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'status',
            columnName: 'status',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'dueDate',
            columnName: 'due_date',
            type: 'LocalDate',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'completedAt',
            columnName: 'completed_at',
            type: 'LocalDateTime',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'position',
            columnName: 'position',
            type: 'Integer',
            nullable: false,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
      {
        name: 'User',
        tableName: 'users',
        description: 'System users',
        position: { x: 650, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'email',
            columnName: 'email',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Email' }],
          },
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'avatarUrl',
            columnName: 'avatar_url',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'role',
            columnName: 'role',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Label',
        tableName: 'labels',
        description: 'Task labels',
        position: { x: 650, y: 250 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'color',
            columnName: 'color',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
    ],
    relations: [
      {
        sourceEntityName: 'Task',
        targetEntityName: 'Project',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'project_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Task',
        targetEntityName: 'User',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'assignee_id',
          nullable: true,
          onDelete: 'SET_NULL',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'Task',
        targetEntityName: 'Label',
        type: 'ManyToMany',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'task_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        joinTable: { name: 'task_labels', joinColumn: 'task_id', inverseJoinColumn: 'label_id' },
      },
      {
        sourceEntityName: 'Project',
        targetEntityName: 'User',
        type: 'ManyToOne',
        bidirectional: false,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'owner_id',
          nullable: false,
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
      },
    ],
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Users, roles, permissions, sessions, audit logs',
    icon: 'IconUsers',
    category: 'microservice',
    tags: ['users', 'auth', 'roles', 'permissions', 'security', 'iam'],
    entities: [
      {
        name: 'User',
        tableName: 'users',
        description: 'System users',
        position: { x: 50, y: 150 },
        fields: [
          {
            id: nanoid(),
            name: 'username',
            columnName: 'username',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '3,50' }],
          },
          {
            id: nanoid(),
            name: 'email',
            columnName: 'email',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Email' }],
          },
          {
            id: nanoid(),
            name: 'passwordHash',
            columnName: 'password_hash',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'firstName',
            columnName: 'first_name',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'lastName',
            columnName: 'last_name',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'active',
            columnName: 'active',
            type: 'Boolean',
            nullable: false,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'emailVerified',
            columnName: 'email_verified',
            type: 'Boolean',
            nullable: false,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'lastLoginAt',
            columnName: 'last_login_at',
            type: 'LocalDateTime',
            nullable: true,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Role',
        tableName: 'roles',
        description: 'User roles',
        position: { x: 350, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }, { type: 'Size', value: '2,50' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'systemRole',
            columnName: 'system_role',
            type: 'Boolean',
            nullable: false,
            unique: false,
            validations: [],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Permission',
        tableName: 'permissions',
        description: 'System permissions',
        position: { x: 650, y: 50 },
        fields: [
          {
            id: nanoid(),
            name: 'name',
            columnName: 'name',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'description',
            columnName: 'description',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'resource',
            columnName: 'resource',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'action',
            columnName: 'action',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: true },
      },
      {
        name: 'Session',
        tableName: 'sessions',
        description: 'User sessions',
        position: { x: 50, y: 350 },
        fields: [
          {
            id: nanoid(),
            name: 'token',
            columnName: 'token',
            type: 'String',
            nullable: false,
            unique: true,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'ipAddress',
            columnName: 'ip_address',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'userAgent',
            columnName: 'user_agent',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'expiresAt',
            columnName: 'expires_at',
            type: 'LocalDateTime',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }],
          },
          {
            id: nanoid(),
            name: 'createdAt',
            columnName: 'created_at',
            type: 'LocalDateTime',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
      {
        name: 'AuditLog',
        tableName: 'audit_logs',
        description: 'Security audit logs',
        position: { x: 350, y: 350 },
        fields: [
          {
            id: nanoid(),
            name: 'action',
            columnName: 'action',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'resource',
            columnName: 'resource',
            type: 'String',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotBlank' }],
          },
          {
            id: nanoid(),
            name: 'resourceId',
            columnName: 'resource_id',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'details',
            columnName: 'details',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'ipAddress',
            columnName: 'ip_address',
            type: 'String',
            nullable: true,
            unique: false,
            validations: [],
          },
          {
            id: nanoid(),
            name: 'timestamp',
            columnName: 'timestamp',
            type: 'LocalDateTime',
            nullable: false,
            unique: false,
            validations: [{ type: 'NotNull' }],
          },
        ],
        config: { generateController: true, generateService: true, enableCaching: false },
      },
    ],
    relations: [
      {
        sourceEntityName: 'User',
        targetEntityName: 'Role',
        type: 'ManyToMany',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'user_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        joinTable: { name: 'user_roles', joinColumn: 'user_id', inverseJoinColumn: 'role_id' },
      },
      {
        sourceEntityName: 'Role',
        targetEntityName: 'Permission',
        type: 'ManyToMany',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'role_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        joinTable: {
          name: 'role_permissions',
          joinColumn: 'role_id',
          inverseJoinColumn: 'permission_id',
        },
      },
      {
        sourceEntityName: 'Session',
        targetEntityName: 'User',
        type: 'ManyToOne',
        bidirectional: true,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'user_id',
          nullable: false,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      {
        sourceEntityName: 'AuditLog',
        targetEntityName: 'User',
        type: 'ManyToOne',
        bidirectional: false,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: 'user_id',
          nullable: true,
          onDelete: 'SET_NULL',
          onUpdate: 'CASCADE',
        },
      },
    ],
  },
];

export function applyTemplate(template: ProjectTemplate): {
  entities: EntityDesign[];
  relations: RelationDesign[];
} {
  // Generate IDs for entities
  const entityIdMap = new Map<string, string>();
  const entities: EntityDesign[] = template.entities.map((entity) => {
    const id = nanoid();
    entityIdMap.set(entity.name, id);
    return { ...entity, id };
  });

  // Generate relations with proper entity IDs
  const relations: RelationDesign[] = template.relations.map((rel) => {
    const sourceEntityId = entityIdMap.get(rel.sourceEntityName);
    const targetEntityId = entityIdMap.get(rel.targetEntityName);

    if (!sourceEntityId || !targetEntityId) {
      throw new Error(
        `Entity not found for relation: ${rel.sourceEntityName} -> ${rel.targetEntityName}`,
      );
    }

    return {
      id: nanoid(),
      type: rel.type,
      sourceEntityId,
      targetEntityId,
      sourceFieldName: rel.targetEntityName.toLowerCase(),
      bidirectional: rel.bidirectional,
      fetchType: rel.fetchType,
      cascade: rel.cascade,
      foreignKey: rel.foreignKey,
      joinTable: rel.joinTable,
    };
  });

  return { entities, relations };
}

export function filterTemplates(
  templates: ProjectTemplate[],
  options: {
    search?: string;
    category?: TemplateCategory | 'all';
    tags?: string[];
  },
): ProjectTemplate[] {
  return templates.filter((template) => {
    // Filter by category
    if (options.category && options.category !== 'all' && template.category !== options.category) {
      return false;
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      const hasMatchingTag = options.tags.some((tag) => template.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Filter by search
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const matchesName = template.name.toLowerCase().includes(searchLower);
      const matchesDescription = template.description.toLowerCase().includes(searchLower);
      const matchesTags = template.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      const matchesEntities = template.entities.some((entity) =>
        entity.name.toLowerCase().includes(searchLower),
      );

      if (!matchesName && !matchesDescription && !matchesTags && !matchesEntities) {
        return false;
      }
    }

    return true;
  });
}

export function getAllTags(templates: ProjectTemplate[]): string[] {
  const tagSet = new Set<string>();
  for (const template of templates) {
    for (const tag of template.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
