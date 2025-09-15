import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { Review } from '@royal-code/features/reviews/domain';

/**
 * Type alias voor een functie die een enkel item van type TIn naar type TOut mapt.
 */
export type ItemMapperFn<TIn, TOut> = (item: TIn) => TOut;

@Injectable({
  providedIn: 'root', // Maak de service globaal beschikbaar via DI
})
export class MapperService {


  /**
   * Mapt een array van items (TIn) naar een nieuwe array (TOut)
   * met behulp van een opgegeven mapper-functie, synchroon.
   * Handelt null/undefined input af door een lege array te retourneren.
   *
   * @template TIn Het input type van de items in de array.
   * @template TOut Het output type van de items in de resulterende array.
   * @param inputArray De input array (of null/undefined).
   * @param mapperFn De functie die een enkel TIn item omzet naar een TOut item.
   * @returns Een nieuwe array met TOut items, of een lege array.
   */
  mapArray<TIn, TOut>(
    inputArray: TIn[] | null | undefined,
    mapperFn: ItemMapperFn<TIn, TOut>
  ): TOut[] {
    if (!inputArray) {
      return []; // Veilige fallback voor null of undefined input
    }
    // De kern: pas de meegegeven mapper toe op elk item
    return inputArray.map(mapperFn);
  }

  /**
   * Mapt een Observable stream van item-arrays (Observable<TIn[]>)
   * naar een nieuwe Observable stream (Observable<TOut[]>)
   * met behulp van een opgegeven mapper-functie.
   *
   * @template TIn Het input type van de items in de array binnen de Observable.
   * @template TOut Het output type van de items in de resulterende array binnen de Observable.
   * @param inputStream$ De input Observable stream.
   * @param mapperFn De functie die een enkel TIn item omzet naar een TOut item.
   * @returns Een nieuwe Observable stream met TOut arrays.
   */
  mapObservable<TIn, TOut>(
    inputStream$: Observable<TIn[]>,
    mapperFn: ItemMapperFn<TIn, TOut>
  ): Observable<TOut[]> {
    return inputStream$.pipe(
      // Gebruik de synchrone mapArray binnen de RxJS map operator
      map(inputArray => this.mapArray(inputArray, mapperFn))
    );
  }

  /**
   * Mapt een enkel item (TIn) naar een ander type (TOut), synchroon.
   * Handig als je soms ook losse objecten moet mappen.
   * Handelt null/undefined input af door null terug te geven.
   *
   * @template TIn Het input type van het item.
   * @template TOut Het output type van het resulterende item.
   * @param item Het input item (of null/undefined).
   * @param mapperFn De functie die het TIn item omzet naar een TOut item.
   * @returns Het TOut item, of null als de input null/undefined was.
   */
  mapSingle<TIn, TOut>(
      item: TIn | null | undefined,
      mapperFn: ItemMapperFn<TIn, TOut>
  ): TOut | null {
      if (!item) {
          return null;
      }
      return mapperFn(item);
  }

   /**
   * Mapt een Observable stream van een enkel item (Observable<TIn>)
   * naar een nieuwe Observable stream (Observable<TOut>)
   * met behulp van een opgegeven mapper-functie.
   * Handelt null/undefined input af.
   *
   * @template TIn Het input type van het item binnen de Observable.
   * @template TOut Het output type van het item binnen de resulterende Observable.
   * @param item$ De input Observable stream.
   * @param mapperFn De functie die het TIn item omzet naar een TOut item.
   * @returns Een nieuwe Observable stream met een TOut item of null.
   */
  mapSingleObservable<TIn, TOut>(
    item$: Observable<TIn | null | undefined>,
    mapperFn: ItemMapperFn<TIn, TOut>
  ): Observable<TOut | null> {
    return item$.pipe(
      map(item => this.mapSingle(item, mapperFn))
    );
  }


  mapReviewToUiReview(review: Review /*, evt. translate?: TranslateService */): Review {
    // Helper functie voor datum (kan ook uit een util gehaald worden)
    const formatDate = (dateInfo: DateTimeInfo | undefined): string | undefined => {
       if (!dateInfo?.timestamp) return undefined;
       try {
           return new Date(dateInfo.timestamp).toLocaleDateString(/* locale */);
       } catch { return undefined; }
    };

    return {
  id: review.id || '',
  profile: review.profile,
  targetEntityId: review.targetEntityId || '',
  targetEntityType: review.targetEntityType,
  rating: review.rating || 0,
  reviewText: review.reviewText || '',
  isVerifiedPurchase: review.isVerifiedPurchase || false,
  likes: review.likes || 0,
  dislikes: review.dislikes || 0,
  status: review.status,
  createdAt: review.createdAt,
  mediaCount: review.mediaCount || 0,
  replyCount: review.replyCount || 0
};
}

}

