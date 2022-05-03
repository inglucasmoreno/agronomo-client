import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CamposService } from 'src/app/services/campos.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-campos',
  templateUrl: './campos.component.html',
  styles: [
  ]
})
export class CamposComponent implements OnInit {

	// Permisos de usuarios login
	public permisos = { all: false };

	// Modal
	public showModalCampo = false;

	// Estado formulario
	public estadoFormulario = 'crear';

	// Campos
	public idCampo: string = '';
	public campos: any = [];
	public descripcion: string = '';
	public superficie: number;
	public color: string;

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

	constructor(private camposService: CamposService,
					private authService: AuthService,
					private alertService: AlertService,
					private dataService: DataService) { }

	ngOnInit(): void {
		this.dataService.ubicacionActual = 'Dashboard - Campos';
		this.dataService.showMenu = false;
		this.alertService.loading();
		this.listarCampos();
	}

	// Abrir modal
	abrirModal(estado: string, campo: any = null): void {
		window.scrollTo(0,0);
		this.reiniciarFormulario();
		this.descripcion = '';
		this.idCampo = '';

		if(estado === 'editar') this.getCampo(campo);
		else this.showModalCampo = true;

		this.estadoFormulario = estado;
	}

 	// Traer datos del campo
	getCampo(campo: any): void {
		this.idCampo = campo._id;
		this.alertService.loading();
		this.camposService.getCampo(campo._id).subscribe({

		next: ({campo}) => {
			this.descripcion = campo.descripcion;
			this.superficie = campo.superficie;
			this.color = campo.color;
			this.alertService.close();
			this.showModalCampo = true;
		},

		error: ({error}) => {
			this.alertService.errorApi(error.msg);
		}

	});

	}

	// Listar campos
	listarCampos(): void {
	this.camposService.listarCampos(
		this.ordenar.direccion,
		this.ordenar.columna
	)
	.subscribe({

		next: ({ campos }) => {
			this.campos = campos;
			this.showModalCampo = false;
			this.alertService.close();
		},

		error: ({error}) => {
			this.alertService.errorApi(error.message);
		}

	});
	}

 // Nuevo campo
	nuevoCampo(): void {

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

		this.camposService.nuevoCampo(data).subscribe({

			next: () => {
				this.listarCampos();
			},
			
			error: ({error}) => {
				this.alertService.errorApi(error.message);
			}

		});

		}

		// Actualizar campo
		actualizarCampo(): void {

		// Verificacion: Descripción vacia
		if(this.descripcion.trim() === ""){
			this.alertService.info('Debes colocar una descripción');
			return;
		}

		const data = {
			descripcion: this.descripcion.toLocaleUpperCase(),
			superficie: this.superficie,
			color: this.color,
			updatorUser: this.authService.usuario.userId   
		}
			
		this.alertService.loading();
		this.camposService.actualizarCampo(this.idCampo, data).subscribe({
			next: () => {
				this.listarCampos();
			},
			error: ({error}) => {
				this.alertService.errorApi(error.message);
			}
		});

	}

 // Actualizar estado Activo/Inactivo
 actualizarEstado(campo: any): void {

   const { _id, activo } = campo;

  //  if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

   this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
       .then(({isConfirmed}) => {
         if (isConfirmed) {
               
           const data = {
             activo: !activo,
             updatorUser: this.authService.usuario.userId
            };
            
           this.alertService.loading();
           this.camposService.actualizarCampo(_id, data).subscribe({
            next: () => {
              this.listarCampos();
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
   this.superficie = null;
   this.color = null;
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
   this.listarCampos();
 }

}
