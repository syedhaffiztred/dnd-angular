import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetDashboardComponent } from './widget-dashboard/widget-dashboard.component';
import { GridstackComponent } from 'gridstack/dist/angular';
import { AComponent, BComponent, CComponent, DComponent, EComponent } from './widgets.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WidgetDashboardComponent],
  template: `
    <main>
      <app-widget-dashboard></app-widget-dashboard>
    </main>
  `,
  styles: [`
    main {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'angular-dashboard';
  constructor() {
    // Register all dynamic component types with GridStack
    GridstackComponent.addComponentToSelectorType([
      AComponent, 
      BComponent,
      CComponent,
      DComponent,
      EComponent
    ]);
  }
}