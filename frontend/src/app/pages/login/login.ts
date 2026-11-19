import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

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
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef  // Inyectamos ChangeDetectorRef
  ) {}

  togglePass() {
    this.showPass = !this.showPass;
  }

  login() {
    this.successMsg = '';
    this.errorMsg = '';
    this.loading = true;
    this.cdr.detectChanges(); // Forzar actualización inmediata

    this.http.post<{ token: string }>(
      'http://localhost:3000/api/auth/login',
      { email: this.email, password: this.password }
    ).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); // Asegurar que loading se actualiza en la vista
      })
    ).subscribe({
      next: (res) => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
          this.successMsg = '✅ ¡Login exitoso! Redirigiendo...';
          this.cdr.detectChanges(); // Mostrar mensaje de éxito

          setTimeout(() => {
            this.router.navigate(['/projects']);
          }, 1500);
        } else {
          this.errorMsg = '❌ Respuesta inválida del servidor';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMsg = err.error?.message || '❌ Error al iniciar sesión. Verifica tus credenciales.';
        this.cdr.detectChanges(); // Mostrar mensaje de error
      }
    });
  }
}