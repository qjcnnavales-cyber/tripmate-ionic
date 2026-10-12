import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonModal,
  IonInput,
  AlertController,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  addOutline,
  calendarOutline,
  locationOutline,
  createOutline,
  trashOutline,
  closeOutline
} from 'ionicons/icons';

export interface Activity {
  id: number;
  title: string;
  location: string;
  time: string; // 24h "HH:mm"
  image: string;
}

export interface ItineraryDay {
  date: string; // "YYYY-MM-DD"
  title: string;
  activities: Activity[];
}

@Component({
  selector: 'app-itinerary',
  templateUrl: './itinerary.page.html',
  styleUrls: ['./itinerary.page.scss'],

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonModal,
    IonInput,
    CommonModule,
    FormsModule
  ]
})

export class ItineraryPage implements OnInit {

  /* Image used for newly added activities (rotates through these) */
  private defaultImages: string[] = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
  ];

  private nextId = 100;

  /* Currently expanded accordion (date string) */
  openDay = '2026-10-12';

  /* Same data that was previously hard-coded in the HTML */
  days: ItineraryDay[] = [
    {
      date: '2026-10-12',
      title: 'Arrival & Exploration',
      activities: [
        {
          id: 1,
          title: 'Check-in',
          location: 'Kubo Homestay, El Nido',
          time: '10:00',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 2,
          title: 'Lunch',
          location: 'Artcafe, Town Proper',
          time: '12:30',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 3,
          title: 'Beach Walk',
          location: 'Nacpan Beach',
          time: '15:00',
          image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    {
      date: '2026-10-13',
      title: 'Island Hopping Tour A',
      activities: [
        {
          id: 4,
          title: 'Meetup',
          location: 'El Nido Port',
          time: '08:00',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 5,
          title: 'Big Lagoon',
          location: 'Miniloc Island',
          time: '09:30',
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
        }
      ]
    }
  ];

  /* ---------- Modal / form state ---------- */
  isModalOpen = false;
  isEditing = false;
  submitted = false;

  private editingId: number | null = null;
  private editingFromDate: string | null = null;

  form = {
    title: '',
    location: '',
    date: '',
    time: ''
  };

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      addOutline,
      calendarOutline,
      locationOutline,
      createOutline,
      trashOutline,
      closeOutline
    });
  }

  ngOnInit() {
  }

  /* =========================================
     DISPLAY HELPERS
  ========================================= */

  displayTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  meridiem(time: string): string {
    return Number(time.split(':')[0]) >= 12 ? 'PM' : 'AM';
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  /* =========================================
     MODAL
  ========================================= */

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.editingFromDate = null;
    this.submitted = false;

    this.form = {
      title: '',
      location: '',
      date: this.openDay || this.days[0]?.date || '',
      time: ''
    };

    this.isModalOpen = true;
  }

  openEditModal(activity: Activity, day: ItineraryDay) {
    this.isEditing = true;
    this.editingId = activity.id;
    this.editingFromDate = day.date;
    this.submitted = false;

    this.form = {
      title: activity.title,
      location: activity.location,
      date: day.date,
      time: activity.time
    };

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  /* =========================================
     SAVE (ADD / EDIT)
  ========================================= */

  async saveActivity() {
    this.submitted = true;

    const title = this.form.title.trim();
    const location = this.form.location.trim();
    const date = this.normalizeDate(this.form.date);
    const time = this.normalizeTime(this.form.time);

    if (!title || !location || !date || !time) {
      return;
    }

    let image = this.defaultImages[this.nextId % this.defaultImages.length];

    /* Editing: take the activity out of its old day first */
    if (this.isEditing && this.editingId !== null && this.editingFromDate) {
      const oldDay = this.days.find(d => d.date === this.editingFromDate);
      const existing = oldDay?.activities.find(a => a.id === this.editingId);

      if (oldDay && existing) {
        image = existing.image;
        oldDay.activities = oldDay.activities.filter(a => a.id !== this.editingId);
      }
    }

    /* Find the day for the chosen date, or create it */
    let day = this.days.find(d => d.date === date);

    if (!day) {
      day = { date, title: 'Planned Activities', activities: [] };
      this.days.push(day);
      this.days.sort((a, b) => a.date.localeCompare(b.date));
    }

    day.activities.push({
      id: this.isEditing && this.editingId !== null ? this.editingId : this.nextId++,
      title,
      location,
      time,
      image
    });

    day.activities.sort((a, b) => a.time.localeCompare(b.time));

    this.openDay = date;
    this.isModalOpen = false;

    const toast = await this.toastCtrl.create({
      message: this.isEditing ? 'Activity updated' : 'Activity added',
      duration: 1800,
      position: 'bottom'
    });
    await toast.present();
  }

  /* =========================================
     DELETE
  ========================================= */

  async deleteActivity(activity: Activity, day: ItineraryDay) {
    const alert = await this.alertCtrl.create({
      header: 'Delete activity?',
      message: `"${activity.title}" will be removed from your itinerary.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            day.activities = day.activities.filter(a => a.id !== activity.id);
          }
        }
      ]
    });

    await alert.present();
  }

  /* =========================================
     TRACKING
  ========================================= */

  trackDay(_: number, day: ItineraryDay) {
    return day.date;
  }

  trackActivity(_: number, activity: Activity) {
    return activity.id;
  }

  /* =========================================
     INPUT NORMALIZERS
     (ion-input type="date"/"time" return "YYYY-MM-DD" / "HH:mm")
  ========================================= */

  private normalizeDate(value: string): string {
    return (value || '').substring(0, 10);
  }

  private normalizeTime(value: string): string {
    return (value || '').substring(0, 5);
  }

}
