import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
// --- Importación estándar de axios ---
import axios from 'axios';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, DatePipe],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  tickets: any[] = [];
  ultimoTicket: any = null;
  loading: boolean = true;
  error: string | null = null;
  
  constructor(private navCtrl: NavController) {}

  async ngOnInit() {
    this.loading = true;
    this.error = null;

    const idUsuarioStr = localStorage.getItem('idUsuario');
    const idUsuario = idUsuarioStr ? parseInt(idUsuarioStr, 10) : null;

    if (!idUsuario) {
      this.error = ' Error: No hay un usuario logueado. Redirigiendo a Login.';
      this.loading = false;
      setTimeout(() => this.navCtrl.navigateRoot('/login'), 2000);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/tickets/usuario/${idUsuario}`);

      this.tickets = response.data;

      if (this.tickets.length > 0) {
        this.ultimoTicket = this.tickets[0];
      }
    } catch (err) {
      console.error(' Error cargando tickets:', err);
      this.error = 'Error al cargar los tickets. Verifica que el backend esté funcionando.';
    } finally {
      this.loading = false;
    }
  }

  goToTicketUp() {
    this.navCtrl.navigateForward('/ticket-up');
  }
}