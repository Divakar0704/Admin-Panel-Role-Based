import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class Dashboard implements OnInit {
  loading = false;

  summary: any;

  signupsChartLabels: string[] = [];
  signupsChartData: number[] = [];

  salesChartLabels: string[] = [];
  salesChartData: number[] = [];

  sportsInterests: { sport: string; count: number; percentage?: number }[] = [];
  pieBackground = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadMetrics();
    setInterval(() => this.loadMetrics(), 30000);
  }

  loadMetrics() {
    this.loading = true;

    this.api.getMetrics().subscribe({
      next: (res: any) => {
        this.loading = false;

        this.summary = res?.summary || {};

        const charts = res?.charts || {};
        const last7 = charts.last7DaysSignups || [];
        const sales = charts.salesByProduct || [];
        const sports = charts.sportsInterests || [];

        this.signupsChartLabels = last7.map((d: any) => d.date);
        this.signupsChartData = last7.map((d: any) => d.value);

        this.salesChartLabels = sales.map((d: any) => d.label);
        this.salesChartData = sales.map((d: any) => d.value);

        this.sportsInterests = sports.map((s: any) => ({
          sport: s.sport,
          count: s.count
        }));

        this.buildPieData();
      },
      error: (err) => {
        this.loading = false;
        console.error('METRICS ERROR', err);
      }
    });
  }

  private buildPieData() {
    if (!this.sportsInterests.length) {
      this.pieBackground = '';
      return;
    }

    const total = this.sportsInterests.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) {
      this.pieBackground = '';
      return;
    }

    const colors = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948'];
    let currentAngle = 0;
    const segments: string[] = [];

    this.sportsInterests = this.sportsInterests.map((s, idx) => {
      const percentage = (s.count / total) * 100;
      const start = currentAngle;
      const end = currentAngle + percentage;
      const color = colors[idx % colors.length];

      segments.push(`${color} ${start}% ${end}%`);
      currentAngle = end;

      return { ...s, percentage: Math.round(percentage) };
    });

    this.pieBackground = `conic-gradient(${segments.join(', ')})`;
  }
}
