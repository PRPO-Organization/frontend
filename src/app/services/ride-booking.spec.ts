import { TestBed } from '@angular/core/testing';

import { RideBooking } from './ride-booking';

describe('RideBooking', () => {
  let service: RideBooking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideBooking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
