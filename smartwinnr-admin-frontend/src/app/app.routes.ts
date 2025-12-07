import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { Dashboard } from './pages/dashboard/dashboard.component';
import { Users } from './pages/users/users.component';
import { UserHomeComponent } from './pages/user-home/user-home.component';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },          // admin
      { path: 'users', component: Users, canActivate: [AdminGuard] },
      { path: 'user-home', component: UserHomeComponent },           // normal user
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
