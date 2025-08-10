

import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthChildGuard implements CanActivateChild {
  constructor(private router: Router) {}

  canActivateChild(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true; // User is authenticated
    } else {
      this.router.navigate(['/login']); // Redirect to the login page
      return false;
    }
  }
}
