import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketUpPage } from './ticket-up.page';

describe('TicketUpPage', () => {
  let component: TicketUpPage;
  let fixture: ComponentFixture<TicketUpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketUpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
