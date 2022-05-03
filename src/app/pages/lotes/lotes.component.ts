import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CamposService } from 'src/app/services/campos.service';
import { DataService } from 'src/app/services/data.service';
import { LotesService } from 'src/app/services/lotes.service';

@Component({
  selector: 'app-lotes',
  templateUrl: './lotes.component.html',
  styles: [
  ]
})
export class LotesComponent implements OnInit {

  // Campo
  public campos: any[];
  public idCampo: string;
  
  // Lotes
  public lotes: any;
  public idLote: string;
  public campo: string = '';
	public descripcion: string = '';
	public superficie: number;
	public color: string;

  // Permisos de usuarios login
	public permisos = { all: false };

	// Modal
	public showModalLote = false;

	// Estado formulario
	public estadoFormulario = 'crear';

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

  constructor(private dataService: DataService,
              private alertService: AlertService,
              private authService: AuthService,
              private lotesService: LotesService,
              private camposService: CamposService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Lotes';
    this.alertService.loading();
    this.listarCampos();
    this.activatedRoute.params.subscribe({
      next: ({ campo }) => {
        this.idCampo = campo;
        this.listarLotes();
      }
    });
  }

  // Listar campos
  listarCampos(): void {
    this.camposService.listarCampos(1, 'descripcion').subscribe({
      next: ({ campos }) => {
        this.campos = campos.filter( campo => (campo.activo) );
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Listar lotes
  listarLotes(): void {
    this.lotesService.listarLotesPorCampo(this.idCampo, 1, 'descripcion').subscribe({
      next: ({ lotes }) => {
        this.lotes = lotes;
        this.showModalLote = false;
        this.alertService.close()
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

	// Abrir modal
	abrirModal(estado: string, lote: any = null): void {
    window.scrollTo(0,0);
		this.reiniciarFormulario();
		this.descripcion = '';
		this.idLote = '';

		if(estado === 'editar') this.getLote(lote);
		else this.showModalLote = true;

		this.estadoFormulario = estado;
	}

 	// Traer datos del lote
	getLote(lote: any): void {
		this.idLote = lote._id;
		this.alertService.loading();
		this.lotesService.getLote(lote._id).subscribe({

		next: ({lote}) => {
			this.descripcion = lote.descripcion;
			this.superficie = lote.superficie;
			this.campo = lote.campo;
			this.color = lote.color;
			this.alertService.close();
			this.showModalLote = true;
		},

		error: ({error}) => {
			this.alertService.errorApi(error.msg);
		}

	});

	}

	// Actualizar lote
	actualizarLote(): void {

		// Verificacion de datos
    const verificacion = this.descripcion.trim() === "" || this.superficie < 0 || !this.superficie || this.campo.trim() === ''

		if(verificacion){
			this.alertService.info('Debes completar los campos obligatorios');
			return;
		}

		const data = {
			descripcion: this.descripcion.toLocaleUpperCase(),
			superficie: this.superficie,
			campo: this.campo,
			color: this.color,
			updatorUser: this.authService.usuario.userId   
		}
			
		this.alertService.loading();
		this.lotesService.actualizarLote(this.idLote, data).subscribe({
			next: () => {
				this.listarLotes();
			},
			error: ({error}) => {
				this.alertService.errorApi(error.message);
			}
		});

	}

 // Actualizar estado Activo/Inactivo
 actualizarEstado(lote: any): void {

   const { _id, activo } = lote;

  //  if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

   this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
       .then(({isConfirmed}) => {
         if (isConfirmed) {
               
           const data = {
             activo: !activo,
             updatorUser: this.authService.usuario.userId
            };
            
           this.alertService.loading();
           this.lotesService.actualizarLote(_id, data).subscribe({
            next: () => {
              this.listarLotes();
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
   this.listarLotes();
 }

}
