import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryPage } from './itinerary.page';

describe('ItineraryPage', () => {
  let component: ItineraryPage;
  let fixture: ComponentFixture<ItineraryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryPage);
    component = fixture.componentInstance;
    // Avoid real toast overlays in unit tests
    spyOn<any>(component, 'toast').and.resolveTo();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with two days', () => {
    expect(component.days.length).toBe(2);
    expect(component.tripDates).toContain('Oct 12 – 13, 2026');
  });

  it('should open the modal in add mode', () => {
    component.openAdd();
    expect(component.isModalOpen).toBeTrue();
    expect(component.editingId).toBeNull();
  });

  it('should not save when required fields are missing', async () => {
    component.openAdd();
    component.form.title = '';
    await component.save();
    expect(component.days[0].activities.length).toBe(3);
  });

  it('should add an activity to an existing date, sorted by time', async () => {
    component.openAdd('2026-10-12');
    component.form = { title: 'Snorkeling', location: 'Corong Beach', date: '2026-10-12', time: '11:00' };
    await component.save();

    const times = component.days[0].activities.map(a => a.time);
    expect(times).toEqual(['10:00', '11:00', '12:30', '15:00']);
    expect(component.isModalOpen).toBeFalse();
  });

  it('should create a new day when the date does not exist', async () => {
    component.openAdd();
    component.form = { title: 'Departure', location: 'El Nido Airport', date: '2026-10-14', time: '09:00' };
    await component.save();

    expect(component.days.length).toBe(3);
    expect(component.days[2].date).toBe('2026-10-14');
    expect(component.tripDates).toContain('Oct 12 – 14, 2026');
  });

  it('should edit an activity and move it to another date', async () => {
    const day = component.days[0];
    const lunch = day.activities[1];

    component.openEdit(day, lunch);
    expect(component.form.title).toBe('Lunch');

    component.form.date = '2026-10-13';
    component.form.time = '12:00';
    await component.save();

    expect(component.days[0].activities.find(a => a.id === lunch.id)).toBeUndefined();
    expect(component.days[1].activities.find(a => a.id === lunch.id)?.time).toBe('12:00');
  });

  it('should delete an activity', () => {
    const day = component.days[0];
    component.deleteActivity(day, day.activities[0]);
    expect(component.days[0].activities.length).toBe(2);
  });

  it('should remove a day when its last activity is deleted', () => {
    const day = component.days[1];
    component.deleteActivity(day, day.activities[0]);
    component.deleteActivity(day, day.activities[0]);
    expect(component.days.length).toBe(1);
  });

  it('should format times in 12-hour form', () => {
    expect(component.timeParts('00:15')).toEqual({ hour: '12:15', period: 'AM' });
    expect(component.timeParts('15:00')).toEqual({ hour: '03:00', period: 'PM' });
  });
});
