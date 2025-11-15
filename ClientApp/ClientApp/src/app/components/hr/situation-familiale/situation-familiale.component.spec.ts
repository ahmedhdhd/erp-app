import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituationFamilialeComponent } from './situation-familiale.component';

describe('SituationFamilialeComponent', () => {
  let component: SituationFamilialeComponent;
  let fixture: ComponentFixture<SituationFamilialeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SituationFamilialeComponent]
    });
    fixture = TestBed.createComponent(SituationFamilialeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
