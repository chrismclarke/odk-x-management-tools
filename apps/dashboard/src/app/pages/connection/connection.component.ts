import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
})
export class ConnectionComponent {
  constructor(private router: Router) {}

  handleConnectionChange(isConnected: boolean) {
    if (isConnected) {
      this.router.navigate(['/tables']);
    }
  }
}
