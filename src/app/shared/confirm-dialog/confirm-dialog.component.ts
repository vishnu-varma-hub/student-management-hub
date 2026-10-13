import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  readonly title = input('Please confirm');
  readonly message = input('Are you sure?');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
