import { Component } from '@angular/core';
import { InputTextComponent } from '../input-text/input-text.component';
import { Project, projects } from '../../data/projects';
import { GeminiService } from '../../services/gemini.service';
import { PlantumlService } from '../../services/plantuml.service';
import { SvgViewerComponent } from '../svg-viewer/svg-viewer.component';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-body',
  standalone: true,
  imports: [SvgViewerComponent, FormsModule, InputTextComponent],
  templateUrl: './body.component.html',
  styleUrl: './body.component.css'
})
export class BodyComponent {
  public projectList: Project[] = projects;
  private plantCode!: string;
  public initValue!: string;
  public url!: string;
  public urlUseCase!: string;
  public urlClass!: string;
  public urlActivity!: string;

  private codeUseCase!: string;
  private codeClass!: string;
  private codeActivity!: string;

  public description!: string;
  public useCaseLoading: boolean = false;
  public classLoading: boolean = false;
  public activityLoading: boolean = false;

  constructor(private gemini: GeminiService, private plantuml: PlantumlService) {}

  ngOnInit() {
    this.description = this.projectList[1].description;
  }

  generate(type: 'class' | 'useCase' | 'activity') {
   this.gemini.getPlantUmlCode(this.description, type, )
    .subscribe((result: any) => {
      this.plantCode = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      const coded = this.plantuml.encodePlantText(this.plantCode);
      this.url = `${environment.plantUmlApiUrl}/${coded}`;
      this.useCaseLoading = this.classLoading = this.activityLoading = false;
      switch (type) {
        case 'class':
          this.urlClass = this.url;
          this.codeClass = this.plantCode;
          break;
      
        case 'useCase':
          this.urlUseCase = this.url;
          this.codeUseCase = this.plantCode;
          break;

        case 'activity':
          this.urlActivity = this.url;
          this.codeActivity = this.plantCode;
          break;
      }
    })
  }

  generateUseCase() {
    this.useCaseLoading = true;
    this.urlUseCase = this.urlClass = this.urlActivity = this.initValue;
    this.generate('useCase');
  }

  generateClass() {
    this.classLoading = true;
    this.urlClass = this.urlActivity = this.initValue;
    this.generate('class');
  }

  generateActivity() {
    this.activityLoading = true;
    this.urlActivity = this.initValue;
    this.generate('activity');
  }

  choisitModel(description: string) {
    this.description = description
  }

}
