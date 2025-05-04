import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import { WIDGET_CONFIG, WidgetConfig } from './widgets.config';

@Injectable({ providedIn: 'root' })
export class WidgetStateService {
  private _allWidgets = WIDGET_CONFIG;
  private _widgetConfigs = new BehaviorSubject<WidgetConfig[]>(this._allWidgets);
  private _usedWidgetIds = new BehaviorSubject<Set<string>>(new Set<string>());

  widgetConfigs$: Observable<WidgetConfig[]> = this._widgetConfigs.asObservable();
  usedWidgetIds$: Observable<Set<string>> = this._usedWidgetIds.asObservable();
  availableWidgets$: Observable<WidgetConfig[]> = this.widgetConfigs$.pipe(
    map(configs => configs.filter(widget => !this._usedWidgetIds.value.has(widget.id))),
    distinctUntilChanged()
  );

  constructor() {}

  useWidget(widgetId: string): void {
    const currentUsed = new Set(this._usedWidgetIds.value);
    if (!currentUsed.has(widgetId)) {
      currentUsed.add(widgetId);
      this._usedWidgetIds.next(currentUsed);
      this.updateAvailableWidgets();
    }
  }

  releaseWidget(widgetId: string): void {
    const currentUsed = new Set(this._usedWidgetIds.value);
    if (currentUsed.has(widgetId)) {
      currentUsed.delete(widgetId);
      this._usedWidgetIds.next(currentUsed);
      this.updateAvailableWidgets();
    }
  }

  initialize(savedWidgetIds: string[] = []): void {
    const uniqueIds = new Set<string>();
    const initialConfigs = this._allWidgets.filter(widget => {
      if (!uniqueIds.has(widget.id)) {
        uniqueIds.add(widget.id);
        return true;
      }
      return false;
    });
    
    this._widgetConfigs.next(initialConfigs);
    this._usedWidgetIds.next(new Set(savedWidgetIds));
    this.updateAvailableWidgets();
  }

  private updateAvailableWidgets(): void {
    const available = this._allWidgets.filter(
      widget => !this._usedWidgetIds.value.has(widget.id)
    );
    this._widgetConfigs.next(available);
  }

  getWidgetById(id: string): WidgetConfig | undefined {
    return this._allWidgets.find(w => w.id === id);
  }
}