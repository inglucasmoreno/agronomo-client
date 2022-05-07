import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaPipe } from './fecha.pipe';
import { RolPipe } from './rol.pipe';
import { MonedaPipe } from './moneda.pipe';
import { FiltroUsuariosPipe } from './filtro-usuarios.pipe';
import { FiltroCamposPipe } from './filtro-campos.pipe';
import { FiltroUnidadesPipe } from './filtro-unidades.pipe';
import { FiltroProductosPipe } from './filtro-productos.pipe';
import { ProductosPipe } from './productos.pipe';
import { FiltroProveedoresPipe } from './filtro-proveedores.pipe';

@NgModule({
  declarations: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroCamposPipe,
    FiltroUnidadesPipe,
    FiltroProductosPipe,
    ProductosPipe,
    FiltroProveedoresPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroCamposPipe,
    FiltroUnidadesPipe,
    FiltroProductosPipe,
    ProductosPipe,
    FiltroProveedoresPipe,
  ]
})
export class PipesModule { }
