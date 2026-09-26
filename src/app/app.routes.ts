import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PrototypeComponent } from './features/prototype/prototype.component';
import { authGuard } from './core/guards/auth.guard';
import { ProjectsComponent } from './features/projects/projects.component';
import { ProjectDetailComponent } from './features/projects/project-detail.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { WorkspaceLayoutComponent } from './layouts/workspace-layout/workspace-layout.component';
import { ComingSoonComponent } from './features/coming-soon/coming-soon.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ProfileSettingsComponent } from './features/settings/profile-settings.component';
import { SecuritySettingsComponent } from './features/settings/security-settings.component';
import { AccountSettingsComponent } from './features/settings/account-settings.component';

export const routes: Routes = [
  {
    path: 'dashboard', component: WorkspaceLayoutComponent, canActivate: [authGuard], children: [
      { path: '', component: DashboardComponent, title: 'Dashboard | BOB' }
    ]
  },
  {
    path: 'projects', component: WorkspaceLayoutComponent, canActivate: [authGuard], children: [
      { path: '', component: ProjectsComponent, title: 'Mes projets | BOB' },
      { path: ':id', component: ProjectDetailComponent, title: 'Projet | BOB' }
    ]
  },
  {
    path: 'diagrams', component: WorkspaceLayoutComponent, canActivate: [authGuard], children: [
      { path: '', component: ComingSoonComponent, title: 'Diagrammes | BOB', data: { titleText: 'Diagrammes', icon: '⌘', description: 'La création et la génération de diagrammes UML seront intégrées lors d’une prochaine étape.' } }
    ]
  },
  {
    path: 'history', component: WorkspaceLayoutComponent, canActivate: [authGuard], children: [
      { path: '', component: ComingSoonComponent, title: 'Historique | BOB', data: { titleText: 'Historique', icon: '↶', description: 'L’historique sera alimenté par les actions réellement enregistrées lorsqu’elles seront disponibles.' } }
    ]
  },
  {
    path: 'settings', component: WorkspaceLayoutComponent, canActivate: [authGuard], children: [
      { path: '', component: SettingsComponent, children: [
        { path: '', pathMatch: 'full', redirectTo: 'profile' },
        { path: 'profile', component: ProfileSettingsComponent, title: 'Profil | BOB' },
        { path: 'security', component: SecuritySettingsComponent, title: 'Sécurité | BOB' },
        { path: 'account', component: AccountSettingsComponent, title: 'Compte | BOB' }
      ] }
    ]
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
