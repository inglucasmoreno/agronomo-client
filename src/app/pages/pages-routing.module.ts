import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { PermisosGuard } from '../guards/permisos.guard';

// Componentes
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
import { PerfilComponent } from './perfil/perfil.component';
import { CamposComponent } from './campos/campos.component';
import { LotesComponent } from './lotes/lotes.component';
import { UnidadesMedidaComponent } from './unidades-medida/unidades-medida.component';
import { ProductosComponent } from './productos/productos.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [ AuthGuard ],    // Guard - Se verifica si el usuario esta logueado
        children: [
            
            // Home
            { path: 'home', component: HomeComponent },

            // Perfil de usuarios
            { path: 'perfil', component: PerfilComponent },

            // Usuarios
            { path: 'usuarios', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: UsuariosComponent },
            { path: 'usuarios/nuevo', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarPasswordComponent },
            
            // Campos
            { path: 'campos', data: { permisos: 'CAMPOS_NAV' }, canActivate: [PermisosGuard], component: CamposComponent },

            // Lotes
            { path: 'campos/lotes/:campo', data: { permisos: 'LOTES_NAV' }, canActivate: [PermisosGuard], component: LotesComponent },

            // Productos
            { path: 'productos', data: { permisos: 'PRODUCTOS_NAV' }, canActivate: [PermisosGuard], component: ProductosComponent },
            
            // Unidades de medida
            { path: 'unidades_medida', data: { permisos: 'UNIDADES_MEDIDA_NAV' }, canActivate: [PermisosGuard], component: UnidadesMedidaComponent },
            
            // Proveedores
            { path: 'proveedores', data: { permisos: 'PROVEEDORES_NAV' }, canActivate: [PermisosGuard], component: ProveedoresComponent },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}