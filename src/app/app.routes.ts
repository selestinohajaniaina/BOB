import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Bob :)'
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
    path: '**',
    redirectTo: ''
  }
];
