import { ChangeDetectorRef, Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Pipe({
  name: 'safeAsync',
  pure: false,
  standalone: true,
})
export class SafeAsyncPipe implements PipeTransform, OnDestroy {
  private asyncPipe: AsyncPipe;

  constructor(private cdr: ChangeDetectorRef) {
    this.asyncPipe = new AsyncPipe(this.cdr);
  }

  transform<T>(obj: Observable<T>): T {
    const value = this.asyncPipe.transform(obj);
    if (value === null || value === undefined) {
      return {} as T; // Return an empty object or appropriate default value
    }
    return value;
  }

  ngOnDestroy() {
    if (this.asyncPipe) {
      this.asyncPipe.ngOnDestroy();
    }
  }
}
