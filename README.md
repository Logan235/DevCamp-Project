# DEVCAMP Project

## Prerequisites

- **Node.js** (v20 or higher recommended)
- **pnpm** (`npm install -g pnpm`)
- **Docker Desktop**

## CLI Commands

### 1. Project Setup
Install all dependencies for both frontend and backend apps:
```bash
pnpm install
```
After installation, run:
```bash
pnpm approve-builds
```
Then select `msgpackr-extract` to allow its build script to run.

### 2. Database Initialization
Start the MongoDB container in the background via Docker:
```bash
docker-compose up -d
```
### 3. Local Development
Launch both frontend and backend applications concurrently:
```bash
pnpm dev
```
To run applications individually:
- Frontend only: 
```bash
pnpm dev:client
```
- Backend only: 
```bash
pnpm dev:server
```
### 4. Code Quality (Linting)
Run linter to check and automatically fix code formatting issues:
```bash
pnpm lint
```
### 5. Production Build
Compile both frontend and backend applications for production deployment:
```bash
pnpm build
```