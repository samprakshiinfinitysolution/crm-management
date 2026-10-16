import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ExecutiveState {
  selectedExecutiveId: string | null;
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
  workloadFilter: 'all' | 'optimal' | 'moderate' | 'overloaded';
  sortBy: 'winRate' | 'workload' | 'name' | 'overdue';
  viewMode: 'cards' | 'table';
  detailTab: 'leads' | 'pipeline' | 'followups' | 'activities';
  leadSearchQuery: string;
  leadStatusFilter: string;
}

const initialState: ExecutiveState = {
  selectedExecutiveId: null,
  searchQuery: '',
  statusFilter: 'all',
  workloadFilter: 'all',
  sortBy: 'winRate',
  viewMode: 'cards',
  detailTab: 'leads',
  leadSearchQuery: '',
  leadStatusFilter: 'ALL',
};

export const executiveSlice = createSlice({
  name: 'executive',
  initialState,
  reducers: {
    setSelectedExecutiveId: (state, action: PayloadAction<string | null>) => {
      state.selectedExecutiveId = action.payload;
      state.detailTab = 'leads';
      state.leadSearchQuery = '';
      state.leadStatusFilter = 'ALL';
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.statusFilter = action.payload;
    },
    setWorkloadFilter: (
      state,
      action: PayloadAction<'all' | 'optimal' | 'moderate' | 'overloaded'>
    ) => {
      state.workloadFilter = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'winRate' | 'workload' | 'name' | 'overdue'>
    ) => {
      state.sortBy = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'cards' | 'table'>) => {
      state.viewMode = action.payload;
    },
    setDetailTab: (
      state,
      action: PayloadAction<'leads' | 'pipeline' | 'followups' | 'activities'>
    ) => {
      state.detailTab = action.payload;
    },
    setLeadSearchQuery: (state, action: PayloadAction<string>) => {
      state.leadSearchQuery = action.payload;
    },
    setLeadStatusFilter: (state, action: PayloadAction<string>) => {
      state.leadStatusFilter = action.payload;
    },
    resetExecutiveFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = 'all';
      state.workloadFilter = 'all';
      state.sortBy = 'winRate';
    },
  },
});

export const {
  setSelectedExecutiveId,
  setSearchQuery,
  setStatusFilter,
  setWorkloadFilter,
  setSortBy,
  setViewMode,
  setDetailTab,
  setLeadSearchQuery,
  setLeadStatusFilter,
  resetExecutiveFilters,
} = executiveSlice.actions;

export default executiveSlice.reducer;
