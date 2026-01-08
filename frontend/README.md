# DNA Frontend

This is a monorepo containing the DNA frontend packages.

## Structure

- `packages/core` - TypeScript package without React dependencies. Contains shared utilities, types, and business logic. Can be used stand alone to interact with the DNA backend.
- `packages/app` - React application using Vite, TanStack Query, and Radix Themes.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the React app in development mode:

```bash
npm run dev
```

This will start the Vite dev server for the app.

### Build

Build all packages:

```bash
npm run build
```

Build individual packages:

```bash
npm run build:core
npm run build:app
```

### Testing

Run all tests:

```bash
npm run test
```

Run tests once (no watch mode):

```bash
npm run test:run
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests for individual packages:

```bash
npm run test --workspace=@dna/core
npm run test --workspace=@dna/app
```

## Packages

### @dna/core

A TypeScript package that provides shared utilities and types. It has no React dependencies and can be used in any TypeScript project.

**Usage:**

```typescript
import { formatDate, isValidUrl, type Version } from '@dna/core';
```

### @dna/app

A React application built with:
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Powerful data synchronization for React
- **Radix Themes** - Beautiful, accessible component library

The app imports and uses the `@dna/core` package.

## Testing

Both packages use [Vitest](https://vitest.dev/) for testing:

- **@dna/core** - Uses Vitest with Node.js environment for testing utilities and types
- **@dna/app** - Uses Vitest with jsdom environment and React Testing Library for component testing

Test files should be named `*.test.ts` or `*.test.tsx` and placed alongside the source files or in a `__tests__` directory.
