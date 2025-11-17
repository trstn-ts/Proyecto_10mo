import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;

  constructor() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    } else {
      this.user = null;
    }
  }

  getUsuario() {
    if (!this.user) this.cargarUsuario();
    return this.user;
  }

  getRol(): string | null {
    if (!this.user) this.cargarUsuario();
    if (!this.user?.rol) return null;

    switch (this.user.rol) {
      case 2:
        return 'tecnico';
      case 3:
        return 'usuario';
      case 1:
        return 'admin';
      default:
        return null;
    }
  }

  esTecnico(): boolean {
    return this.getRol() === 'tecnico';
  }

  esUsuario(): boolean {
    return this.getRol() === 'usuario';
  }

  esAdmin(): boolean {
    return this.getRol() === 'admin';
  }

  cerrarSesion() {
    localStorage.clear();
    this.user = null;
  }
}
