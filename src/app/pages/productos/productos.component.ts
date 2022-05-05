import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: [
  ]
})
export class ProductosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalProducto = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Producto
  public idProducto: string = '';
  public productos: any = [];
  public descripcion: string = '';

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

  constructor(private productosService : ProductosService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Productos';
    this.dataService.showMenu = false;
    this.alertService.loading();
    this.listarProductos();
  }

  // Abrir modal
  abrirModal(estado: string, producto: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idProducto = '';

    if(estado === 'editar') this.getProducto(producto);
    else this.showModalProducto = true;

    this.estadoFormulario = estado;
  }

  // Obtener producto
  getProducto(producto: any): void {
    this.idProducto = producto._id;
    this.alertService.loading();
    this.productosService.getProducto(producto._id).subscribe({

    next: ({producto}) => {
      this.descripcion = producto.descripcion;
      this.alertService.close();
      this.showModalProducto = true;
    },

    error: ({error}) => {
      this.alertService.errorApi(error.msg);
    }

  });

  }

  // Listar productos
  listarProductos(): void {
  this.productosService.listarProductos(
    this.ordenar.direccion,
    this.ordenar.columna
  )
  .subscribe({

      next: ({ productos }) => {
        this.productos = productos;
        this.showModalProducto = false;
        this.alertService.close();
      },

      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

  });
  }

  // Nuevo producto
  nuevoProducto(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    this.productosService.nuevoProducto(data).subscribe({

      next: () => {
        this.listarProductos();
      },
      
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

    });

    }

    // Actualizar producto
    actualizarProducto(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    const data = {
      descripcion: this.descripcion.toLocaleUpperCase(),
      updatorUser: this.authService.usuario.userId   
    }
      
    this.alertService.loading();
    this.productosService.actualizarProducto(this.idProducto, data).subscribe({
      next: () => {
        this.listarProductos();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(producto: any): void {

    const { _id, activo } = producto;

  //  if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {
          if (isConfirmed) {
                
            const data = {
              activo: !activo,
              updatorUser: this.authService.usuario.userId
            };
            
            this.alertService.loading();
            this.productosService.actualizarProducto(_id, data).subscribe({
            next: () => {
              this.listarProductos();
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
    this.descripcion = '';
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
    this.listarProductos();
  }

}
