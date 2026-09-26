import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><p class="text-sm font-bold uppercase tracking-widest text-emerald-600">Évolution de BOB</p><h1 class="mt-2 text-3xl font-black sm:text-4xl">{{ title }}</h1><section class="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><span class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-3xl" aria-hidden="true">{{ icon }}</span><h2 class="mt-5 text-2xl font-bold">Bientôt disponible</h2><p class="mx-auto mt-3 max-w-xl leading-7 text-slate-600">{{ description }}</p><p class="mt-3 text-sm text-slate-500">Aucune donnée fictive n’est affichée : cette fonctionnalité sera connectée lors d’une prochaine étape.</p><a routerLink="/dashboard" class="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Retour au dashboard</a></section></div>`
})
export class ComingSoonComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  readonly title = this.data['titleText'] as string;
  readonly description = this.data['description'] as string;
  readonly icon = this.data['icon'] as string;
}
