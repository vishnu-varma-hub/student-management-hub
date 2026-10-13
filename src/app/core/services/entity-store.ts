import { HttpClient } from '@angular/common/http';
import { computed, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
/** A small feature-scoped Signal store; HttpClient observables remain the async boundary. */
export abstract class EntityStore<T extends { id: string }, P> {
  protected readonly _items = signal<T[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this.items().length);
  readonly loading = signal(false);
  protected abstract endpoint: string;
  constructor(protected readonly http: HttpClient) {}
  load(): Observable<T[]> {
    this.loading.set(true);
    return this.http.get<T[]>(this.endpoint).pipe(
      tap((items) => this._items.set(items)),
      finalize(() => this.loading.set(false)),
    );
  }
  create(payload: P): Observable<T> {
    return this.http
      .post<T>(this.endpoint, payload)
      .pipe(tap((item) => this._items.update((all) => [...all, item])));
  }
  update(id: string, payload: P): Observable<T> {
    return this.http
      .put<T>(`${this.endpoint}/${encodeURIComponent(id)}`, { ...payload, id })
      .pipe(tap((item) => this._items.update((all) => all.map((x) => (x.id === id ? item : x)))));
  }
  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(tap(() => this._items.update((all) => all.filter((x) => x.id !== id))));
  }
}
