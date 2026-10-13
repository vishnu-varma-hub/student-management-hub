import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { EditSessionService } from './core/services/edit-session.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly notices = inject(NotificationService);
  private readonly edit = inject(EditSessionService);
  private readonly router = inject(Router);
  readonly pendingRoute = signal<string | null>(null);
  navigate(event: MouseEvent, url: string) {
    if (this.edit.dirty()) {
      event.preventDefault();
      this.pendingRoute.set(url);
    }
  }
  discardAndNavigate() {
    const url = this.pendingRoute();
    this.pendingRoute.set(null);
    this.edit.discard();
    if (url) void this.router.navigateByUrl(url);
  }
}
