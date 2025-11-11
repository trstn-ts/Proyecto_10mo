import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import axios from 'axios';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  providers: [AlertController],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  usuario: string = '';
  contrasena: string = '';
  errorMsg: string = '';

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async login() {
    this.errorMsg = '';

    try {
      const res = await axios.post('http://localhost:3000/api/login', {
        usuario: this.usuario,
        contrasena: this.contrasena,
      });

      const user = res.data.usuario;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('idUsuario', user.id);
      localStorage.setItem('idArea', user.area);

      const alert = await this.alertCtrl.create({
        header: 'Bienvenido',
        message: `Hola ${user.nombre} ${user.apellido}`,
        buttons: ['OK'],
      });
      await alert.present();

      this.navCtrl.navigateRoot('/home');
    } catch (err: any) {
      console.error('Error en login:', err);
      this.errorMsg = err.response?.data?.error || 'Error al iniciar sesión. Verifique credenciales y conexión.';
    }
  }
}