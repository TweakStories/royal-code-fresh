import { DynamicTitleDirective } from "./dynamic-title.directive";
import { ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
  let el: ElementRef;
  let renderer: Renderer2;

  beforeEach(() => {
    const testBed = TestBed.configureTestingModule({});
    el = testBed.inject(ElementRef);
    renderer = testBed.inject(Renderer2);
  });

  it('should create an instance', () => {
    const directive = new DynamicTitleDirective(el, renderer);
    expect(directive).toBeTruthy();
  });
