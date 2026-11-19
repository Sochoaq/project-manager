import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioStats {
  total: number;
  byStatus: {
    PLANNED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
  averageProgress: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
})
export class ProjectsComponent implements OnInit {
  private readonly apiBase = 'http://localhost:3000/api/projects';

  projects: ProjectItem[] = [];
  stats: PortfolioStats = {
    total: 0,
    byStatus: { PLANNED: 0, IN_PROGRESS: 0, COMPLETED: 0 },
    averageProgress: 0,
  };

  activeFilter: 'ALL' | ProjectStatus = 'ALL';
  loading = false;
  submitting = false;
  errorMsg = '';

  newProject: {
    title: string;
    description: string;
    priority: ProjectPriority;
    targetDate: string;
  } = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    targetDate: '',
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return;
    }
    this.loadDashboard();
  }

  private authHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMsg = '';
    const headers = this.authHeaders();
    const query = this.activeFilter === 'ALL' ? '' : `?status=${this.activeFilter}`;

    this.http.get<ProjectItem[]>(`${this.apiBase}${query}`, { headers }).subscribe({
      next: (items) => {
        this.projects = items || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        this.errorMsg = err?.error?.message || 'Unable to load projects.';
        this.cdr.detectChanges();
      },
    });

    this.http.get<PortfolioStats>(`${this.apiBase}/stats`, { headers }).subscribe({
      next: (summary) => {
        if (summary) {
          this.stats = summary;
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });
  }

  setFilter(filter: 'ALL' | ProjectStatus): void {
    this.activeFilter = filter;
    this.loadDashboard();
  }

  createProject(): void {
    const title = this.newProject.title.trim();
    const description = this.newProject.description.trim();
    if (!title || !description) {
      this.errorMsg = 'Title and description are required.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    const payload = {
      title,
      description,
      priority: this.newProject.priority,
      targetDate: this.newProject.targetDate || null,
    };

    this.http.post<ProjectItem>(this.apiBase, payload, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.newProject = { title: '', description: '', priority: 'MEDIUM', targetDate: '' };
        this.submitting = false;
        this.loadDashboard();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err?.error?.message || 'Failed to create project.';
        this.cdr.detectChanges();
      },
    });
  }

  updateStatus(project: ProjectItem, status: ProjectStatus): void {
    const progress = status === 'COMPLETED' ? 100 : status === 'PLANNED' ? 0 : Math.max(project.progress, 25);
    this.http
      .patch<ProjectItem>(
        `${this.apiBase}/${project.id}`,
        { status, progress },
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: () => this.loadDashboard(),
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to update project status.';
          this.cdr.detectChanges();
        },
      });
  }

  updateProgress(project: ProjectItem, progress: number): void {
    const bounded = Math.max(0, Math.min(100, Math.round(Number(progress))));
    const status: ProjectStatus =
      bounded === 100 ? 'COMPLETED' : bounded > 0 ? 'IN_PROGRESS' : 'PLANNED';
    this.http
      .patch<ProjectItem>(
        `${this.apiBase}/${project.id}`,
        { progress: bounded, status },
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: () => this.loadDashboard(),
        error: (err) => {
          this.errorMsg = err?.error?.message || 'Failed to update progress.';
          this.cdr.detectChanges();
        },
      });
  }

  deleteProject(id: number): void {
    this.http.delete(`${this.apiBase}/${id}`, { headers: this.authHeaders() }).subscribe({
      next: () => this.loadDashboard(),
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to delete project.';
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}
