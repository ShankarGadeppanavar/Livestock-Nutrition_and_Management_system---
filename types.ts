
export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Farm Manager',
  WORKER = 'Worker',
  VET = 'Vet/Nutritionist'
}

export enum PigGroup {
  PIGLET = 'Piglet',
  PREGNANT = 'Pregnant',
  GROWER = 'Grower',
  ADULT = 'Adult',
  QUARANTINE = 'Sick/Quarantine'
}

export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum FeedStatus {
  OK = 'OK',
  UNDERFED = 'Underfed',
  MISSED = 'Missed',
  PENDING = 'Pending'
}

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string;
  role: UserRole;
}

export interface Pig {
  id: string;
  tagId: string;
  name: string;
  dob: string;
  group: PigGroup;
  sex: Sex;
  breed: string;
  weight: number;
  weightHistory: { date: string; value: number }[];
  isPregnant: boolean;
  photoUrl: string;
  lastIntakeKg: number;
  status: FeedStatus;
}

export interface GroupProfile {
  id: PigGroup;
  name: string;
  baseRationPerKg: number; // kg of feed per kg of body weight
}

export interface FeedType {
  id: string;
  name: string;
  protein: number;
  energy: number;
  costPerKg: number;
}

export interface FeedEvent {
  id: string;
  timestamp: string;
  group: PigGroup;
  feedType: string;
  totalKg: number;
  method: string;
  recordedBy: string;
  overrides: Record<string, 'ate' | 'missed' | 'partial'>;
}

export interface AppState {
  pigs: Pig[];
  feedEvents: FeedEvent[];
  currentUser: UserProfile | null;
}
