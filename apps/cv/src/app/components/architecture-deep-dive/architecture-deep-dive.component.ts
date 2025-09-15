/**
 * @file architecture-deep-dive.component.ts (CV App)
 * @version 3.0.0 (Definitive & In-depth)
 * @description Een interactieve showcase die de diepgaande architectuur van het project
 *              visueel en gedetailleerd uitlegt, met folderstructuren en codevoorbeelden.
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { FolderTreeComponent, TreeNode } from '@royal-code/ui/folder-tree'; // <-- CORRECTE IMPORT

@Component({
  selector: 'app-cv-architecture-deep-dive',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, FolderTreeComponent],
  template: `
    <div class="architecture-showcase bg-surface-alt border border-border rounded-xs p-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'cv.projects.detail.underTheHoodTitle' | translate" extraClasses="!text-2xl font-bold mb-6" />

      <div class="flex border-b border-border mb-6">
        <button (click)="activeTab.set('frontend')" [class.active]="activeTab() === 'frontend'" class="tab-button">Frontend (Nx & Angular)</button>
        <button (click)="activeTab.set('backend')" [class.active]="activeTab() === 'backend'" class="tab-button">Backend (.NET)</button>
      </div>

      <div class="prose prose-sm max-w-none">
        @switch (activeTab()) {
          @case ('frontend') {
            <h4>De Anatomie van een Feature</h4>
            <p>Elke feature is opgebouwd uit een set van gespecialiseerde libraries. Deze "Slice-Based" aanpak garandeert een strikte scheiding van verantwoordelijkheden en een voorspelbare, eenrichtings-dataflow.</p>
            <royal-ui-folder-tree [data]="frontendTree" />
            
            <h4 class="mt-6">De Workflow: Van Idee tot Code</h4>
            <p>Consistentie is key. Elke nieuwe feature wordt op dezelfde, voorspelbare manier gegenereerd met Nx. Dit is geen suggestie, maar een regel. Het resultaat is een codebase die direct begrijpelijk is voor elke ontwikkelaar in het team.</p>
            <pre class="code-block"><code>{{ nxCommands }}</code></pre>
          }
          @case ('backend') {
            <h4>De Vesting: Clean Architecture</h4>
            <p>De .NET backend volgt strikt de Clean Architecture principes. De kern (Domain & Application) is volledig onafhankelijk van externe factoren zoals de database of het web framework. Dit maakt de business logic extreem robuust, testbaar en toekomstbestendig.</p>
            <royal-ui-folder-tree [data]="backendTree" />

            <h4 class="mt-6">De Afhankelijkheidsregel in Actie</h4>
            <p>De <code>Application</code> laag definieert een contract (interface), terwijl de <code>Infrastructure</code> laag deze implementeert. Dit ontkoppelt de business logic van de data-implementatie, waardoor bijvoorbeeld de database-provider (van SQL Server naar PostgreSQL) kan worden gewisseld zonder de kernlogica te beïnvloeden.</p>
            <pre class="code-block"><code>{{ backendExample }}</code></pre>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .tab-button {
      padding: 1rem 1rem;
      margin-bottom: -1px;
      border-bottom: 2px solid;
      font-size: 0.875rem;
      font-weight: 500;
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    .tab-button:not(.active) {
      border-color: transparent;
      color: hsl(var(--secondary));
    }
    .tab-button:not(.active):hover {
      color: hsl(var(--foreground));
      border-color: hsl(var(--border));
    }
    .tab-button.active {
      border-color: hsl(var(--primary));
      color: hsl(var(--primary));
    }
    .code-block {
      background-color: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: 0.375rem;
      padding: 1rem;
      font-size: 0.75rem;
      color: hsl(var(--secondary));
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitectureDeepDiveComponent {
  activeTab = signal<'frontend' | 'backend'>('frontend');
  readonly TitleTypeEnum = TitleTypeEnum;
  
readonly frontendTree: TreeNode[] = [
    { name: 'apps/', icon: AppIcon.FolderOpen, description: 'De consumenten: elke map is een deploybare applicatie.', children: [
      { name: 'cv/', icon: AppIcon.UserCircle, description: 'Deze CV/Portfolio website.' },
      { name: 'plushie-paradise/', icon: AppIcon.Store, description: 'De e-commerce storefront.' },
      { name: 'admin-panel/', icon: AppIcon.LayoutDashboard, description: 'Het beheerpaneel.' },
      { name: 'challenger/', icon: AppIcon.Gamepad2, description: 'De gamified persoonlijke groei app.' }, // Challenger hier toegevoegd op app-niveau
    ]},
    { name: 'libs/', icon: AppIcon.FolderOpen, description: 'De herbruikbare logica: de kern van de fabriek.', children: [
      { name: 'features/', icon: AppIcon.Folder, description: 'Verticale slices van business-functionaliteit.', children: [
        { name: 'products/', icon: AppIcon.Package, description: 'Voorbeeld: de "products" feature.', children: [
          { name: 'domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'De Waarheid: TypeScript interfaces & enums.' },
          { name: 'core', icon: AppIcon.BrainCircuit, colorClass: 'text-amber-500', description: 'NgRx State, Facade & Actions. App-onafhankelijk.' },
          
          { name: 'data-access-plushie', icon: AppIcon.Cloud, colorClass: 'text-sky-500', description: 'Connector voor de Plushie-winkel API.' },
          { name: 'ui-plushie', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Smart components specifiek voor de Plushie-winkel.' },
          
          { name: 'data-access-admin', icon: AppIcon.Cloud, colorClass: 'text-sky-700', description: 'Connector voor de Admin Panel API.' },
          { name: 'ui-admin', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-700', description: 'Smart components specifiek voor het Admin Panel.' },
          { name: 'ui-drone', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Gebruikersinterface voor de drone-app' },
        ]}
        // { name: 'cart/', icon: AppIcon.ShoppingCart, children: [ /* ... lagen ... */ ] },
        // { name: 'social/', icon: AppIcon.Users, children: [ /* ... lagen ... */ ] },
      ]},
      { name: 'ui/', icon: AppIcon.PackageOpen, description: 'De Algemene Lego-set: "Domme", herbruikbare UI componenten.', children: [
        { name: 'button/', icon: AppIcon.MousePointer },
        { name: 'card/', icon: AppIcon.Square },
        { name: 'input/', icon: AppIcon.PenTool },
      ]},
      { name: 'core/', icon: AppIcon.Settings, description: 'De Nutsvoorzieningen: Logging, Error Handling, Interceptors.' },
      { name: 'store/', icon: AppIcon.Recycle, description: 'Globale NgRx state: auth, user, theme.', children: [
        { name: 'auth/', icon: AppIcon.Lock },
        { name: 'user/', icon: AppIcon.User },
      ]},
      { name: 'shared/', icon: AppIcon.Folder, description: 'Gedeelde, niet-specifieke code.', children: [
        { name: 'domain/', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'Globale, feature-overstijgende modellen.'},
        { name: 'utils/', icon: AppIcon.Wrench, description: 'Herbruikbare pipes, directives en helper-functies.'},
      ]},
    ]}
  ];

  readonly backendTree: TreeNode[] = [
    { name: 'src/', icon: AppIcon.FolderOpen, children: [
      { name: 'Domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'cv.architecture.folderTree.backend.domain.description' },
      { name: 'Application', icon: AppIcon.Layers, colorClass: 'text-amber-500', description: 'cv.architecture.folderTree.backend.application.description' },
      { name: 'Infrastructure', icon: AppIcon.Database, colorClass: 'text-sky-500', description: 'cv.architecture.folderTree.backend.infrastructure.description' },
      { name: 'Web (API)', icon: AppIcon.Server, colorClass: 'text-green-500', description: 'cv.architecture.folderTree.backend.webApi.description' },
    ]}
  ];

  readonly nxCommands = `
# 1. Creëer de fundering (types)
nx g lib features/products/domain --tags="type:domain,scope:shared"

# 2. Bouw de business logic (state)
nx g lib features/products/core --tags="type:feature-core,scope:shared"

# 3. Implementeer de dataverbinding (API)
nx g lib features/products/data-access-plushie --tags="type:data-access,scope:plushie"

# 4. Construeer de UI
nx g lib features/products/ui-plushie --tags="type:feature,scope:plushie"
  `;

  readonly backendExample = `
// In Application/Common/Interfaces/IProductRepository.cs
// "De business logic heeft een manier nodig om producten op te halen,
// maar het maakt niet uit HOE dat gebeurt (SQL, Mongo, etc.)."
public interface IProductRepository {
    Task<Product?> GetByIdAsync(Guid id);
}

// In Infrastructure/Data/ProductRepository.cs
// "Ik weet HOE ik producten moet ophalen: met Entity Framework Core
// uit een SQL database. Ik voldoe aan het contract."
public class ProductRepository : IProductRepository {
    private readonly ApplicationDbContext _context;
    // ...
    public async Task<Product?> GetByIdAsync(Guid id) {
        return await _context.Products.FindAsync(id);
    }
}
  `;
}