# PrimeWave Lab Resource Reservation Management System

A web-based application for managing shared resources and reservations. The system allows users to register resources, create and manage reservations, prevent scheduling conflicts, and cancel or edit bookings.

## Features

- **Resource Management:** Create and view available resources.
- **Reservation Management:** Create, view, edit, and cancel reservations.
- **Conflict Prevention:** Prevent overlapping confirmed reservations for the same resource.
- **Reservation Validation:** Validate required fields, email addresses, and reservation dates.
- **Resource Protection:** Prevent deletion of resources that have reservation records.
- **Dashboard:** View resources, reservation details, and reservation statuses.
- **Persistent Storage:** Store resource and reservation information in PostgreSQL.

## Technology Stack

- Next.js with App Router
- React
- TypeScript
- PostgreSQL
- Prisma ORM
- Git and GitHub

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- Git


## Entity Relationship Diagram

The diagram below illustrates the relationship between resources and reservations in the PostgreSQL database.

![Resource Reservation System ER Diagram](docs/ER-Diagram.png)


## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd resource-reservation-system
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

Replace the placeholders with your PostgreSQL username, password, and database name. Do not commit your `.env` file or expose database credentials.

### 4. Set up the database

Run the Prisma migrations if they have already been created:

```bash
npx prisma migrate dev
```

If the project uses a Prisma schema without existing migrations, create the initial migration:

```bash
npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Validation

Run the production build to check for compilation and TypeScript errors:

```bash
npm run build
```

## Reservation Rules

- A reservation must have valid required details.
- The end time must be later than the start time.
- A resource cannot have overlapping confirmed reservations.
- Only confirmed reservations can be edited.
- Cancelled reservations remain in the system as historical records.
- Resources with reservation records cannot be deleted.

## Project Structure

```text
resource-reservation-system/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── resources/
│   │   │   │   └── route.ts
│   │   │   └── reservations/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   └── page.tsx
│   └── lib/
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── README.md
```

## Future Improvements

- User authentication and role-based access control
- Calendar-based reservation views
- Resource availability filters
- Reservation notifications
- Deployment to a production hosting platform

## Author

Developed as a software engineering project for the PrimeWave Lab internship assessment.
