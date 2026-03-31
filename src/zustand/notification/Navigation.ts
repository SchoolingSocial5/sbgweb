import { create } from 'zustand'

export interface NavState {
  vNav: boolean
  showHeader: boolean
  asideNav: boolean
  displayPostBox: boolean
  scrollUp: boolean
  searchedText: string
  page: number
  headerHeight: number
  mainWidth: number
  query: string
  theme: string
  togglePostBox: () => void
  setScrollUp: () => void
  setShowHeader: (state: boolean) => void
  setHeaderHeight: (height: number) => void
  setMainWidth: (height: number) => void
  toggleVNav: () => void
  toggleAsideVNav: () => void
  clearNav: () => void
  clearAsideNav: () => void
  setThemeContext: (item: string) => void
  setSearchedText: (item: string) => void
  setQuery: (item: string) => void
  setPage: (index: number) => void
}

export const NavStore = create<NavState>((set) => ({
  vNav: false,
  showHeader: true,
  scrollUp: true,
  asideNav: false,
  displayPostBox: false,
  isTraceActive: false,
  isSearching: false,
  isMainPageActive: false,
  isSearchInputExpanded: false,
  tab: '',
  searchedText: '',
  page: 1,
  mainWidth: 0,
  query: '',
  tabs: ['competitions', 'payments', 'people', 'posts', 'questions', 'schools'],
  theme: '',
  headerHeight: 0,
  toggleVNav: () => {
    set((state) => ({
      vNav: !state.vNav,
      asideNav: false,
    }))
  },
  setScrollUp: () => {
    set((state) => ({
      scrollUp: !state.scrollUp,
    }))
  },
  setShowHeader: (state: boolean) => {
    set({
      showHeader: state,
    })
  },
  setHeaderHeight: (height: number) => {
    set({
      headerHeight: height,
    })
  },
  setMainWidth: (width: number) => {
    set({
      mainWidth: width,
    })
  },

  toggleAsideVNav: () => {
    set((state) => ({
      asideNav: !state.asideNav,
      vNav: false,
    }))
  },

  togglePostBox: () => {
    set((state) => ({
      displayPostBox: !state.displayPostBox,
    }))
  },

  setPage: (index: number) => {
    set({
      page: index,
    })
  },

  clearNav: () => {
    set(() => ({
      vNav: false,
    }))
  },

  clearAsideNav: () => {
    set(() => ({
      asideNav: false,
    }))
  },

  setSearchedText: (item: string) => {
    set(() => ({
      searchedText: item,
    }))
  },

  setQuery: (item: string) => {
    set(() => ({
      query: item,
    }))
  },

  setThemeContext: (item: string) => {
    set(() => ({
      theme: item,
    }))
  },
}))
