import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntityStore } from './entity-store';
import { Course, CoursePayload } from '../models/models';
@Injectable({ providedIn: 'root' })
export class CoursesStore extends EntityStore<Course, CoursePayload> {
  protected endpoint = 'http://localhost:3000/courses';
  constructor() {
    super(inject(HttpClient));
  }
}
