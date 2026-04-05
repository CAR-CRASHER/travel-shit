
export enum ActivityType {
  FOOD = 'Food',
  SIGHTSEEING = 'Sightseeing',
  TRANSPORT = 'Transport',
  HOTEL = 'Hotel',
  SHOPPING = 'Shopping'
}

export enum BookingType {
  FLIGHT = 'Flight',
  ACCOMMODATION = 'Accommodation',
  TICKET = 'Ticket'
}

export enum ShoppingCategory {
  SNACKS = '零食',
  SOUVENIRS = '手信',
  COSMETICS = '藥妝',
  CLOTHING = '衣物',
  ACCESSORIES = '服式',
  ELECTRONICS = '電器',
  PLUSHIES = '公仔',
  OTHERS = '其他'
}

export interface ShoppingItem {
  id: string;
  name: string;
  location: string;
  category: ShoppingCategory;
  bought: boolean;
}

export interface Activity {
  id: string;
  time: string;
  type: ActivityType;
  location: string;
  note?: string;
  cost: number;
}

export interface Booking {
  id: string;
  type: BookingType;
  title: string;
  date: string;
  time?: string;
  location: string;
  confirmationCode?: string;
  note?: string;
  airline?: string;
  flightNumber?: string;
  terminal?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface DailyItinerary {
  day: number;
  date: string;
  weather?: {
    condition: 'Sunny' | 'Cloudy' | 'CloudSun' | 'Rain' | 'Snow';
    tempMin: number;
    tempMax: number;
  };
  activities: Activity[];
}

export interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
}

export interface TripBudget {
  total: number;
  spent: number;
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'ongoing' | 'completed';
  coverImage: string;
  dailyItinerary: DailyItinerary[];
  bookings: Booking[];
  budget: TripBudget;
  checklist: ChecklistItem[];
  shoppingList: ShoppingItem[];
}

export interface AppState {
  trips: Trip[];
}
