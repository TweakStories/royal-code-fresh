import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonOutputViewerFeatureComponent } from './json-output-viewer-feature.component';

describe('JsonOutputViewerFeatureComponent', () => {
  let component: JsonOutputViewerFeatureComponent;
  let fixture: ComponentFixture<JsonOutputViewerFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonOutputViewerFeatureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonOutputViewerFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
