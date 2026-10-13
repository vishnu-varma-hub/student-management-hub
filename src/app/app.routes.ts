import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'students' },
  {
    path: 'students',
    loadComponent: () =>
      import('./features/students/students.component').then((m) => m.StudentsComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then((m) => m.CoursesComponent),
  },
  { path: '**', redirectTo: 'students' },
];
