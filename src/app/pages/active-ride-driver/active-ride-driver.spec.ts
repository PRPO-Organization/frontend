import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRideDriver } from './active-ride-driver';

describe('ActiveRideDriver', () => {
  let component: ActiveRideDriver;
  let fixture: ComponentFixture<ActiveRideDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveRideDriver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveRideDriver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
