import { Component } from '@angular/core';
import { BodyComponent } from '../../components/body/body.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, BodyComponent, FooterComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
