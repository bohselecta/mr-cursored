# Vue.js TypeScript with Prisma Example

This example demonstrates how to use AI Scaffold to create a Vue.js application with TypeScript and Prisma ORM.

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- PostgreSQL database (or compatible)

## Quick Start

```bash
# Create new project
ai-scaffold create my-vue-app --stack vue-ts-prisma

# Navigate to project
cd my-vue-app

# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Start development server
npm run dev
```

## What Gets Generated

### Project Structure
```
my-vue-app/
├── src/
│   ├── components/      # Vue components
│   ├── composables/     # Vue composables
│   ├── lib/            # Utilities
│   │   └── prisma.ts   # Prisma client
│   ├── types/          # TypeScript definitions
│   └── main.ts         # Application entry
├── prisma/
│   └── schema.prisma   # Database schema
├── .cursorrules        # Cursor AI configuration
├── AGENTS.md          # AI development guidelines
└── package.json       # Dependencies
```

### Key Features

#### AI Configuration
- **Cursor Rules**: Vue.js and Prisma specific guidelines
- **Copilot Context**: Optimized for Vue 3 Composition API
- **Claude Instructions**: Database and ORM context

#### Quality Gates
- TypeScript strict mode
- ESLint and Prettier
- Pre-commit hooks
- CI/CD pipeline
- Test coverage

#### Prisma Integration
- Pre-configured Prisma client
- Database schema templates
- Type-safe queries
- Migration utilities

## Development Workflow

### 1. Set Up Database
```bash
# Copy environment variables
cp .env.example .env

# Add your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/myapp?schema=public"
```

### 2. Database Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### 3. Generate Prisma Client
```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 4. Use AI Tools
```bash
# Cursor understands Vue.js patterns
# Copilot suggests Composition API code
# Claude helps with database queries
```

## Example Implementation

### Prisma Client
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Vue Component
```vue
<!-- src/components/UserList.vue -->
<template>
  <div class="user-list">
    <h2>Users</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ul v-else class="users">
      <li v-for="user in users" :key="user.id" class="user">
        <span class="name">{{ user.name }}</span>
        <span class="email">{{ user.email }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { prisma } from '@/lib/prisma'

interface User {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchUsers() {
  try {
    loading.value = true
    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    users.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list {
  padding: 2rem;
}

.loading {
  color: #666;
}

.error {
  color: #e74c3c;
}

.users {
  list-style: none;
  padding: 0;
}

.user {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.name {
  font-weight: bold;
}

.email {
  color: #666;
}
</style>
```

### Composables
```typescript
// src/composables/useUsers.ts
import { ref, computed } from 'vue'
import { prisma } from '@/lib/prisma'
import type { User } from '@/types'

export function useUsers() {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const userCount = computed(() => users.value.length)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    
    try {
      const data = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      })
      users.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData: { name: string; email: string }) {
    try {
      const newUser = await prisma.user.create({
        data: userData
      })
      users.value.unshift(newUser)
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      throw err
    }
  }

  async function updateUser(id: string, userData: Partial<User>) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userData
      })
      
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user'
      throw err
    }
  }

  async function deleteUser(id: string) {
    try {
      await prisma.user.delete({
        where: { id }
      })
      
      users.value = users.value.filter(user => user.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user'
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    userCount,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
}
```

## AI Development Tips

### With Cursor
- Use the `.cursorrules` file for Vue.js context
- Reference the `AGENTS.md` for guidelines
- Follow Composition API patterns

### With Copilot
- Copilot understands Vue 3 patterns
- Use descriptive composable names
- Include proper TypeScript types

### With Claude
- Reference the Prisma schema
- Ask for database query optimizations
- Request component refactoring suggestions

## Database Operations

### CRUD Operations
```typescript
// Create
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// Read
const users = await prisma.user.findMany({
  where: {
    name: {
      contains: 'John'
    }
  }
})

// Update
const updatedUser = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' }
})

// Delete
await prisma.user.delete({
  where: { id: 'user-id' }
})
```

### Advanced Queries
```typescript
// Pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: 'desc' }
})

// Relations
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: true
  }
})

// Aggregations
const userCount = await prisma.user.count()
const avgAge = await prisma.user.aggregate({
  _avg: {
    age: true
  }
})
```

## Testing

### Component Testing
```typescript
// src/components/__tests__/UserList.test.ts
import { mount } from '@vue/test-utils'
import UserList from '../UserList.vue'

describe('UserList', () => {
  it('renders user list correctly', async () => {
    const wrapper = mount(UserList)
    
    // Wait for async data loading
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.user-list').exists()).toBe(true)
  })
})
```

### API Testing
```typescript
// src/__tests__/api/users.test.ts
import { prisma } from '@/lib/prisma'

describe('Users API', () => {
  it('should create a user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    }
    
    const user = await prisma.user.create({
      data: userData
    })
    
    expect(user.name).toBe(userData.name)
    expect(user.email).toBe(userData.email)
  })
})
```

## Deployment

### Environment Setup
```bash
# Production database URL
DATABASE_URL="postgresql://username:password@prod-db:5432/myapp"

# Generate Prisma client for production
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Next Steps

1. **Set up your database**
2. **Define your schema**
3. **Create your components**
4. **Build your features using AI tools**
5. **Deploy to production**

## Troubleshooting

### Common Issues
- **Prisma client not generated**: Run `npx prisma generate`
- **Database connection**: Check `DATABASE_URL`
- **Migration errors**: Check schema syntax

### Getting Help
- Check the generated `AGENTS.md` file
- Use `ai-scaffold health` to diagnose issues
- Review Prisma documentation

---

*This example was generated by AI Scaffold - the ultimate pre-flight tool for AI development!*
