import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { divIcon, latLng, LatLng, map, Map, Marker, marker, Polygon, polygon, Polyline, polyline, tileLayer } from 'leaflet';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CamposService } from 'src/app/services/campos.service';
import { LotesService } from 'src/app/services/lotes.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  public initialPoint = true;
  public coordenadas: any = [];
  public showModal = false;

  public campos: any[] = [];
  public lotes: any[] = [];

  // Herramientas de creacion
  public showHerramientas = false;
  public flagCreacion = false;
  public showGeolocalizar = false;

  // Mapa - Leaflet
  public map: Map;

  // Variables para creacion de objeto en mapa
  public dataElemento = {
    color: '#D81818', 
    tipo: 'Lote',
    descripcion: '',
    superficie: null,
    campo: ''
  }
  public poligonoCreando: Polygon;
  public lineasCreando: Polyline[] = [];
  public marcadoresCreando: Marker[] = [];

  

  constructor(private dataService: DataService,
              private alertService: AlertService,
              private authService: AuthService,
              private lotesService: LotesService,
              private camposService: CamposService) {}

  ngOnInit(): void { 
    this.dataService.ubicacionActual = 'Dashboard - Mapa';
    this.dataService.showMenu = false;
    this.listarDatos();
  }

  ngAfterViewInit(): void {
    
    this.map = new Map('map').setView([-33.29258,-66.33947], 15);  
    
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Evento -> Click en mapa
    this.map.on('click', (e: { latlng: LatLng }) => {
      
      if(this.flagCreacion){
        const tmp: any = [e.latlng.lat, e.latlng.lng];
        this.coordenadas.push(tmp);
  
        const customDiv = divIcon({className: 'border border-red-700 p-1 bg-red-500 rounded-full'})
        
        // Marcador
        const markerItem = marker(tmp, { icon: customDiv, draggable: true },).addTo(this.map);
        this.marcadoresCreando.push(markerItem);
        
        // Polilineas  
        const lineItem = polyline([this.coordenadas], {color: 'red'}).addTo(this.map);
        this.lineasCreando.push(lineItem);
  
        if(this.initialPoint !== false){ // Punto inicial
          markerItem.on('click', (e: any) => {
            this.coordenadas.push([e.latlng.lat, e.latlng.lng]);
            this.poligonoCreando = polygon([this.coordenadas], {color: 'red'}).addTo(this.map);
            this.initialPoint = true;
            this.showModal = true;
          });
        }
        
        // markerItem.on('contextmenu', () => this.map.removeLayer(markerItem));
        this.initialPoint = false;
      
      }

    });

    
    // const markerItem = marker([-33.29258,-66.33947], {draggable: true}).addTo(map);

    // markerItem.on('click', () => console.log('click'));
    
    // markerItem.on('dbclick', () => console.log('Doble click'));
    
    // markerItem.on('mousedown', () => console.log('Haciendo click - mousedown'));
    
    // markerItem.on('mouseup', () => {
    //   console.log('Dejando de hacer click - mouseup')
    //   console.log(markerItem.getLatLng().lat, markerItem.getLatLng().lng);
    // }
      
    // );
    
    // markerItem.on('mouseover', () => console.log('mouseover - Estamos sobre el marcador'));
    
    // markerItem.on('mouseout', () => console.log('mouseout - No estamos sobre el marcador'));
    
    // markerItem.on('contextmenu', () => map.removeLayer(markerItem));

    // markerItem.on('move', () => console.log('moviendo'));




    // map.fitBounds([
    //   [ markerItem.getLatLng().lat, markerItem.getLatLng().lng ]
    // ]);

  }

  // -- CARGA INICIA --
  
  listarDatos(): void {
    
    // Campos
    this.alertService.loading();
    this.camposService.listarCampos(1, 'descripcion').subscribe({
      next: ({campos}) => {
        this.campos = campos.filter(campo => (campo.activo));
        this.trazarCampos()
        
        // Listar lotes
        this.lotesService.listarLotes(1, 'descripcion').subscribe({
          next: ({lotes}) => {
            this.lotes = lotes.filter(lote => (lote.activo));
            this.trazarLotes();
            this.alertService.close();
          },
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
        })
        
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });  
  
  }

  // Trazar campos
  trazarCampos(): void {
    this.campos.map( campo => {
      polyline([campo.coordenadas], {color: campo.color}).addTo(this.map);      
    })
  }

  // Trazar lotes
  trazarLotes(): void {
    this.lotes.map( lote => {
      polygon([lote.coordenadas], {color: lote.color}).addTo(this.map);      
    })
  }

  // -- ACCIONES --

  // Cancelar creacion
  reiniciarCreacion(): void {
   
    // Se eliminan los elementos de creacion
    this.marcadoresCreando.map( marcador => ( this.map.removeLayer(marcador) )); // Marcadores
    this.lineasCreando.map( lineas => ( this.map.removeLayer(lineas) ));         // Polilineas
    this.map.removeLayer(this.poligonoCreando);                                  // Poligono  

    this.coordenadas = [];

    this.dataElemento = {
      // color: '#282DC3',
      color: '#D81818', 
      tipo: 'Lote',
      descripcion: '',
      superficie: null,
      campo: ''
    }
   
    this.initialPoint = true;
    this.showModal = false;

  }

  cambiarColor(): void {
      this.dataElemento.color = this.dataElemento.tipo === 'Lote' ? '#D81818' : '#282DC3';
  }

  // Creacion de nuevo elemento en mapa
  crearElemento(): void {

    const { tipo } = this.dataElemento;
    
    if(tipo === 'Campo') this.crearCampo();    
    else if(tipo === 'Lote') this.crearLote();
    
  }
  
  // Creando nuevo campo
  crearCampo(): void {
    
    const {descripcion, color, campo, superficie} = this.dataElemento;

    const verificacion = descripcion.trim() === '' || superficie < 0 || !superficie;

    // Verificacion de datos
    if(verificacion) return this.alertService.info('Completar los campos obligatorios');

    const dataCampo = {
      descripcion,
      color,
      superficie,
      coordenadas: this.coordenadas,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };

    this.alertService.loading();
    this.camposService.nuevoCampo(dataCampo).subscribe({
      next: () => {
        this.reiniciarCreacion();
        this.listarDatos();
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })

  }

  // Creando nuevo lote
  crearLote(): void {

    const {descripcion, color, campo, superficie} = this.dataElemento;

    const verificacion = descripcion.trim() === '' || superficie < 0 || !superficie || campo.trim() === ''

    // Verificacion de datos
    if(verificacion) return this.alertService.info('Completar los campos obligatorios');

    const dataLote = {
      descripcion,
      color,
      superficie,
      campo,
      coordenadas: this.coordenadas,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };

    this.alertService.loading();
    this.lotesService.nuevoLote(dataLote).subscribe({
      next: () => {
        this.reiniciarCreacion();
        this.listarDatos();
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })

  }

}
