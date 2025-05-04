import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { 
  GridstackComponent, 
  NgGridStackOptions, 
  NgGridStackWidget, 
  gsCreateNgComponents
} from 'gridstack/dist/angular';
import { GridStack, GridStackNode } from 'gridstack';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WidgetStateService } from '../widget-state.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { WIDGET_CONFIG, WidgetConfig } from '../widgets.config';

@Component({
  selector: 'app-widget-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatSlideToggleModule,
    FormsModule,
    GridstackComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './widget-dashboard.component.html',
  styleUrls: ['./widget-dashboard.component.css']
})
export class WidgetDashboardComponent implements OnInit, AfterViewInit {
  protected compactTimeout: any;
  protected isCompacting = false;
  protected saveTimeout: any;

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;
  @ViewChild('origTextArea', {static: false}) origTextEl?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('textArea', {static: false}) textEl?: ElementRef<HTMLTextAreaElement>;

  isEditMode = false;
  isLoading = false;
  
  widgetConfigs$: Observable<WidgetConfig[]>;
  
  public gridOptions: NgGridStackOptions = {
    column: 12,
    cellHeight: 50,
    margin: 5,
    minRow: 100,
    acceptWidgets: true,
    float: true,
    disableDrag: false,
    disableResize: false,
    alwaysShowResizeHandle: false,
    resizable: {
      handles: 'e, se, s, sw, w'
    },
    children: []
  };

  public sidebarContent: NgGridStackWidget[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private widgetState: WidgetStateService
  ) {
    this.widgetConfigs$ = this.widgetState.availableWidgets$;
  }

  ngOnInit(): void {
    this.checkForSavedLayout();
  }

  ngAfterViewInit(): void {
    if (this.gridComp?.grid) {
      this.gridComp.grid.on('added', (event: Event, nodes: GridStackNode[]) => {
        setTimeout(() => {
          this.handleWidgetsAdded(nodes);
        });
      });

      this.gridComp.grid.on('removed', (event: Event, nodes: GridStackNode[]) => {
        nodes.forEach(node => {
          if (node.id) {
            this.widgetState.releaseWidget(node.id as string);
          }
        });
      });
    }
    
    GridStack.addRemoveCB = gsCreateNgComponents;
    this.widgetConfigs$.subscribe(configs => {
      this.sidebarContent = configs.map(config => ({
        selector: config.selector,
        id: config.id,
        w: config.w,
        h: config.h,
        maxW: config.maxW,
        maxH: config.maxH
      }));
      
      setTimeout(() => {
        GridStack.setupDragIn('.sidebar > .sidebar-item', { appendTo: 'body' }, this.sidebarContent);
      });
    });
  }

  private handleWidgetsAdded(nodes: GridStackNode[]): void {
    nodes.forEach(node => {
      const widgetId = node.id as string;
      if (widgetId) {
        this.widgetState.useWidget(widgetId);
      }
    });
    this.saveLayout();
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.gridOptions = {
      ...this.gridOptions,
      disableDrag: this.isEditMode,
      disableResize: !this.isEditMode
    };

    if (this.gridComp?.grid) {
      this.gridComp.grid.enableMove(!this.isEditMode);
      this.gridComp.grid.enableResize(!this.isEditMode);
    }

    if (!this.isEditMode) {
      this.saveLayout();
    }
  }

  compactLayout(): void {
    if (!this.gridComp?.grid || this.isCompacting) return;
    
    this.isCompacting = true;
    this.snackBar.open('Compacting layout...', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
    
    this.gridComp.grid.compact();
    
    clearTimeout(this.compactTimeout);
    this.compactTimeout = setTimeout(() => {
      this.isCompacting = false;
      this.saveLayout();
      this.snackBar.open('Layout compacted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
    }, 300);
  }

  private saveLayout(): void {
    if (!this.gridComp?.grid) return;
    
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      const layout = this.gridComp?.grid?.save(false, true)

      console.log('layout',layout)
      ;
      if (layout) {
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
        this.widgetState.usedWidgetIds$.subscribe(usedIds => {
          localStorage.setItem('usedWidgetIds', JSON.stringify(Array.from(usedIds)));
        });
        this.snackBar.open('Layout saved', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      }
    }, 500);
  }

  private checkForSavedLayout(): void {
    const savedWidgetIds = localStorage.getItem('usedWidgetIds');
    if (savedWidgetIds) {
      try {
        const widgetIds = JSON.parse(savedWidgetIds);
        this.widgetState.initialize(widgetIds);
      } catch (e) {
        console.error('Error parsing saved widget IDs:', e);
        this.widgetState.initialize();
      }
    } else {
      this.widgetState.initialize();
    }
    
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        this.gridOptions = {
          ...this.gridOptions,
          children: layout.children
        };
      } catch (e) {
        console.error('Error parsing saved layout:', e);
        this.loadDefaultLayout();
      }
    } else {
      this.loadDefaultLayout();
    }
  }

  private loadDefaultLayout(): void {
    const firstWidget = WIDGET_CONFIG[0];
    const secondWidget = WIDGET_CONFIG[1];
    
    this.widgetState.useWidget(firstWidget.id);
    this.widgetState.useWidget(secondWidget.id);
    
    this.gridOptions = {
      ...this.gridOptions,
      children: [
        {
          selector: firstWidget.selector,
          id: firstWidget.id,
          w: firstWidget.w,
          h: firstWidget.h,
          x: 0,
          y: 0
        },
        {
          selector: secondWidget.selector,
          id: secondWidget.id,
          w: secondWidget.w,
          h: secondWidget.h,
          x: firstWidget.w,
          y: 0
        }
      ]
    };
  }

  onWidgetRemoved(widgetId: string): void {
    this.widgetState.releaseWidget(widgetId);
    this.saveLayout();
  }
}