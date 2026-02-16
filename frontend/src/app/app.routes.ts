import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { ProjectsComponent } from './pages/projects/projects';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'projects', component: ProjectsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
