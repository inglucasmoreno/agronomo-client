import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class LotesService {

  constructor(private http: HttpClient) {}

  // Lotes por ID
  getLote(id: string): Observable<any>{
    return this.http.get(`${base_url}/lotes/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })
  } 

  // Listar lotes por campo
  listarLotesPorCampo( idCampo: string,  direccion : number = 1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/lotes/campo/${idCampo}`, {
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }      
    })
  }

  // Listar lotes
  listarLotes( direccion : number = 1, columna: string = 'descripcion' ): Observable<any>{
    return this.http.get(`${base_url}/lotes`, {
      params: {
        direccion: String(direccion),
        columna              
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }      
    })
  }

  // Nuevo lote
  nuevoLote(data: any): Observable<any>{
    return this.http.post(`${base_url}/lotes`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })  
  }

  // Actualizar lote
  actualizarLote(id: string, data: any): Observable<any>{
    return this.http.put(`${base_url}/lotes/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }  
    })
  }
  
}
