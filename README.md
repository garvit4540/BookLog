# BookLog

A full-stack web application to track and summarize books you’ve read.

---

## Features

- **Book Management**: Add, view, edit, and delete books with title, author, and optional tags.
- **Chapter Summaries**: For each book, add/edit/delete chapter summaries (with chapter number/title, date, and Markdown content).
- **Search & Filter**: List and filter books by title, author, or tags.
- **Markdown Support**: Write and preview chapter summaries in Markdown.
- **Dark/Light Mode**: Toggle between dark and light themes, respecting system preferences by default.

---

## Tech Stack

- **Backend**: Go (Golang) with official MongoDB Go driver
- **Database**: MongoDB (normalized schema, indexed for search)
- **Frontend**: React, Tailwind CSS (with dark mode), React Router, Context API/hooks
- **Markdown Editor**: [`@uiw/react-md-editor`](https://github.com/uiwjs/react-md-editor) or similar
- **Markdown Renderer**: [`react-markdown`](https://github.com/remarkjs/react-markdown) or [`react-markdown-preview`](https://github.com/uiwjs/react-markdown-preview)

---

## API Endpoints

### Books
- `GET /books` — List all books (with optional filters/search)
- `POST /books` — Add a new book
- `GET /books/:id` — Get a single book and its chapters
- `PUT /books/:id` — Edit a book
- `DELETE /books/:id` — Delete a book

### Chapters
- `POST /books/:id/chapters` — Add a chapter summary to a book
- `PUT /books/:id/chapters/:chapterId` — Edit a chapter summary
- `DELETE /books/:id/chapters/:chapterId` — Delete a chapter summary

---

## Data Models

### Book
```json
{
  "_id": "ObjectId",
  "title": "string",
  "author": "string",
  "tags": ["string"],
  "chapters": [Chapter]
}
```

### Chapter
```json
{
  "_id": "ObjectId",
  "chapterNumber": "number",
  "chapterTitle": "string",
  "date": "ISODate",
  "content": "string (Markdown)"
}
```

---

## Setup Instructions

### Prerequisites
- Go 1.20+
- Node.js 18+
- MongoDB 6+

### Backend
1. `cd backend`
2. Copy `.env.example` to `.env` and set your MongoDB URI
3. `go mod tidy`
4. `go run main.go`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

---

## Development Notes
- Use RESTful conventions for API design
- Use indexes on `title`, `author`, and `tags` for efficient search
- Use Context API or hooks for state management in React
- Handle API loading and error states gracefully
- Use Tailwind CSS for styling and dark mode support
- Use Markdown editor and renderer for chapter content

---