/**
 * @interface BreadcrumbItem
 * @description Represents a single clickable item in a breadcrumb navigation trail.
 */
export interface BreadcrumbItem {
  /** Unieke ID voor trackBy in @for loops. */
  id: string; 
  /** The display label for the breadcrumb, typically an i18n key or a direct string. */
  label: string;
  /** The full path or URL segment associated with this breadcrumb item. */
  url: string;
  /** Indicates if this is the last item in the breadcrumb trail (the current page). */
  isCurrent: boolean;
}