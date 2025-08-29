# Simple Notes App (Qwik)

Minimalistic, light-themed notes application with:
- Create notes
- Edit notes
- Delete notes
- List/display notes

Layout: Sidebar for navigation and a main panel for display/editing.

## Environment Variables

Configure the backend base URL for the notes API:

- PUBLIC_NOTES_API_BASE_URL: Base URL to the notes_database backend.
  Example: https://api.example.com

Create a `.env` file based on `.env.example` in this folder.

Note: Only variables prefixed with PUBLIC_ are exposed to the client in Vite/Qwik.

## Development

Install dependencies and run:

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Build and Preview

```bash
npm run build
npm run preview
```

## API Contract

The frontend expects the notes backend (notes_database) to expose REST endpoints:

- GET    /notes                -> Note[]
- POST   /notes                -> created Note
  body: { title: string, content: string }
- GET    /notes/:id            -> Note
- PUT    /notes/:id            -> updated Note
  body: { title: string, content: string }
- DELETE /notes/:id            -> 204 No Content

Note shape:
```
{
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Styling

Colors used:
- primary: #007bff
- secondary: #6c757d
- accent: #17a2b8

Minimalistic light theme with accessible focus states.
