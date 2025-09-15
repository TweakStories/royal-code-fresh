/**
 * @file tailwind-dictionary.component.ts
 * @Version 3.0.0 (Final & Maintainable)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-06-20
 * @Description
 *   Een "onzichtbare" utility component die dient als een woordenboek voor de
 *   Tailwind JIT-compiler. Door via een @for loop expliciet alle dynamisch
 *   gebruikte klassen in de template te genereren, dwingen we Tailwind om
 *   ze op te nemen in de CSS-bundel. Dit is robuust en onderhoudbaar.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
 // CommonModule voor @for
import { PRODUCT_COLOR_KEYS } from '@royal-code/features/products/domain';

@Component({
  selector: 'lib-tailwind-dictionary',
  standalone: true,
  imports: [], // CommonModule is nodig voor @for
  template: `
<!--
  Dit component is onzichtbaar en dient puur om de Tailwind JIT-compiler
  te dwingen de onderstaande klassen in de CSS-bundel op te nemen.
  Elke klasse is volledig en statisch uitgeschreven voor maximale betrouwbaarheid.
-->
<div class="hidden">

  <!-- ====================================================================== -->
  <!-- Groep 1: Dynamische Kleuren voor Product Kleur-Swatches                -->
  <!-- Bron: libs/features/products/domain/src/lib/constants/product.constants.ts -->
  <!-- ====================================================================== -->

  <!-- Achtergrondkleuren (bg-*) -->
  <span class="bg-pink-300"></span>
  <span class="bg-sky-300"></span>
  <span class="bg-blue-500"></span>
  <span class="bg-emerald-300"></span>
  <span class="bg-green-500"></span>
  <span class="bg-yellow-300"></span>
  <span class="bg-purple-400"></span>
  <span class="bg-orange-300"></span>
  <span class="bg-red-400"></span>
  <span class="bg-teal-400"></span>
  <span class="bg-gray-400"></span>
  <span class="bg-stone-400"></span>
  <span class="bg-brown-400"></span>
  <span class="bg-white"></span>
  <span class="bg-slate-700"></span>
  <span class="bg-indigo-400"></span>
  <span class="bg-violet-400"></span>
  <span class="bg-fuchsia-400"></span>
  <span class="bg-rose-400"></span>
  <span class="bg-lime-400"></span>
  <span class="bg-cyan-400"></span>
  <span class="bg-amber-400"></span>

  <!-- Ring-kleuren (ring-*) -->
  <span class="ring-pink-300"></span>
  <span class="ring-sky-300"></span>
  <span class="ring-blue-500"></span>
  <span class="ring-emerald-300"></span>
  <span class="ring-green-500"></span>
  <span class="ring-yellow-300"></span>
  <span class="ring-purple-400"></span>
  <span class="ring-orange-300"></span>
  <span class="ring-red-400"></span>
  <span class="ring-teal-400"></span>
  <span class="ring-gray-400"></span>
  <span class="ring-stone-400"></span>
  <span class="ring-brown-400"></span>
  <span class="ring-white"></span>
  <span class="ring-slate-700"></span>
  <span class="ring-indigo-400"></span>
  <span class="ring-violet-400"></span>
  <span class="ring-fuchsia-400"></span>
  <span class="ring-rose-400"></span>
  <span class="ring-lime-400"></span>
  <span class="ring-cyan-400"></span>
  <span class="ring-amber-400"></span>


  <!-- ====================================================================== -->
  <!-- Groep 2: Dynamische Kleuren voor de Theme-Switcher & Thema-Knoppen     -->
  <!-- ====================================================================== -->

  <!-- Thema: Sun -->
  <span class="bg-theme-sun text-theme-sun-on hover:bg-theme-sun-hover border-theme-sun text-theme-sun"></span>
  <!-- Thema: Water -->
  <span class="bg-theme-water text-theme-water-on hover:bg-theme-water-hover border-theme-water text-theme-water"></span>
  <!-- Thema: Fire -->
  <span class="bg-theme-fire text-theme-fire-on hover:bg-theme-fire-hover border-theme-fire text-theme-fire"></span>
  <!-- Thema: Forest -->
  <span class="bg-theme-forest text-theme-forest-on hover:bg-theme-forest-hover border-theme-forest text-theme-forest"></span>
  <!-- Thema: Arcane -->
  <span class="bg-theme-arcane text-theme-arcane-on hover:bg-theme-arcane-hover border-theme-arcane text-theme-arcane"></span>

</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TailwindDictionaryComponent {
  /**
   * @description De volledige lijst van kleur-keys, geïmporteerd uit de
   *              centrale bron van waarheid, voor gebruik in de template.
   */
  readonly colors = PRODUCT_COLOR_KEYS;
}
