import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers() {
    const token = this.auth.token;
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  getMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metrics`, this.headers);
  }

  getUserDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/dashboard`, this.headers);
  }

  createUserInterest(data: { sport: string; level: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/interests`, data, this.headers);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, this.headers);
  }

  toggleUser(id: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/users/${id}/toggle-active`,
      {},
      this.headers
    );
  }
  createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}) {
  return this.http.post(
    `${this.apiUrl}/auth/register`,
    data,
    this.headers
  );
}

}
