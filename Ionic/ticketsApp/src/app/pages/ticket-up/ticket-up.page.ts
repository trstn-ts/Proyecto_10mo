import { Component } from '@angular/core';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import axios from 'axios';

@Component({
  selector: 'app-ticket-up',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './ticket-up.page.html',
  styleUrls: ['./ticket-up.page.scss'],
})
export class TicketUpPage {
  titulo: string = '';
  descripcion: string = '';
  prioridad: string = '';
  mensaje: string = '';

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async registrarTicket() {
    if (!this.titulo || !this.descripcion || !this.prioridad) {
      this.mensaje = 'Por favor completa todos los campos.';
      return;
    }

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (!usuario || !usuario.id) {
        this.mensaje = 'No se encontró el usuario logueado.';
        return;
      }

      await axios.post('http://localhost:3000/api/tickets', {
        id_usuario: usuario.id,
        id_area: usuario.area, 
        titulo: this.titulo,
        descripcion_problema: this.descripcion,
        prioridad: this.prioridad,
      });

      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Tu ticket ha sido registrado correctamente.',
        buttons: ['OK'],
      });

      await alert.present();
      this.navCtrl.navigateRoot('/home');
    } catch (error) {
      console.error('Error al registrar ticket:', error);
      this.mensaje = 'Error al registrar el ticket.';
    }
  }
}
