import { authUtils } from '../auth'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('authUtils', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('setAuth', () => {
    it('should save token and user to localStorage', () => {
      const token = 'test-token'
      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      }

      authUtils.setAuth(token, user)

      expect(localStorage.getItem('token')).toBe(token)
      expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(user)
    })
  })

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'test-token'
      localStorage.setItem('token', token)

      expect(authUtils.getToken()).toBe(token)
    })

    it('should return null if token does not exist', () => {
      expect(authUtils.getToken()).toBeNull()
    })
  })

  describe('getUser', () => {
    it('should return user from localStorage', () => {
      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      }
      localStorage.setItem('user', JSON.stringify(user))

      expect(authUtils.getUser()).toEqual(user)
    })

    it('should return null if user does not exist', () => {
      expect(authUtils.getUser()).toBeNull()
    })

    it('should return null if user data is invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json')

      expect(authUtils.getUser()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('token', 'test-token')

      expect(authUtils.isAuthenticated()).toBe(true)
    })

    it('should return false if token does not exist', () => {
      expect(authUtils.isAuthenticated()).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true if user role is admin', () => {
      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      }
      localStorage.setItem('user', JSON.stringify(user))

      expect(authUtils.isAdmin()).toBe(true)
    })

    it('should return false if user role is not admin', () => {
      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      }
      localStorage.setItem('user', JSON.stringify(user))

      expect(authUtils.isAdmin()).toBe(false)
    })

    it('should return false if user does not exist', () => {
      expect(authUtils.isAdmin()).toBe(false)
    })
  })

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify({ id: '1' }))

      authUtils.logout()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })
})
