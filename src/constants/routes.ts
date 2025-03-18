export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    CALLBACK: '/api/auth/callback'
  },
  BOARDS: {
    ROOT: '/boards',
    VIEW: (id: string) => `/boards/${id}`,
    API: {
      ROOT: '/api/boards',
      DETAIL: (id: string) => `/api/boards/${id}`
    }
  },
  API: {
    USERS: {
      ROOT: '/api/users',
      SEARCH: '/api/users/search'
    }
  }
} as const;

export function createBoardPath(id: string) {
  return ROUTES.BOARDS.VIEW(id);
}

export function createBoardApiPath(id: string) {
  return ROUTES.BOARDS.API.DETAIL(id);
}
