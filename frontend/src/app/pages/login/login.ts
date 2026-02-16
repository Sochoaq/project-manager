import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  password = '';
  showPass = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  togglePass() {
    this.showPass = !this.showPass;
  }

  login() {
    this.http.post<{ token: string }>(
      'http://localhost:3000/api/auth/login',
      {
        email: this.email,
        password: this.password
      }
    ).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/projects']);
      },
      error: () => {
        alert('Login incorrecto');
      }
    });
  }
}
