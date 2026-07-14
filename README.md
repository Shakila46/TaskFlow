# TaskFlow - Project Management System

TaskFlow is a comprehensive role-based project management system built with Next.js, Node.js, and Prisma.

## Requirements Checklist
- [x] **Entity Relationship Diagram** (See `full_system_diagrams.md`)
- [x] **Use Case Diagram** (See `full_system_diagrams.md`)
- [x] **System Architecture Diagram** (See `full_system_diagrams.md`)
- [x] **`.env.example`** included in both frontend and backend
- [x] **Postman Collection** (`TaskFlow_Postman_Collection.json`)
- [x] **Feature Completion Report** (`Feature_Completion_Report.md`)
- [x] **CI/CD Workflow explanation** (See below & `.github/workflows/ci.yml`)

## Setup Instructions

### 1. Database Setup
Ensure you have MySQL or PostgreSQL installed and running. Create a new database for this project.

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.
4. Run migrations: `npx prisma migrate dev`
5. Generate Prisma client: `npx prisma generate`
6. Start the server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` or `.env`.
4. Start the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## AI Tools Used
This project was developed with the assistance of:
- **Antigravity IDE**: Assisted in generating React components, responsive CSS, backend architecture, and bug fixing.
- **Claude / Gemini / GPT-4**: Used for architectural planning and troubleshooting complex bugs.
- *AI assistance was primarily used for boilerplate generation, CSS styling, and Mermaid/PlantUML diagram creation.*

## CI/CD Workflow Explanation
We have implemented a continuous integration (CI) pipeline using GitHub Actions. The workflow is defined in `.github/workflows/ci.yml`. 
Whenever code is pushed to the `main` branch or a Pull Request is opened, the workflow automatically:
1. Provisions an Ubuntu server container.
2. Installs Node.js.
3. Installs backend and frontend dependencies.
4. Generates the Prisma client to validate the database schema.
5. Runs a production build of the Next.js frontend to ensure no build errors are introduced.
