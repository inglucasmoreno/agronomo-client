import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { UnidadesMedidaService } from 'src/app/services/unidades-medida.service';

@Component({
  selector: 'app-unidades-medida',
  templateUrl: './unidades-medida.component.html',
  styles: [
  ]
})
export class UnidadesMedidaComponent implements OnInit {
	// Permisos de usuarios login
	public permisos = { all: false };

	// Modal
	public showModalUnidad = false;

	// Estado formulario
	public estadoFormulario = 'crear';

	// Unidades de medida
	public idUnidad: string = '';
	public unidades: any = [];
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

	constructor(private unidadesMedidaService : UnidadesMedidaService,
					private authService: AuthService,
					private alertService: AlertService,
					private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Unidad de medida';
    this.dataService.showMenu = false;
    this.alertService.loading();
    this.listarUnidades();
  }

  // Abrir modal
  abrirModal(estado: string, unidad: any = null): void {
    window.scrollTo(0,0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idUnidad = '';

    if(estado === 'editar') this.getUnidad(unidad);
    else this.showModalUnidad = true;

    this.estadoFormulario = estado;
  }

  // Obtener unidad de medida
  getUnidad(unidad: any): void {
    this.idUnidad = unidad._id;
    this.alertService.loading();
    this.unidadesMedidaService.getUnidad(unidad._id).subscribe({

    next: ({unidad}) => {
      this.descripcion = unidad.descripcion;
      this.alertService.close();
      this.showModalUnidad = true;
    },

    error: ({error}) => {
      this.alertService.errorApi(error.msg);
    }

  });

  }

  // Listar unidades
  listarUnidades(): void {
  this.unidadesMedidaService.listarUnidades(
    this.ordenar.direccion,
    this.ordenar.columna
  )
  .subscribe({

      next: ({ unidades }) => {
        this.unidades = unidades;
        this.showModalUnidad = false;
        this.alertService.close();
      },

      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

   });
  }

  // Nueva unidad
  nuevaUnidad(): void {

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

    this.unidadesMedidaService.nuevaUnidad(data).subscribe({

      next: () => {
        this.listarUnidades();
      },
      
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }

    });

    }

    // Actualizar unidad
    actualizarUnidad(): void {

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
    this.unidadesMedidaService.actualizarUnidad(this.idUnidad, data).subscribe({
      next: () => {
        this.listarUnidades();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(unidad: any): void {

    const { _id, activo } = unidad;

  //  if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {
          if (isConfirmed) {
                
            const data = {
              activo: !activo,
              updatorUser: this.authService.usuario.userId
            };
            
            this.alertService.loading();
            this.unidadesMedidaService.actualizarUnidad(_id, data).subscribe({
            next: () => {
              this.listarUnidades();
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
    this.listarUnidades();
  }


}
