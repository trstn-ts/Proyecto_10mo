import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule, NavController, MenuController } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import axios from 'axios';
import { AuthService } from '../../services/auth';

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
  loading = true;
  error: string | null = null;

  constructor(
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.authService.cargarUsuario();

    console.log('Rol detectado:', this.authService.getRol());

    await this.cargarTickets();

    this.cdr.detectChanges();
  }

  async ionViewWillEnter() {
    this.authService.cargarUsuario();
    this.cdr.detectChanges();
  }

  async cargarTickets() {
    this.loading = true;
    this.error = null;

    const idUsuarioStr = localStorage.getItem('idUsuario');
    const idUsuario = idUsuarioStr ? parseInt(idUsuarioStr, 10) : null;

    if (!idUsuario) {
      this.error = 'Error: No hay un usuario logueado. Redirigiendo a Login.';
      this.loading = false;
      setTimeout(() => this.navCtrl.navigateRoot('/login'), 2000);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/movil/tickets/usuario/${idUsuario}`
      );

      this.tickets = response.data;
      if (this.tickets.length > 0) {
        this.ultimoTicket = this.tickets[0];
      }
    } catch (err) {
      console.error('Error cargando tickets:', err);
      this.error =
        'Error al cargar los tickets. Verifica que el backend esté funcionando.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openMenu() {
    this.menuCtrl.open('menuPrincipal');
  }

  goToTicketUp() {
    this.navCtrl.navigateForward('/ticket-up');
  }

  goToMisTickets() {
    this.navCtrl.navigateForward('/mis-tickets');
  }

  goToPerfil() {
    this.navCtrl.navigateForward('/perfil');
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.navCtrl.navigateRoot('/');
  }
}
