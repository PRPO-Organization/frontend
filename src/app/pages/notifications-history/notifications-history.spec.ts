import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsHistory } from './notifications-history';

describe('NotificationsHistory', () => {
  let component: NotificationsHistory;
  let fixture: ComponentFixture<NotificationsHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
