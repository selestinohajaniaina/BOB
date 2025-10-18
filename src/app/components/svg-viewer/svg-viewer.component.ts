import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-svg-viewer',
  standalone: true,
  imports: [],
  templateUrl: './svg-viewer.component.html',
  styleUrl: './svg-viewer.component.css'
})
export class SvgViewerComponent {
  @Input() url!: string;
  @Input() title!: string;

  async download(imageUrl: string) {
    try {
      // Récupérer l'image en tant que blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Créer un lien temporaire pour télécharger
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.title}.svg`; // nom du fichier
      document.body.appendChild(a);
      a.click();

      // Nettoyer
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement :', err);
      alert('Impossible de télécharger l’image.');
    }
  }
}
