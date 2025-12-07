import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';

  // login form
  loginEmail = '';
  loginPassword = '';

  // register form
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  switchMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = '';
  }

  private redirectByRole() {
    const user = this.auth.currentUser;
    if (user?.role === 'admin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/user-home']);
    }
  }

  onLogin() {
    this.loading = true;
    this.error = '';

    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.loading = false;
        this.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }

  onRegister() {
    this.loading = true;
    this.error = '';

    this.auth
      .register(this.registerName, this.registerEmail, this.registerPassword)
      .subscribe({
        next: () => {
          this.loading = false;
          this.redirectByRole();
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Registration failed';
        }
      });
  }
}