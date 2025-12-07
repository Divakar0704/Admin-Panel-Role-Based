import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  loading = false;
  summary: any;
  sessionsLabels: string[] = [];
  sessionsData: number[] = [];
  pointsLabels: string[] = [];
  pointsData: number[] = [];

  // form model
  sport = '';
  level = 'Beginner';
  savingInterest = false;
  interestMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getUserDashboard().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.summary = res.summary;

        this.sessionsLabels = res.charts.sessionsLast7Days.map(
          (d: any) => d.date
        );
        this.sessionsData = res.charts.sessionsLast7Days.map(
          (d: any) => d.value
        );

        this.pointsLabels = res.charts.pointsLast7Days.map(
          (d: any) => d.date
        );
        this.pointsData = res.charts.pointsLast7Days.map(
          (d: any) => d.value
        );
      },
      error: () => (this.loading = false)
    });
  }

  submitInterest() {
    if (!this.sport.trim()) return;
    this.savingInterest = true;
    this.interestMessage = '';

    this.api.createUserInterest({ sport: this.sport.trim(), level: this.level }).subscribe({
      next: () => {
        this.savingInterest = false;
        this.interestMessage = 'Thanks! Your interest was saved.';
        this.sport = '';
        this.level = 'Beginner';
      },
      error: () => {
        this.savingInterest = false;
        this.interestMessage = 'Failed to save your interest.';
      }
    });
  }
}
