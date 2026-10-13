export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  courseIds: string[];
}
export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
}
export type StudentPayload = Omit<Student, 'id'>;
export type CoursePayload = Omit<Course, 'id'>;
