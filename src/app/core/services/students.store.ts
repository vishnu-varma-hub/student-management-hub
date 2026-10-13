import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntityStore } from './entity-store';
import { Student, StudentPayload } from '../models/models';
@Injectable({ providedIn: 'root' })
export class StudentsStore extends EntityStore<Student, StudentPayload> {
  protected endpoint = 'http://localhost:3000/students';
  constructor() {
    super(inject(HttpClient));
  }
}
