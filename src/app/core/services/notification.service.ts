import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal<string | null>(null);
  show(message: string) {
    this.message.set(message);
  }
  clear() {
    this.message.set(null);
  }
}
