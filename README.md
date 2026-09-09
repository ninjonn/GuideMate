# GuideMate

Travel planning platform — plan trips, build itineraries, manage checklists, and track trip participants and tickets.

**Team examination project developed collaboratively. My individual contributions are listed below.**

## Overview

GuideMate is a full-stack travel planning application built as an examination project. It lets a user register and log in, create trips, build a day-by-day itinerary on an interactive map, keep a per-trip checklist, and track trip participants and tickets. The backend is a NestJS REST API backed by PostgreSQL (via Prisma); the frontend is a React single-page app.

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Chakra UI, React Router v7, React Leaflet + Mapbox, Vitest + React Testing Library

**Backend:** NestJS 11, Prisma 7, PostgreSQL (Supabase), Passport (JWT strategy)

**Other:** pnpm (backend), npm (frontend), ESLint, Docker Compose (local Postgres for development)

## My Contribution — Virág Benedek

- Frontend authentication integration: registration, login, logout and session handling against the NestJS/JWT backend
- - Typed API client (`apiFetch<T>`, `setAuthToken`) used across the frontend for authenticated requests
  - - Trip-planning and itinerary UI, including the detailed timeline view for a trip
    - - Checklist and day management within a trip (add/edit/delete days and checklist items)
      - - Map integration (Mapbox via React Leaflet) for browsing and adding places to a trip
        - - Frontend automated tests (Vitest + React Testing Library)
          - - Responsive navigation, route guards, and layout fixes across the app
           
            - ## Key Features
           
            - - User registration, login and JWT-based session handling
              - - Trip creation with a day-by-day itinerary and timeline view
                - - Interactive map for finding and adding places to a trip
                  - - Per-trip checklist and participant/ticket tracking
                    - - Responsive layout across desktop and mobile
                     
                      - ## Architecture
                     
                      - A NestJS backend exposes a REST API on top of a PostgreSQL database (accessed via Prisma), with JWT-based authentication guarding protected routes. The React frontend is a separate single-page app that talks to the backend exclusively through a typed `apiFetch` client.
                     
                      - ## Local Development
                     
                      - Backend:
                      - ```
                        cd backend
                        pnpm install
                        pnpm run start:dev
                        ```
                        Requires a `DATABASE_URL` environment variable pointing at a PostgreSQL database (Prisma generates its client from this at install time).

                        Frontend:
                        ```
                        cd frontend/GuideMate
                        npm install
                        npm run dev
                        ```

                        A `docker-compose.yml` is provided at the repository root for a local database container.

                        ## Testing

                        Frontend:
                        ```
                        cd frontend/GuideMate
                        npm run test:run
                        ```
                        Runs the Vitest suite (5 test files, 8 tests, all passing as of this writing).

                        Backend:
                        ```
                        cd backend
                        pnpm test
                        ```
                        Runs the Jest unit tests (requires the Prisma client to be generated against a configured `DATABASE_URL` first).
