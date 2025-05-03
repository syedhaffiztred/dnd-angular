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
  
  // Original widget configurations
  originalWidgetConfigs: WidgetConfig[] = WIDGET_CONFIG;
  
  // Available widgets for the sidebar (will be filtered as widgets are used)
  widgetConfigs: WidgetConfig[] = [];
  
  // Set to track widgets that have been added to the grid
  usedWidgetIds: Set<string> = new Set<string>();

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
  public sidebarContent: NgGridStackWidget[] = [];

  constructor(private snackBar: MatSnackBar) {
    // Initialize widgetConfigs with unique widgets (remove duplicates by ID)
    const uniqueIds = new Set<string>();
    this.widgetConfigs = this.originalWidgetConfigs.filter(widget => {
      if (!uniqueIds.has(widget.id)) {
        uniqueIds.add(widget.id);
        return true;
      }
      return false;
    });
    
    // Initialize sidebarContent based on filtered widgets
    this.updateSidebarContent();
  }

  ngOnInit(): void {
    // Check for saved layout on init
    this.checkForSavedLayout();
  }

  ngAfterViewInit(): void {
    if (this.gridComp?.grid) {
      // Setup callback for when a widget is added to the grid
      this.gridComp.grid.on('added', (event: Event, nodes: GridStackNode[]) => {
        setTimeout(() => {
          this.handleWidgetsAdded(nodes);
        });
      });
    }
    
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

  /**
   * Updates the sidebar content based on available widgets
   */
  private updateSidebarContent(): void {
    this.sidebarContent = this.widgetConfigs.map(config => ({
      selector: config.selector,
      id: config.id,
      w: config.w,
      h: config.h,
      maxW: config.maxW,
      maxH: config.maxH
    }));
  }

  /**
   * Handle widgets added to the grid
   * Mark them as used and update the sidebar
   */
  private handleWidgetsAdded(nodes: GridStackNode[]): void {
    let updated = false;
    
    nodes.forEach(node => {
      const widgetId = node.id as string;
      if (widgetId && !this.usedWidgetIds.has(widgetId)) {
        this.usedWidgetIds.add(widgetId);
        updated = true;
      }
    });
    
    if (updated) {
      // Filter out the used widgets from available widgets
      this.widgetConfigs = this.originalWidgetConfigs.filter(
        widget => !this.usedWidgetIds.has(widget.id)
      );
      
      // Update the sidebar content
      this.updateSidebarContent();
      
      // Update GridStack drag-in setup
      setTimeout(() => {
        GridStack.setupDragIn('.sidebar > .sidebar-item', { appendTo: 'body' }, this.sidebarContent);
      });
      
      // Save the current layout
      this.saveLayout();
    }
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
        // Also save the used widget IDs
        localStorage.setItem('usedWidgetIds', JSON.stringify(Array.from(this.usedWidgetIds)));
        this.snackBar.open('Layout saved', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      }
    }, 500);
  }

  private checkForSavedLayout(): void {
    // First restore used widget IDs if available
    const savedWidgetIds = localStorage.getItem('usedWidgetIds');
    if (savedWidgetIds) {
      try {
        const widgetIds = JSON.parse(savedWidgetIds);
        this.usedWidgetIds = new Set(widgetIds);
        
        // Update available widgets
        this.widgetConfigs = this.originalWidgetConfigs.filter(
          widget => !this.usedWidgetIds.has(widget.id)
        );
        this.updateSidebarContent();
      } catch (e) {
        console.error('Error parsing saved widget IDs:', e);
      }
    }
    
    // Then restore layout
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
    const firstWidget = this.originalWidgetConfigs[0];
    const secondWidget = this.originalWidgetConfigs[1];
    
    // Mark these widgets as used
    this.usedWidgetIds.add(firstWidget.id);
    this.usedWidgetIds.add(secondWidget.id);
    
    // Update available widgets
    this.widgetConfigs = this.originalWidgetConfigs.filter(
      widget => !this.usedWidgetIds.has(widget.id)
    );
    this.updateSidebarContent();
    
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

  // Method to handle widget removal events from child components
  onWidgetRemoved(widgetId: string): void {
    console.log(`Widget with ID ${widgetId} was removed`);
    
    // Remove from used widgets set
    this.usedWidgetIds.delete(widgetId);
    
    // Add back to available widgets
    const removedWidgetConfig = this.originalWidgetConfigs.find(w => w.id === widgetId);
    if (removedWidgetConfig) {
      this.widgetConfigs.push(removedWidgetConfig);
      
      // Update sidebar content
      this.updateSidebarContent();
      
      // Update GridStack drag-in setup
      setTimeout(() => {
        GridStack.setupDragIn('.sidebar > .sidebar-item', { appendTo: 'body' }, this.sidebarContent);
      });
    }
    
    // Save the updated layout
    this.saveLayout();
  }
}