import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class EditSessionService {
  readonly dirty = signal(false);
  private reset?: () => void;
  register(reset: () => void) {
    this.reset = reset;
  }
  discard() {
    this.reset?.();
    this.dirty.set(false);
  }
  clear() {
    this.reset = undefined;
    this.dirty.set(false);
  }
}
