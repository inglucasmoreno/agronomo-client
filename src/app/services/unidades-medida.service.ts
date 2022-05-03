import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UnidadesMedidaService {

  constructor(private http: HttpClient) {}

  // Unidad de medida por ID
  getUnidad(id: string): Observable<any>{
    return this.http.get(`${base_url}/unidades-medida/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
  } 

  // Listar unidades de medida
  listarUnidades( direccion : number = 1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/unidades-medida`, {
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }      
    })
  }

  // Nueva unidad de medida
  nuevaUnidad(data: any): Observable<any>{
    return this.http.post(`${base_url}/unidades-medida`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })  
  }

  // Actualizar unidad de medida
  actualizarUnidad(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/unidades-medida/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }

}
