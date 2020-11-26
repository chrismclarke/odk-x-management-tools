import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  snackBarRef: MatSnackBarRef<TextOnlySnackBar>;
  constructor(private snackBar: MatSnackBar) {}

  showMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    config: Partial<MatSnackBarConfig<any>> = {}
  ) {
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
    this.snackBarRef = this.snackBar.open(message, 'Close', {
      panelClass: `notification-${type}`,
      ...config,
    });
  }
}
