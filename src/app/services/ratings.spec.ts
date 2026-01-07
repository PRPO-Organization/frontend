import { TestBed } from '@angular/core/testing';

import { Ratings } from './ratings';

describe('Ratings', () => {
  let service: Ratings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ratings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
