import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatDePaieComponent } from './etat-de-paie.component';

describe('EtatDePaieComponent', () => {
  let component: EtatDePaieComponent;
  let fixture: ComponentFixture<EtatDePaieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtatDePaieComponent]
    });
    fixture = TestBed.createComponent(EtatDePaieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
