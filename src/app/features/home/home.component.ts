import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { diagramTypes } from './home.data';
import { UmlPreviewComponent } from './uml-preview/uml-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, UmlPreviewComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly diagramTypes = diagramTypes;
  readonly families = [
    { name: 'Structurels', description: 'La structure statique, les composants et le déploiement du système.', items: diagramTypes.filter((item) => item.family === 'Structurel') },
    { name: 'Comportementaux', description: 'Les usages, processus et changements d’état du système.', items: diagramTypes.filter((item) => item.family === 'Comportemental') },
    { name: 'Interaction', description: 'Les échanges entre participants, leur ordre et leur temporalité.', items: diagramTypes.filter((item) => item.family === 'Interaction') }
  ];
}
