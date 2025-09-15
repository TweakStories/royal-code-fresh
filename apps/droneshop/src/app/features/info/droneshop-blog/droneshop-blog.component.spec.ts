import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneshopBlogComponent } from './droneshop-blog.component';

describe('DroneshopBlogComponent', () => {
  let component: DroneshopBlogComponent;
  let fixture: ComponentFixture<DroneshopBlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroneshopBlogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroneshopBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
