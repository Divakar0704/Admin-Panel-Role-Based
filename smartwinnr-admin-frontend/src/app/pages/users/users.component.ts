import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class Users implements OnInit {
  users: any[] = [];
  loading = false;
  error = '';

  // form model
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  };
  creating = false;
  createError = '';

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.error = 'Only admins can view this page.';
      return;
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.users = res;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error loading users';
      }
    });
  }

  toggleActive(user: any) {
    this.api.toggleUser(user._id).subscribe({
      next: (updated) => {
        user.isActive = updated.isActive;
      }
    });
  }

  createNewUser() {
    this.createError = '';
    this.creating = true;

    this.api.createUser(this.newUser).subscribe({
      next: (created: any) => {
        this.creating = false;
        // push to table
        this.users.push(created);
        // reset form
        this.newUser = {
          name: '',
          email: '',
          password: '',
          role: 'user'
        };
      },
      error: (err) => {
        this.creating = false;
        this.createError = err.error?.message || 'Failed to create user';
      }
    });
  }
}
