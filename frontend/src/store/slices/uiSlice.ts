import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  activeTab: string;
  selectedLeadId: string | null;
  isDistributionModalOpen: boolean;
  isImportModalOpen: boolean;
  selectedStageFilter: string | null;
}

const initialState: UIState = {
  activeTab: 'overview',
  selectedLeadId: null,
  isDistributionModalOpen: false,
  isImportModalOpen: false,
  selectedStageFilter: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveTab: (state: UIState, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSelectedLeadId: (state: UIState, action: PayloadAction<string | null>) => {
      state.selectedLeadId = action.payload;
    },
    setDistributionModalOpen: (state: UIState, action: PayloadAction<boolean>) => {
      state.isDistributionModalOpen = action.payload;
    },
    setImportModalOpen: (state: UIState, action: PayloadAction<boolean>) => {
      state.isImportModalOpen = action.payload;
    },
    setSelectedStageFilter: (state: UIState, action: PayloadAction<string | null>) => {
      state.selectedStageFilter = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setSelectedLeadId,
  setDistributionModalOpen,
  setImportModalOpen,
  setSelectedStageFilter,
} = uiSlice.actions;

export default uiSlice.reducer;
