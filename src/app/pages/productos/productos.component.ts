import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { UnidadesMedidaService } from 'src/app/services/unidades-medida.service';

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

  // Unidades de medida
  public unidades: any[];

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
         
  public dataProducto = {
    codigo: '',
    descripcion: '',
    unidad: '',
    stock_minimo: 'false',
    cantidad_minima: 0    
  }

  constructor(private productosService : ProductosService,
              private unidadesMedida: UnidadesMedidaService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Productos';
    this.dataService.showMenu = false;

    this.alertService.loading();
    this.listarUnidades();

  }

  // Abrir modal
  abrirModal(estado: string, producto: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
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

      const { codigo, descripcion, unidad, stock_minimo, cantidad_minima } = producto

      this.dataProducto = {
        codigo,
        descripcion,
        unidad: unidad._id,
        stock_minimo: stock_minimo ? 'true' : 'false',
        cantidad_minima
      }

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

  // Listar unidades de medida
  listarUnidades(): void {
    this.unidadesMedida.listarUnidades(1, 'descripcion').subscribe({
      next: ({unidades}) => {
        this.unidades = unidades.filter(unidad => (unidad.activo));
        console.log(this.unidades);
        this.listarProductos();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Verificacion de datos
  verificacionDatos(): boolean { 
    const verificacion = this.dataProducto.descripcion.trim() === "" ||
    this.dataProducto.unidad.trim() === "" ||
    (this.dataProducto.stock_minimo === "true" && (this.dataProducto.cantidad_minima < 0 || this.dataProducto.cantidad_minima === null))
    return verificacion;
  }

  // Generacion de data
  generandoData(): any {
    const data: any = this.dataProducto;
    this.dataProducto.stock_minimo === 'false' ? data.cantidad_minima = 0 : null;
    data.creatorUser = this.authService.usuario.userId;
    data.updatorUser = this.authService.usuario.userId;
    return data;    
  }

  // Nuevo producto
  nuevoProducto(): void {
    
    if(this.verificacionDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.alertService.loading();

    const data = this.generandoData();

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

    if(this.verificacionDatos()){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    const data = this.generandoData();

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
    this.dataProducto = {
      codigo: '',
      descripcion: '',
      unidad: '',
      stock_minimo: 'false',
      cantidad_minima: 0    
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
    this.listarProductos();
  }

}
