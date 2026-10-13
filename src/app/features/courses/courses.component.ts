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
import { finalize, forkJoin, switchMap, from, concatMap, toArray } from 'rxjs';
import { CoursesStore } from '../../core/services/courses.store';
import { StudentsStore } from '../../core/services/students.store';
import { Course } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';
import { EditSessionService } from '../../core/services/edit-session.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDialogComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css',
})
export class CoursesComponent implements OnInit, OnDestroy {
  readonly store = inject(CoursesStore);
  readonly students = inject(StudentsStore);
  private readonly notices = inject(NotificationService);
  private readonly session = inject(EditSessionService);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: [''],
  });
  readonly search = signal('');
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly toDelete = signal<Course | null>(null);
  readonly confirmClose = signal(false);
  readonly filtered = computed(() =>
    this.store
      .items()
      .filter((c) =>
        `${c.name} ${c.code} ${c.description}`
          .toLowerCase()
          .includes(this.search().trim().toLowerCase()),
      ),
  );
  constructor() {
    this.form.valueChanges.subscribe(() => {
      if (this.showForm()) this.session.dirty.set(this.form.dirty);
    });
  }
  ngOnInit() {
    forkJoin([this.store.load(), this.students.load()]).subscribe({ error: () => {} });
    this.session.register(() => this.closeForm());
  }
  ngOnDestroy() {
    this.session.clear();
  }
  enrollmentCount(id: string) {
    return this.students.items().filter((s) => s.courseIds.includes(id)).length;
  }
  openNew() {
    this.form.reset();
    this.editingId.set(null);
    this.showForm.set(true);
    this.session.dirty.set(false);
  }
  edit(c: Course) {
    this.editingId.set(c.id);
    this.form.reset({ name: c.name, code: c.code, description: c.description });
    this.showForm.set(true);
    this.session.dirty.set(false);
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
    const payload = this.form.getRawValue();
    const id = this.editingId();
    this.saving.set(true);
    const op = id ? this.store.update(id, payload) : this.store.create(payload);
    op.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.closeForm();
        this.notices.show('Course saved successfully.');
      },
      error: () => {},
    });
  }
  deleteCourse(c: Course) {
    this.toDelete.set(null);
    this.saving.set(true);
    // JSON Server has no transactions: unlink enrollments first, then delete the course.
    const affected = this.students.items().filter((s) => s.courseIds.includes(c.id));
    from(affected)
      .pipe(
        concatMap((s) =>
          this.students.update(s.id, {
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            courseIds: s.courseIds.filter((id) => id !== c.id),
          }),
        ),
        toArray(),
        switchMap(() => this.store.delete(c.id)),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => this.notices.show('Course deleted and enrollments updated.'),
        error: () => this.notices.show('Delete incomplete. Refresh and retry.'),
      });
  }
}
