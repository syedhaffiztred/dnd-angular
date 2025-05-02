import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { 
  GridstackComponent, 
  GridstackItemComponent, 
  NgGridStackOptions, 
  nodesCB, 
  NgGridStackWidget, 
  gsCreateNgComponents, 
} from 'gridstack/dist/angular';
import { GridStack } from 'gridstack';
import { MatSnackBar } from '@angular/material/snack-bar';

interface SidebarItem {
  icon: string;
  title: string;
  subtitle: string;
}

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
export class WidgetDashboardComponent implements OnInit {
  protected compactTimeout: any;
  protected isCompacting = false;
  protected saveTimeout: any;

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;
  @ViewChild('origTextArea', {static: false}) origTextEl?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('textArea', {static: false}) textEl?: ElementRef<HTMLTextAreaElement>;

  isEditMode = false;
  isLoading = false;

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

  public sidebarContent: NgGridStackWidget[] = [
    {selector: 'app-a', id: 'performance-metrics', w: 2, h: 2, maxW: 3},
    {selector: 'app-b', id: 'analytics-chart', w: 2, h: 2, maxW: 3},
    {selector: 'app-c', id: 'schedule', w: 2, h: 2, maxW: 3},
    {selector: 'app-d', id: 'data-table', w: 2, h: 2, maxW: 3},
    {selector: 'app-e', id: 'team-activity', w: 2, h: 2, maxW: 3},
    {selector: 'app-a', id: 'performance-metrics', w: 2, h: 2, maxW: 3},
    {selector: 'app-b', id: 'analytics-chart', w: 2, h: 2, maxW: 3},
    {selector: 'app-c', id: 'schedule', w: 2, h: 2, maxW: 3},
    {selector: 'app-d', id: 'data-table', w: 2, h: 2, maxW: 3},
    {selector: 'app-e', id: 'team-activity', w: 2, h: 2, maxW: 3}
  ];

  public sidebarItems: SidebarItem[] = [
    {
      icon: "speed",
      title: "Performance Metrics",
      subtitle: "Key business indicators"
    },
    {
      icon: "bar_chart",
      title: "Analytics Chart",
      subtitle: "Data visualization"
    },
    {
      icon: "event",
      title: "Schedule",
      subtitle: "Upcoming events"
    },
    {
      icon: "table_chart",
      title: "Data Table",
      subtitle: "Tabular data view"
    },
    {
      icon: "group",
      title: "Team Activity",
      subtitle: "Recent updates"
    },
    {
      icon: "message",
      title: "Recent Messages",
      subtitle: "Communication feed"
    },
    {
      icon: "info",
      title: "demo",
      subtitle: "demo card"
    }
  ];

  constructor(private snackBar: MatSnackBar) {}

ngOnInit(): void {
  
}

ngAfterViewInit():void{
    GridStack.addRemoveCB = gsCreateNgComponents;

    GridStack.setupDragIn('.sidebar> .sidebar-item', { appendTo: 'body' }, this.sidebarContent);
 
    setTimeout(() => {
      if (this.origTextEl) {
        this.origTextEl.nativeElement.value = JSON.stringify(this.gridOptions, null, '  ');
      }
      if (this.textEl) {
        this.textEl.nativeElement.value = '';
      }
    });




  }


  


  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    
    // Update gridOptions with the correct disableDrag value
    this.gridOptions = {
      ...this.gridOptions,
      disableDrag: this.isEditMode, // true when isEditMode is true
      disableResize: !this.isEditMode
    };

    // Update the grid with new options
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

  private loadLayout(): void {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout && this.gridComp?.grid) {
      this.isLoading = true;
      try {
        const layout = JSON.parse(savedLayout);
        this.gridComp.grid.load(layout);
      } catch (e) {
        console.error('Error loading layout:', e);
        this.loadDefaultLayout();
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loadDefaultLayout();
    }
  }

  private loadDefaultLayout(): void {
    this.gridOptions = {
      ...this.gridOptions,
      children: [
        {selector: 'app-a', id: 'default-performance', w: 2, h: 2, x: 0, y: 0},
        {selector: 'app-b', id: 'default-analytics', w: 2, h: 2, x: 2, y: 0}
      ]
    };
  }

}