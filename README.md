# Student Management — Angular 20+

## Start
```bash
npm install
npm run api
```
In a **second terminal**:
```bash
npm start
```
Open http://localhost:4200. API runs at http://localhost:3000.

## Folder structure
- `core/models`: domain interfaces
- `core/services`: reusable generic entity store, student/course Signal stores, notifications, edit session
- `core/interceptors`: centralized API error handling
- `shared`: reusable confirmation dialog and empty state
- `features/students`: student CRUD and multi-course enrollment
- `features/courses`: course CRUD and referential cleanup
