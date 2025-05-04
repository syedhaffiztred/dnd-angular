import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridStack } from 'gridstack';

@Component({
  selector: 'app-hoc-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-wrapper">
      <div class="widget-header">
        <h4>{{ widgetTitle }}</h4>
        <button class="close-btn" (click)="removeWidget($event)">×</button>
      </div>
      <div class="widget-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .widget-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #3b82f6;
      color: white;
    }
    
    .widget-header h4 {
      margin: 0;
      font-size: 16px;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    
    .close-btn:hover {
      color: #ff6b6b;
    }
    
    .widget-content {
      flex: 1;
      padding: 16px;
      overflow: auto;
    }
  `]
})
export class HocWrapperComponent {
  @Input() widgetTitle?: string;
  @Input() widgetId?: string;
  @Input() grid?: GridStack;
  @Output() widgetRemoved = new EventEmitter<string>();

  private isBeingRemoved = false;
  
  constructor(private el: ElementRef) {}
  
  removeWidget(event: Event): void {
    try {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.isBeingRemoved) {
        console.warn('Widget removal already in progress');
        return;
      }
      
      this.isBeingRemoved = true;
      
      const widget = this.el.nativeElement.closest('.grid-stack-item');

      console.log('widget',widget)
      
      if (!widget) {
        console.warn('Cannot remove widget: Grid item element not found');
        this.isBeingRemoved = false;
        return;
      }
      
      if (this.widgetId) {
        this.widgetRemoved.emit(this.widgetId);
        
      }
      
      if (this.grid) {
        this.grid.removeWidget(widget, true, true);
      } else {
        const gridElement = widget.closest('.grid-stack');
        
        if (gridElement) {
          const gridInstance = gridElement.gridstack;
          
          if (gridInstance) {
            gridInstance.removeWidget(widget, true, true);
          } else {
            console.error('GridStack instance not found');
            this.isBeingRemoved = false;
          }
        } else {
          console.error('Grid container not found');
          this.isBeingRemoved = false;
        }
      }
    } catch (error) {
      console.error('Error removing widget:', error);
      this.isBeingRemoved = false;
    }
  }
}
// Component A - Performance Metrics
@Component({
  selector: 'app-a',
  standalone: true,
  imports: [CommonModule, HocWrapperComponent],
  template: `
    <app-hoc-wrapper [widgetId]="widgetId" [widgetTitle]="widgetTitle" [grid]="gridInstance" (widgetRemoved)="onWidgetRemoved($event)">
      <div class="metric-widget">
        <div class="metric-value">87.5%</div>
        <div class="metric-label">Completion Rate</div>
        <div class="metric-trend positive">↑ 2.4% from last month</div>
      </div>
    </app-hoc-wrapper>
  `,
  styles: [`
    .metric-widget {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 16px;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .metric-label {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 12px;
    }
    
    .metric-trend {
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 12px;
    }
    
    .positive {
      background-color: #dcfce7;
      color: #166534;
    }
  `]
})
export class AComponent {
  @Input() widgetId?: string;
  @Input() widgetTitle = 'Performance Metrics';
  @Input() gridInstance?: GridStack;
  
  onWidgetRemoved(id: string): void {
    console.log(`Widget ${id} removed from component A`);
  }
}

// Component B - Analytics Chart
@Component({
  selector: 'app-b',
  standalone: true,
  imports: [CommonModule, HocWrapperComponent],
  template: `
    <app-hoc-wrapper [widgetId]="widgetId" [widgetTitle]="widgetTitle" [grid]="gridInstance" (widgetRemoved)="onWidgetRemoved($event)">
      <div class="chart-placeholder">
        <p>Chart visualization will appear here</p>
      </div>
    </app-hoc-wrapper>
  `,
  styles: [`
    .chart-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background-color: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      padding: 16px;
      text-align: center;
    }
  `]
})
export class BComponent {
  @Input() widgetId?: string;
  @Input() widgetTitle = 'Analytics Chart';
  @Input() gridInstance?: GridStack;
  
  onWidgetRemoved(id: string): void {
    console.log(`Widget ${id} removed from component B`);
  }
}

// Component C - Schedule
@Component({
  selector: 'app-c',
  standalone: true,
  imports: [CommonModule, HocWrapperComponent],
  template: `
    <app-hoc-wrapper [widgetId]="widgetId" [widgetTitle]="widgetTitle" [grid]="gridInstance" (widgetRemoved)="onWidgetRemoved($event)">
      <div class="schedule-widget">
        <div class="schedule-item" *ngFor="let item of scheduleItems">
          <div class="time">{{ item.time }}</div>
          <div class="event">{{ item.event }}</div>
        </div>
      </div>
    </app-hoc-wrapper>
  `,
  styles: [`
    .schedule-widget {
      padding: 8px 0;
    }
    
    .schedule-item {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .schedule-item:last-child {
      border-bottom: none;
    }
    
    .time {
      width: 60px;
      font-weight: 500;
      color: #1e293b;
    }
    
    .event {
      flex: 1;
      color: #64748b;
    }
  `]
})
export class CComponent {
  @Input() widgetId?: string;
  @Input() widgetTitle = 'Schedule';
  @Input() gridInstance?: GridStack;
  
  scheduleItems = [
    { time: '09:00', event: 'Team Standup' },
    { time: '11:30', event: 'Client Meeting' },
    { time: '14:00', event: 'Product Review' },
    { time: '16:00', event: 'Retrospective' }
  ];
  
  onWidgetRemoved(id: string): void {
    console.log(`Widget ${id} removed from component C`);
  }
}

// Component D - Data Table
@Component({
  selector: 'app-d',
  standalone: true,
  imports: [CommonModule, HocWrapperComponent],
  template: `
    <app-hoc-wrapper [widgetId]="widgetId" [widgetTitle]="widgetTitle" [grid]="gridInstance" (widgetRemoved)="onWidgetRemoved($event)">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of tableData">
            <td>{{ row.name }}</td>
            <td>{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </app-hoc-wrapper>
  `,
  styles: [`
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    .data-table th, .data-table td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .data-table th {
      background-color: #f1f5f9;
      color: #64748b;
      font-weight: 500;
    }
  `]
})
export class DComponent {
  @Input() widgetId?: string;
  @Input() widgetTitle = 'Data Table';
  @Input() gridInstance?: GridStack;
  
  tableData = [
    { name: 'Revenue', value: '$12,345' },
    { name: 'Users', value: '1,234' },
    { name: 'Conversion', value: '3.2%' },
    { name: 'Avg. Session', value: '2m 45s' }
  ];
  
  onWidgetRemoved(id: string): void {
    console.log(`Widget ${id} removed from component D`);
  }
}

// Component E - Team Activity
@Component({
  selector: 'app-e',
  standalone: true,
  imports: [CommonModule, HocWrapperComponent],
  template: `
    <app-hoc-wrapper [widgetId]="widgetId" [widgetTitle]="widgetTitle" [grid]="gridInstance" (widgetRemoved)="onWidgetRemoved($event)">
      <div class="activity-widget">
        <div class="activity-item" *ngFor="let activity of activities">
          <div class="avatar">{{ activity.initials }}</div>
          <div class="details">
            <div class="name">{{ activity.name }}</div>
            <div class="action">{{ activity.action }}</div>
          </div>
        </div>
      </div>
    </app-hoc-wrapper>
  `,
  styles: [`
    .activity-widget {
      padding: 8px 0;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
    }
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .details {
      flex: 1;
    }
    
    .name {
      font-weight: 500;
      color: #1e293b;
      font-size: 14px;
    }
    
    .action {
      color: #64748b;
      font-size: 13px;
    }
  `]
})
export class EComponent {
  @Input() widgetId?: string;
  @Input() widgetTitle = 'Team Activity';
  @Input() gridInstance?: GridStack;
  
  activities = [
    { initials: 'JD', name: 'John Doe', action: 'Updated project timeline' },
    { initials: 'AS', name: 'Alice Smith', action: 'Completed task #1234' },
    { initials: 'BJ', name: 'Bob Johnson', action: 'Commented on PR #567' }
  ];
  
  onWidgetRemoved(id: string): void {
    console.log(`Widget ${id} removed from component E`);
  }
}