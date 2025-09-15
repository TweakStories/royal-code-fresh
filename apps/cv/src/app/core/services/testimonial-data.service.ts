/**
 * @file testimonial-data.service.ts (CV App)
 * @version 1.1.0 (Corrected Image Data)
 * @description Service to provide testimonial data, with corrected authorImage model.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Testimonial } from '@royal-code/shared/domain';
import { MediaType } from '@royal-code/shared/domain';

@Injectable({
  providedIn: 'root'
})
export class TestimonialDataService {
  private readonly testimonials: Testimonial[] = [
    {
      id: 'testimonial-1',
      quoteKey: 'cv.testimonials.quote1',
      authorName: 'Jane Doe',
      authorTitleKey: 'cv.testimonials.author1_title',
      authorCompany: 'Tech Solutions Inc.',
      authorImage: { id: 'author-1', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp', purpose: 'avatar' }] }
    },
    {
      id: 'testimonial-2',
      quoteKey: 'cv.testimonials.quote2',
      authorName: 'John Smith',
      authorTitleKey: 'cv.testimonials.author2_title',
      authorCompany: 'Innovate Corp.',
      authorImage: { id: 'author-2', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp', purpose: 'avatar' }] }
    },
    // NIEUWE TESTIMONIAL: Jasper Kruit
    {
      id: 'testimonial-jasper-kruit',
      quoteKey: 'cv.testimonials.quoteJasperKruit', // Nieuwe vertaalsleutel voor de quote
      authorName: 'Jasper Kruit',
      authorTitleKey: 'cv.testimonials.authorJasperKruit_title', // Nieuwe vertaalsleutel voor de titel
      authorCompany: 'Crypto Client', // Bedrijf kan een simpele aanduiding zijn
      authorImage: { id: 'author-jasper', type: MediaType.IMAGE, variants: [{ url: 'images/default-image.webp', purpose: 'avatar' }] } // Standaard avatar, tenzij specifieke afbeelding beschikbaar is
    }
  ];


  getTestimonials(): Observable<Testimonial[]> {
    return of(this.testimonials);
  }
}