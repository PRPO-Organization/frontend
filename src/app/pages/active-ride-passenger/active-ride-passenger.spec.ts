import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRidePassenger } from './active-ride-passenger';

describe('ActiveRidePassenger', () => {
  let component: ActiveRidePassenger;
  let fixture: ComponentFixture<ActiveRidePassenger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveRidePassenger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveRidePassenger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
