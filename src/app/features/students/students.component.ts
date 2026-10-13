import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { StudentsStore } from '../../core/services/students.store';
import { CoursesStore } from '../../core/services/courses.store';
import { Student } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';
import { EditSessionService } from '../../core/services/edit-session.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
@Component({
  selector: 'app-students',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  readonly store = inject(StudentsStore);
  readonly courses = inject(CoursesStore);
  private readonly notices = inject(NotificationService);
  private readonly session = inject(EditSessionService);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
  });
  readonly search = signal('');
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedCourses = signal<string[]>([]);
  readonly saving = signal(false);
  readonly toDelete = signal<Student | null>(null);
  readonly confirmClose = signal(false);
  readonly filtered = computed(() =>
    this.store
      .items()
      .filter((s) =>
        `${s.firstName} ${s.lastName} ${s.email}`
          .toLowerCase()
          .includes(this.search().trim().toLowerCase()),
      ),
  );
  constructor() {
    this.form.valueChanges.subscribe(() => {
      if (this.showForm())
        this.session.dirty.set(this.form.dirty || this.selectedCourses().length > 0);
    });
  }
  ngOnInit() {
    forkJoin([this.store.load(), this.courses.load()]).subscribe({ error: () => {} });
    this.session.register(() => this.closeForm());
  }
  ngOnDestroy() {
    this.session.clear();
  }
  courseNames(student: Student) {
    return (
      student.courseIds
        .map((id) => this.courses.items().find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'None'
    );
  }
  openNew() {
    this.form.reset();
    this.selectedCourses.set([]);
    this.editingId.set(null);
    this.showForm.set(true);
    this.session.dirty.set(false);
  }
  edit(s: Student) {
    this.editingId.set(s.id);
    this.form.reset({ firstName: s.firstName, lastName: s.lastName, email: s.email });
    this.selectedCourses.set([...s.courseIds]);
    this.showForm.set(true);
    this.session.dirty.set(false);
  }
  toggleCourse(id: string, checked: boolean) {
    this.selectedCourses.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
    this.session.dirty.set(true);
  }
  requestClose() {
    if (this.session.dirty()) this.confirmClose.set(true);
    else this.closeForm();
  }
  closeForm() {
    this.showForm.set(false);
    this.confirmClose.set(false);
    this.session.dirty.set(false);
    this.form.reset();
  }
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = { ...this.form.getRawValue(), courseIds: this.selectedCourses() };
    this.saving.set(true);
    const id = this.editingId();
    const op = id ? this.store.update(id, payload) : this.store.create(payload);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.closeForm();
        this.notices.show('Student saved successfully.');
      },
      error: () => {},
    });
  }
  deleteStudent(s: Student) {
    this.toDelete.set(null);
    this.store
      .delete(s.id)
      .subscribe({ next: () => this.notices.show('Student deleted.'), error: () => {} });
  }
}
