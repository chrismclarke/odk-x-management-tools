import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  snackBarRef:MatSnackBarRef<TextOnlySnackBar>
  constructor(private snackBar:MatSnackBar) { }

  showErrorMessage(message:string){
    if(this.snackBarRef){
      this.snackBarRef.dismiss()
    }
   this.snackBarRef = this.snackBar.open(message,'Close',{
     panelClass:'notification-error'
    });
    

  }
}