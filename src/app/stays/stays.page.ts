import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthButtonsComponent } from '../components/auth-buttons/auth-buttons.component';
import { IonContent, IonHeader, IonTitle, IonToolbar , IonMenuButton } from '@ionic/angular';

interface Listing {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  guests: number;
  amenities: string[];
  img: string;
}

@Component({
  selector: 'app-stays',
  templateUrl: './stays.page.html',
  styleUrls: ['./stays.page.scss'],
  imports: [AuthButtonsComponent, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class StaysPage implements OnInit {
  listings: Listing[] = [
    {
        id: 'happy-hut', name: 'Happy Hut', type: 'Cabin',
        location: 'San Felipe, Zambales', price: 2000, rating: 4.92, reviews: 86, guests: 4,
        amenities: ['Wifi', 'Kitchen', 'Beachfront', 'Pet friendly'],
        img: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/630810990.jpg?k=f0a258fd952f19c7285f4e99e64664bc423cd779166b639a29d87037cb90b2ac&o='
    },
    {
        id: 'kuadro-hotel-and-suites', name: 'Kuadro Hotel and Suites', type: 'Hotel',
        location: 'Moalboal, Cebu', price: 2200, rating: 4.85, reviews: 214, guests: 2,
        amenities: ['Wifi', 'Pool', 'Air conditioning'],
        img: 'https://cfstatic.staah.net/w*2000/big_14581_1781579948247.jpeg?k=902NTY78jA7cf8c8n6pumZFmK2Mco8np8opi9tGUj4XocTHBQ7c5MTM='
    },
    {
        id: 'baey-bogan-homestay', name: 'Baey bogan Homestay', type: 'House rental',
        location: 'Sagada, Mountain Province', price: 1800, rating: 4.28, reviews: 63, guests: 4,
        amenities: ['Wifi', 'Kitchen', 'Air conditioning'],
        img: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/184656762.jpg?k=03df05cdd232e5aec61fb79b29314d5d84e8eb5904f33efa84a05dd9b1800e80&o='
    },
    {
        id: 'baguio-holiday-villas', name: 'Baguio Holiday Villas', type: 'Villa',
        location: 'Baguio City, Benguet', price: 4300, rating: 4.92, reviews: 128, guests: 6,
        amenities: ['Wifi', 'Kitchen', 'Air conditioning', 'Pet friendly'],
        img: 'https://pix8.agoda.net/hotelImages/275905/0/2bfa720cb4d3471781e35efcbe6c3dfe.jpg?ce=2&s=375x'
    },
    {
        id: 'alon-resort', name: 'Alon Resort', type: 'Resort',
        location: 'General Luna, Siargao', price: 2900, rating: 4.88, reviews: 171, guests: 4,
        amenities: ['Wifi', 'Beachfront', 'Kitchen'],
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVJ03F6aGc6mGqRA_pNPSmADp1ioMW0JHRVKb4OFcFnztKn03YanWUbPk&s=10'
    },
    {
        id: 'kubo-homestay', name: 'Kubo Homestay', type: 'Cabin',
        location: 'El Nido, Palawan', price: 3600, rating: 4.95, reviews: 97, guests: 4,
        amenities: ['Wifi', 'Beachfront'],
        img: 'https://a0.muscache.com/im/pictures/d64b6a63-3599-4fa3-a6dc-3062a952202b.jpg?im_w=720'
    },
    {
        id: 'ivatan-stone-house', name: 'Ivatan Stone House', type: 'House rental',
        location: 'Basco, Batanes', price: 2600, rating: 4.98, reviews: 41, guests: 2,
        amenities: ['Wifi', 'Kitchen', 'Pet friendly'],
        img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/1d/9d/8d/house-of-dakay-in-ivana.jpg?w=900&h=500&s=1'
    },
    {
        id: 'astoria-current', name: 'Astoria Current', type: 'Resort',
        location: 'Boracay, Aklan', price: 5800, rating: 4.9, reviews: 342, guests: 4,
        amenities: ['Wifi', 'Pool', 'Beachfront', 'Air conditioning'],
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7DjJY2wWxNmj-AVl2FuBM8tT99YqVb3U2AO-5srMWWAkFKwRowBoNAb9I&s=10'
    },
    {
        id: 'sunset-villa', name: 'Sunset Villa', type: 'Villa',
        location: 'Coron, Palawan', price: 5200, rating: 4.94, reviews: 118, guests: 8,
        amenities: ['Wifi', 'Pool', 'Kitchen', 'Beachfront'],
        img: 'https://discovery.s14-host.com/qkUByrarp5PILHjccAD3jHDhtozxLY-metaU3Vuc2V0LVZpbGxhLURlbHV4ZS1WZXJhbmRhLmpwZw==-.jpg'
    },
    {
        id: 'summit-ridge-hotel', name: 'Summit Ridge Hotel', type: 'Hotel',
        location: 'Tagaytay, Cavite', price: 3100, rating: 4.7, reviews: 256, guests: 2,
        amenities: ['Wifi', 'Air conditioning', 'Pool'],
        img: 'https://q-xx.bstatic.com/xdata/images/hotel/max500/706396016.jpg?k=3529c641d8fd7b530aad8996d0a01cbf7ae799a6003388650f33a1823a3fd0d3&o='
    },
    {
        id: 'la-casa-ramirez', name: 'La Casa Ramirez', type: 'Hotel',
        location: 'Vigan, Ilocos Sur', price: 2200, rating: 4.8, reviews: 132, guests: 3,
        amenities: ['Wifi', 'Air conditioning'],
        img: 'https://pix8.agoda.net/property/63493626/0/3391d813834943320c8e241cfe585d82.jpeg?ce=3&s=600x'
    },
    {
        id: 'backpackers-travelers-inn', name: 'Backpackers Travelers Inn', type: 'Cabin',
        location: 'Valencia, Negros Oriental', price: 900, rating: 4.87, reviews: 74, guests: 10,
        amenities: ['Wifi', 'Pet friendly'],
        img: 'https://pix8.agoda.net/hotelImages/85348252/0/b294dc4f9636bff3a7f896491fd591cc.jpg?ce=3&s=600x'
    }
  ];
  
  results: Listing[] = [];
  
  search: string = "";
  types: Set<string> = new Set();
  amenities: Set<string> = new Set();
  minPrice: number = 800;
  maxPrice: number = 6000;
  minRating: number = 0;
  guests: number = 1;
  sort: string = "recommended";
  favorites: Set<string> = new Set();
  
  priceBounds = { min: 800, max: 6000 };
  isFiltersOpen: boolean = false;
  currentUser: any = null;
  
  typeOptions = ['House rental', 'Hotel', 'Cabin', 'Villa', 'Resort'];
  amenityOptions = ['Wifi', 'Pool', 'Kitchen', 'Air conditioning', 'Beachfront', 'Pet friendly'];

  activeChips: any[] = [];
  
  constructor(private route: ActivatedRoute) { }
  
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem("tripmate_user") || "null");
    try {
        const saved = JSON.parse(localStorage.getItem("tripmate_wishlist") || "[]");
        saved.filter((item: any) => !this.currentUser || item.userId === this.currentUser.id)
             .forEach((item: any) => this.favorites.add(item.propertyId));
    } catch {}
    
    try {
        const hostListings = JSON.parse(localStorage.getItem("tripmate_listings") || "[]");
        hostListings.filter((item: any) => item.status === "published" || item.status === "active").forEach((item: any) => {
            this.listings.push({
                id: item.id,
                name: item.title || "TripMate stay",
                type: item.propertyType || "House rental",
                location: item.location || "Philippines",
                price: Number(item.pricePerNight) || 0,
                rating: Number(item.rating) || 5,
                reviews: Number(item.reviews) || 0,
                guests: Number(item.maxGuests) || 1,
                amenities: item.amenities || [],
                img: item.images?.[0] || ""
            });
        });
    } catch {}

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.search = params['search'];
      }
      this.applyFilters();
    });
  }

  focusSearch() {
    const input = document.getElementById('searchInput') as HTMLInputElement;
    if (input) input.focus();
  }
  
  applyFilters() {
    let out = this.listings.filter((l) => {
        if (this.search) {
            const hay = (l.name + " " + l.location).toLowerCase();
            if (!hay.includes(this.search.toLowerCase())) return false;
        }
        if (this.types.size && !this.types.has(l.type)) return false;
        if (l.price < this.minPrice || l.price > this.maxPrice) return false;
        if (l.rating < this.minRating) return false;
        if (l.guests < this.guests) return false;
        if (this.amenities.size) {
            for (const a of this.amenities) {
                if (!l.amenities.includes(a)) return false;
            }
        }
        return true;
    });

    switch (this.sort) {
        case "price-asc": out.sort((a, b) => a.price - b.price); break;
        case "price-desc": out.sort((a, b) => b.price - a.price); break;
        case "rating-desc": out.sort((a, b) => b.rating - a.rating); break;
        default: out.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
    }
    this.results = out;
    this.updateChips();
  }
  
  updateChips() {
    const chips: any[] = [];
    if (this.search) chips.push({ key: "search", label: '"' + this.search + '"' });
    this.types.forEach((t) => chips.push({ key: "type", value: t, label: t }));
    this.amenities.forEach((a) => chips.push({ key: "amenity", value: a, label: a }));
    if (this.minRating > 0) chips.push({ key: "rating", label: this.minRating + "+ rating" });
    if (this.guests > 1) chips.push({ key: "guests", label: this.guests + "+ guests" });
    if (this.minPrice !== this.priceBounds.min || this.maxPrice !== this.priceBounds.max) {
        chips.push({ key: "price", label: "₱" + this.minPrice.toLocaleString() + " - ₱" + this.maxPrice.toLocaleString() });
    }
    this.activeChips = chips;
  }

  removeChip(chip: any) {
    const key = chip.key;
    const value = chip.value;
    if (key === "search") { this.search = ""; }
    if (key === "type") { this.types.delete(value); }
    if (key === "amenity") { this.amenities.delete(value); }
    if (key === "rating") { this.minRating = 0; }
    if (key === "guests") { this.guests = 1; }
    if (key === "price") { this.minPrice = this.priceBounds.min; this.maxPrice = this.priceBounds.max; }
    this.applyFilters();
  }

  toggleFavorite(event: Event, id: string) {
    event.preventDefault();
    if (this.favorites.has(id)) {
        this.favorites.delete(id);
    } else {
        if (!this.currentUser) {
            window.location.href = "/login?redirect=" + encodeURIComponent("/stays");
            return;
        }
        this.favorites.add(id);
    }
  }

  isFavorite(id: string) {
      return this.favorites.has(id);
  }

  getTypeCount(type: string) {
      return this.listings.filter(l => l.type === type).length;
  }

  hasType(type: string) {
      return this.types.has(type);
  }

  toggleType(type: string, event: any) {
      if (event.target.checked) this.types.add(type);
      else this.types.delete(type);
      this.applyFilters();
  }

  hasAmenity(amenity: string) {
      return this.amenities.has(amenity);
  }

  toggleAmenity(amenity: string, event: any) {
      if (event.target.checked) this.amenities.add(amenity);
      else this.amenities.delete(amenity);
      this.applyFilters();
  }

  clearAll() {
      this.search = '';
      this.types.clear();
      this.amenities.clear();
      this.minRating = 0;
      this.guests = 1;
      this.sort = 'recommended';
      this.minPrice = this.priceBounds.min;
      this.maxPrice = this.priceBounds.max;
      this.applyFilters();
  }

  getLeftPct() {
      return ((this.minPrice - this.priceBounds.min) / (this.priceBounds.max - this.priceBounds.min)) * 100;
  }

  getWidthPct() {
      const leftPct = this.getLeftPct();
      const rightPct = ((this.maxPrice - this.priceBounds.min) / (this.priceBounds.max - this.priceBounds.min)) * 100;
      return rightPct - leftPct;
  }
}



