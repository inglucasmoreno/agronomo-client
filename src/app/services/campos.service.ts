import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CamposService {

  constructor(private http: HttpClient) {}

  // Campo por ID
  getCampo(id: string): Observable<any>{
    return this.http.get(`${base_url}/campos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
  } 

  // Listar campos
  listarCampos( direccion : number = 1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/campos`, {
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }      
    })
  }

  // Nuevo campo
  nuevoCampo(data: any): Observable<any>{
    return this.http.post(`${base_url}/campos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })  
  }

  // Actualizar campo
  actualizarCampo(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/campos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }

}
