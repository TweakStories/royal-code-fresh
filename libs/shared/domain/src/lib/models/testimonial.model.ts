import { Image } from './media/media.model';

export interface Testimonial {
  id: string;
  quoteKey: string; // i18n key for the testimonial text
  authorName: string;
  authorTitleKey: string; // i18n key for the author's title/role
  authorCompany: string;
  authorImage?: Image;
}