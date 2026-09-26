import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PrototypeComponent } from './features/prototype/prototype.component';
import { authGuard } from './core/guards/auth.guard';
import { ProjectsComponent } from './features/projects/projects.component';
import { ProjectDetailComponent } from './features/projects/project-detail.component';

export const routes: Routes = [
  {
    path: 'projects', component: ProjectsComponent, canActivate: [authGuard], title: 'Mes projets | BOB'
  },
  {
    path: 'projects/:id', component: ProjectDetailComponent, canActivate: [authGuard], title: 'Projet | BOB'
  },
  {
    path: '',
    component: HomeComponent,
    title: 'BOB — Transformez vos idées en diagrammes UML'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion | BOB'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Créer un compte | BOB'
  },
  {
    path: 'prototype',
    component: PrototypeComponent,
    canActivate: [authGuard],
    title: 'Prototype UML | BOB'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
