export interface WidgetConfig {
    icon: string;
    title: string;
    subtitle: string;
    selector: string;
    id: string;
    w: number;
    h: number;
    maxW: number;
    maxH?: number;
  }
  
  export const WIDGET_CONFIG: WidgetConfig[] = [
    {
      selector: 'app-a',
      id: 'performance-metrics',
      w: 2,
      h: 2,
      maxW: 10,
      maxH: 10,
      icon: "speed",
      title: "Performance Metrics",
      subtitle: "Key business indicators"
    },
    {
      selector: 'app-b',
      id: 'analytics-chart',
      w: 2,
      h: 2,
      maxW: 3,
      maxH: 10,
      icon: "bar_chart",
      title: "Analytics Chart",
      subtitle: "Data visualization"
    },
    {
      selector: 'app-c',
      id: 'schedule',
      w: 2,
      h: 2,
      maxW: 3,
      maxH: 10,
      icon: "event",
      title: "Schedule",
      subtitle: "Upcoming events"
    },
    {
      selector: 'app-d',
      id: 'data-table',
      w: 2,
      h: 2,
      maxW: 3,
      maxH: 10,
      icon: "table_chart",
      title: "Data Table",
      subtitle: "Tabular data view"
    },
    {
      selector: 'app-e',
      id: 'team-activity',
      w: 2,
      h: 2,
      maxW: 3,
      maxH: 10,
      icon: "groups",
      title: "Team Activity",
      subtitle: "Team collaboration metrics"
    }
  ];