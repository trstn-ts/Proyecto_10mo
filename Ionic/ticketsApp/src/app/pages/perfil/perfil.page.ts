import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';   // <--- IMPORTANTE

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule ],  // <--- NECESARIO PARA ngModel
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  usuario: any = null;

  contrasenaActual = "";
  nuevaContrasena = "";
  confirmarContrasena = "";

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.usuario = JSON.parse(userData);
    } else {
      this.navCtrl.navigateRoot('/login');
    }
  }

  guardarCambios() {

    if (this.nuevaContrasena && this.nuevaContrasena !== this.confirmarContrasena) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const body = {
      id: this.usuario.id,
      nombre: this.usuario.nombre,
      correo: this.usuario.correo,
      usuario: this.usuario.usuario,
      contrasenaActual: this.contrasenaActual,
      nuevaContrasena: this.nuevaContrasena,
    };

    this.http.put("http://localhost:3000/api/usuario/actualizar", body)
      .subscribe((resp: any) => {
        
        // actualizar datos en localStorage
        localStorage.setItem('user', JSON.stringify(this.usuario));

        alert("Datos actualizados correctamente");

        this.contrasenaActual = "";
        this.nuevaContrasena = "";
        this.confirmarContrasena = "";
      }, err => {
        alert(err.error?.error || "Error al actualizar");
      });
  }

  cerrarSesion() {
    localStorage.removeItem("user");
    this.navCtrl.navigateRoot("/login");
  }
}
