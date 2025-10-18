import { Component, Input } from '@angular/core';
import { Project } from '../../data/projects';
// import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.css'
})
export class InputTextComponent {
  @Input() project!: Project;
}
