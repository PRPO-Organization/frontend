import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateDriver } from './rate-driver';

describe('RateDriver', () => {
  let component: RateDriver;
  let fixture: ComponentFixture<RateDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateDriver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateDriver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
