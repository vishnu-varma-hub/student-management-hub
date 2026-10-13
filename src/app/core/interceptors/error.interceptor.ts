import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notices = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notices.show(
        error.status === 0
          ? 'Cannot connect to JSON Server. Start npm run api.'
          : `Request failed (${error.status}). Please try again.`,
      );
      return throwError(() => error);
    }),
  );
};
