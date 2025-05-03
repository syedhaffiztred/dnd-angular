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
import { GridStack } from 'gridstack';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    GridstackComponent
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
  
  // Widget configurations
  widgetConfigs: WidgetConfig[] = WIDGET_CONFIG;

  public gridOptions: NgGridStackOptions = {
    column: 12,
    cellHeight: 50,
    margin: 5,
    minRow: 150,
    acceptWidgets: true,
    float: true,
    disableDrag: false, // Initial value matches isEditMode false
    disableResize: false,
    alwaysShowResizeHandle: false,
    resizable: {
      handles: 'e, se, s, sw, w'
    },
    children: []
  };

  // Map widget configs to GridStack format
  public sidebarContent: NgGridStackWidget[] = this.widgetConfigs.map(config => ({
    selector: config.selector,
    id: config.id,
    w: config.w,
    h: config.h,
    maxW: config.maxW,
    maxH: config.maxH
  }));

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Check for saved layout on init
    this.checkForSavedLayout();
  }

  ngAfterViewInit(): void {
    // Setup drag and drop from sidebar
    GridStack.addRemoveCB = gsCreateNgComponents;
    GridStack.setupDragIn('.sidebar > .sidebar-item', { appendTo: 'body' }, this.sidebarContent);
 
    setTimeout(() => {
      if (this.origTextEl) {
        this.origTextEl.nativeElement.value = JSON.stringify(this.gridOptions, null, '  ');
      }
      if (this.textEl) {
        this.textEl.nativeElement.value = '';
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    // Update gridOptions with the correct disableDrag and disableResize values
    // In edit mode, we want to disable dragging and enable resizing
    this.gridOptions = {
      ...this.gridOptions,
      disableDrag: this.isEditMode,
      disableResize: !this.isEditMode
    };

    // Update the grid with new options
    if (this.gridComp?.grid) {
      this.gridComp.grid.enableMove(!this.isEditMode);
      this.gridComp.grid.enableResize(!this.isEditMode);
    }

    // Save layout when exiting edit mode
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
      const layout = this.gridComp?.grid?.save(false, true);
      if (layout) {
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
        this.snackBar.open('Layout saved', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      }
    }, 500);
  }

  private checkForSavedLayout(): void {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        // Set the saved layout to be loaded when the grid is ready
        this.gridOptions = {
          ...this.gridOptions,
          children: layout
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
    // Use the first two widgets as default layout
    this.gridOptions = {
      ...this.gridOptions,
      children: [
        {
          selector: this.widgetConfigs[0].selector,
          id: this.widgetConfigs[0].id,
          w: this.widgetConfigs[0].w,
          h: this.widgetConfigs[0].h,
          x: 0,
          y: 0
        },
        {
          selector: this.widgetConfigs[1].selector,
          id: this.widgetConfigs[1].id,
          w: this.widgetConfigs[1].w,
          h: this.widgetConfigs[1].h,
          x: this.widgetConfigs[0].w,
          y: 0
        }
      ]
    };
  }

  // Method to handle widget removal events from child components
  onWidgetRemoved(widgetId: string): void {
    console.log(`Widget with ID ${widgetId} was removed`);
    // Additional logic if needed when a widget is removed
    this.saveLayout();
  }
}