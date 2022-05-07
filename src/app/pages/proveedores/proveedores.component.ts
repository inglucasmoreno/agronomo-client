import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styles: [
  ]
})
export class ProveedoresComponent implements OnInit {

 // Permisos de usuarios login
 public permisos = { all: false };

 // Modal
 public showModalProveedor = false;

 // Estado formulario
 public estadoFormulario = 'crear';

 // Producto
 public idProveedor: string = '';

 // Proveedores
 public proveedores: any[];

 // Paginacion
 public paginaActual: number = 1;
 public cantidadItems: number = 10;

 // Filtrado
 public filtro = {
   activo: 'true',
   parametro: ''
 }

 // Ordenar
 public ordenar = {
   direccion: 1,  // Asc (1) | Desc (-1)
   columna: 'descripcion'
 }
        
 public dataProveedor = {
   descripcion: '',
   tipo_identificacion: 'DNI',
   identificacion: '',
   telefono: '',
   direccion: ''    
 }

  constructor(private proveedoresService : ProveedoresService,
             private authService: AuthService,
             private alertService: AlertService,
             private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Proveedores';
    this.dataService.showMenu = false;

    this.alertService.loading();
    this.listarProveedores();

  }

  // Abrir modal
  abrirModal(estado: string, proveedor: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.idProveedor = '';

    if(estado === 'editar') this.getProveedor(proveedor);
    else this.showModalProveedor = true;

    this.estadoFormulario = estado;
  }

  // Obtener proveedor
  getProveedor(proveedor: any): void {
    this.idProveedor = proveedor._id;
    this.alertService.loading();
    this.proveedoresService.getProveedor(proveedor._id).subscribe({

    next: ({proveedor}) => {

    const { descripcion, tipo_identificacion, identificacion, telefono, direccion } = proveedor;

    this.dataProveedor = {
      descripcion,
      tipo_identificacion,
      identificacion,
      telefono,
      direccion    
    }

      this.alertService.close();
      this.showModalProveedor = true;
    },

    error: ({error}) => {
      this.alertService.errorApi(error.msg);
    }

  });

  }

  // Listar proveedores
  listarProveedores(): void {
  this.proveedoresService.listarProveedores(
    this.ordenar.direccion,
    this.ordenar.columna
  )
  .subscribe({

    next: ({ proveedores }) => {
        this.proveedores = proveedores;
        this.showModalProveedor = false;
        this.alertService.close();
      },

      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

    });
  }

  // Verificacion de datos
  verificacionDatos(): boolean { 
    const verificacion = this.dataProveedor.descripcion.trim() === ""
    return verificacion;
  }

  // Generacion de data
  generandoData(): any {
    const data: any = this.dataProveedor;
    data.creatorUser = this.authService.usuario.userId;
    data.updatorUser = this.authService.usuario.userId;
    return data;    
  }

  // Nuevo proveedor
  nuevoProveedor(): void {
    
    if(this.verificacionDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.alertService.loading();

    const data = this.generandoData();

    this.proveedoresService.nuevoProveedor(data).subscribe({

      next: () => {
        this.listarProveedores();
      },
      
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

    });

  }

  // Actualizar proveedor
  actualizarProveedor(): void {

    if(this.verificacionDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    const data = this.generandoData();

    this.alertService.loading();
    this.proveedoresService.actualizarProveedor(this.idProveedor, data).subscribe({
      next: () => {
        this.listarProveedores();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(producto: any): void {

  const { _id, activo } = producto;

  this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({isConfirmed}) => {
        if (isConfirmed) {
              
          const data = {
            activo: !activo,
            updatorUser: this.authService.usuario.userId
          };
          
          this.alertService.loading();
          this.proveedoresService.actualizarProveedor(_id, data).subscribe({
          next: () => {
            this.listarProveedores();
          },
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
          });
        }
      });
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
  this.dataProveedor = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    direccion: ''    
  }
  }

 // Filtrar Activo/Inactivo
 filtrarActivos(activo: any): void{
   this.paginaActual = 1;
   this.filtro.activo = activo;
 }

 // Filtrar por Parametro
 filtrarParametro(parametro: string): void{
   this.paginaActual = 1;
   this.filtro.parametro = parametro;
 }

 // Ordenar por columna
 ordenarPorColumna(columna: string){
   this.ordenar.columna = columna;
   this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
   this.alertService.loading();
   this.listarProveedores();
 }

}
