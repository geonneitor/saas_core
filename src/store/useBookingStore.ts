import { create } from 'zustand';

interface BookingState {
  isModalOpen: boolean;
  prefilledData: {
    clientName?: string;
    notes?: string;
    suggestedTime?: string;
  } | null;
  // [16726] Tipos estrictos (Sprint 3.3)
  openModal: (data?: BookingState['prefilledData']) => void;
  closeModal: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  isModalOpen: false,
  prefilledData: null,
  openModal: (data) => set({ isModalOpen: true, prefilledData: data || null }),
  closeModal: () => set({ isModalOpen: false, prefilledData: null }),
}));
