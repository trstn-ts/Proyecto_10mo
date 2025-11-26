import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule, NavController, MenuController, AlertController } from '@ionic/angular';
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
  rol: number = 0; // <-- agregado para controlar botones

  constructor(
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController
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

    this.authService.cargarUsuario();
    const user = this.authService.getUsuario();

    if (!user) {
      this.error = 'No hay un usuario logueado';
      return;
    }

    const idUsuario = user.id;
    const rolTexto = this.authService.getRol();

    if (rolTexto === 'usuario') this.rol = 3;
    else if (rolTexto === 'tecnico') this.rol = 2;
    else if (rolTexto === 'admin') this.rol = 1;

    console.log('ROL TEXTO:', rolTexto, 'ROL NUMÉRICO:', this.rol);

    let url = '';
    if (this.rol === 3) {
      url = `http://localhost:3000/api/tickets/usuario/${idUsuario}`;
    } else if (this.rol === 2 || this.rol === 1) {
      url = `http://localhost:3000/api/tickets/tecnico/${idUsuario}`;
    } else if (this.rol === 1) { // administrador
      url = `http://localhost:3000/api/tickets/admin`;
    }


    try {
      const response = await axios.get(url);
      this.tickets = response.data;

      if (this.tickets.length > 0) {
        this.ultimoTicket = this.tickets[0];
      }

      console.log('Tickets recibidos:', this.tickets);
    } catch (err) {
      console.error('Error cargando tickets:', err);
      this.error = 'Error al cargar los tickets';
    } finally {
      this.loading = false;
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

  // =============================
  // CERRAR TICKET
  // =============================
  async confirmarCerrarTicket(idTicket: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Está seguro que desea cerrar este ticket?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: async () => {
            await this.cerrarTicket(idTicket);
          },
        },
      ],
    });

    await alert.present();
  }

  async cerrarTicket(idTicket: number) {
    try {
      await axios.put(`http://localhost:3000/api/tickets/cerrar/${idTicket}`);
      await this.cargarTickets(); // recargar lista
    } catch (err) {
      console.error('Error cerrando ticket:', err);
    }
  }
}
