
export interface FilterOption {
    value: string;
    label: string;
  }
  
  export interface FilterConfig {
    controlType: 'daterange' | 'checkbox' | 'dropdown';
    label: string;
    key: string;
    options?: FilterOption[];
    startDateKey?: string;
    endDateKey?: string;
  }