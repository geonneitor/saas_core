import { create } from 'zustand';

interface BookingState {
  isModalOpen: boolean;
  prefilledData: {
    clientName?: string;
    notes?: string;
    suggestedTime?: string;
  } | null;
  openModal: (data?: any) => void;
  closeModal: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  isModalOpen: false,
  prefilledData: null,
  openModal: (data) => set({ isModalOpen: true, prefilledData: data || null }),
  closeModal: () => set({ isModalOpen: false, prefilledData: null }),
}));
