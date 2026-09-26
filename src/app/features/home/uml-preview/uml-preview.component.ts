import { Component, Input } from '@angular/core';

@Component({ selector: 'app-uml-preview', standalone: true, templateUrl: './uml-preview.component.html' })
export class UmlPreviewComponent {
  @Input({ required: true }) type!: string;
  @Input({ required: true }) label!: string;
}
