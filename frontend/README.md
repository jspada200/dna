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
