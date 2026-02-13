# Issue Resolution Note

## Problem
Original error: `Cannot find package '@application/mappers' imported from /var/task/backend/src/infrastructure/persistence/TodoRepositoryPostgres.js`

## Root Cause
The project uses TypeScript path aliases (like `@application/mappers`) which are configured in `tsconfig.json`. These aliases need to be resolved to relative paths during compilation for Node.js to understand them.

## Solution
Running the build process properly resolves the path aliases:
```bash
npm run build
```

This executes:
- `tsc` - TypeScript compiler
- `tsc-alias` - Resolves path aliases to relative paths  
- `fix-imports.js` - Adds `.js` extensions to imports in compiled files

## Result
After running the build process, the application starts successfully without import errors.