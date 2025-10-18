import { Injectable } from '@angular/core';
import { encode } from 'plantuml-encoder';

@Injectable({
  providedIn: 'root'
})
export class PlantumlService {

  constructor() { }

  encodePlantText(code: string) {
    return encode(code.replaceAll("`", "").replaceAll("plantuml", ""));
  }
}
