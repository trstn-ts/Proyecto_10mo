import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import axios from 'axios';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  correo: string = '';
  contrasena: string = '';
  errorMsg: string = '';

  constructor(private alertCtrl: AlertController) {}

  async login() {
    this.errorMsg = '';

    try {
      const res = await axios.post('http://localhost:3000/api/login', {
        correo: this.correo,
        contrasena: this.contrasena,
      });

      const usuario = res.data.usuario;
      const alert = await this.alertCtrl.create({
        header: 'Bienvenido',
        message: `Hola ${usuario.nombre} ${usuario.apellido}`,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (err: any) {
      console.error(err);
      this.errorMsg =
        err.response?.data?.error || 'Error al iniciar sesión.';
    }
  }
}