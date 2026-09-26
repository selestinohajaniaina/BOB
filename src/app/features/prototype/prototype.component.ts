import { Component } from '@angular/core';
import { BodyComponent } from '../../components/body/body.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({ selector: 'app-prototype', standalone: true, imports: [NavbarComponent, BodyComponent, FooterComponent], templateUrl: './prototype.component.html' })
export class PrototypeComponent {}
