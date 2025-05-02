// widget-dashboard.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { AComponent, BComponent, CComponent, DComponent, EComponent } from '../widgets.component';


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
  private compactTimeout: any;
  private isCompacting = false;

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;
  @ViewChild('origTextArea', {static: false}) origTextEl?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('textArea', {static: false}) textEl?: ElementRef<HTMLTextAreaElement>;

  grid:any ={}

  isEditMode = false;

  public gridOptions: NgGridStackOptions = {
    column: 6,
    cellHeight: 50,
    margin: 5,
    minRow: 150,
    acceptWidgets: true,
    float: true,
    children: [
    ] 
  };

  public sidebarContent: NgGridStackWidget[] = [
    {selector: 'app-a' , w: 10, h: 10, maxW: 3},
    {selector: 'app-b', w: 10, h: 10, maxW: 3},
    {selector: 'app-c', w: 10, h: 10, maxW: 3},
    {selector: 'app-d', w: 2, maxW: 3},
    {selector: 'app-e', w: 10, h: 10, maxW: 3}
  ];

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    // Update gridOptions with the new disableDrag value
    this.gridOptions = {
      ...this.gridOptions,
      disableDrag: this.isEditMode
    };
  }

  ngOnInit(): void {
    this.onShow();
    GridStack.addRemoveCB = gsCreateNgComponents;
  }
  
  constructor(private snackBar: MatSnackBar) {}

  public onShow(): void {
    this.gridOptions = {
      ...this.gridOptions,
      children: [
        {selector: 'app-a', w: 10, h: 10, maxW: 3},
      ] 
    };

    GridStack.setupDragIn('.sidebar-item', { appendTo: 'body' }, this.sidebarContent);
    console.log('GridstackComponent', this.gridComp);

    setTimeout(() => {
      if (this.origTextEl) {
        this.origTextEl.nativeElement.value = JSON.stringify(this.gridOptions, null, '  ');
      }
      if (this.textEl) {
        this.textEl.nativeElement.value = '';
      }
    });
  }

  compactLayout(): void {
    if (!this.gridComp?.grid || this.isCompacting) return;
    
    this.isCompacting = true;
    this.snackBar.open('Compacting layout...', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
    
    // Perform compaction
    this.gridComp.grid.compact();
    
    // Debounce the save
    clearTimeout(this.compactTimeout);
    this.compactTimeout = setTimeout(() => {
      this.isCompacting = false;
      this.snackBar.open('Layout compacted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
    }, 300);
  }
}