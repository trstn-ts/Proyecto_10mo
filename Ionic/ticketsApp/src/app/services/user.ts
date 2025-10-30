import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; 

  async getUsers() {
    const res = await axios.get(this.apiUrl);
    return res.data;
  }
}

