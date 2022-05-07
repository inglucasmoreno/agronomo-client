import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private http: HttpClient) {}

  // Proveedores por ID
  getProveedor(id: string): Observable<any>{
    return this.http.get(`${base_url}/proveedores/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
  } 

  // Listar proveedores
  listarProveedores( direccion : number = 1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/proveedores`, {
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }      
    })
  }

  // Nuevo proveedor
  nuevoProveedor(data: any): Observable<any>{
    return this.http.post(`${base_url}/proveedores`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })  
  }

  // Actualizar proveedor
  actualizarProveedor(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/proveedores/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }

}
