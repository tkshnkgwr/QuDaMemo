# Release Guide (RELEASE.md) - QuDaMemo

## 1. Build Process
```bash
npm run build
```
Executes Vite frontend bundle and compiles `server.ts` into CommonJS `dist/server.cjs` via esbuild.

## 2. Launch Production
```bash
npm start
```
Runs `node dist/server.cjs` on Port 3000.
