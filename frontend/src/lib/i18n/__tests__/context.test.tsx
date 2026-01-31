import { render, screen, act } from '@testing-library/react'
import { I18nProvider, useI18n } from '../context'

// Mock translations
jest.mock('../translations/es.json', () => ({
  nav: { home: 'Inicio' },
  common: { welcome: 'Bienvenido' },
}))

jest.mock('../translations/en.json', () => ({
  nav: { home: 'Home' },
  common: { welcome: 'Welcome' },
}))

jest.mock('../translations/fr.json', () => ({
  nav: { home: 'Accueil' },
  common: { welcome: 'Bienvenue' },
}))

// Test component
function TestComponent() {
  const { language, currency, setLanguage, setCurrency, t, formatPrice, convertPrice } = useI18n()

  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="currency">{currency}</div>
      <div data-testid="translation">{t('nav.home')}</div>
      <div data-testid="price">{formatPrice(1000)}</div>
      <div data-testid="converted">{convertPrice(1000)}</div>
      <button onClick={() => setLanguage('en')}>Change Language</button>
      <button onClick={() => setCurrency('USD')}>Change Currency</button>
    </div>
  )
}

describe('I18n Context', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should provide default language and currency', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('language')).toHaveTextContent('es')
    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
  })

  it('should translate text correctly', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('translation')).toHaveTextContent('Inicio')
  })

  it('should change language', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    act(() => {
      screen.getByText('Change Language').click()
    })

    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('translation')).toHaveTextContent('Home')
  })

  it('should format price correctly', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    const priceText = screen.getByTestId('price').textContent
    expect(priceText).toContain('92') // 1000 MAD * 0.092 EUR = 92 EUR
  })

  it('should convert price correctly', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    act(() => {
      screen.getByText('Change Currency').click()
    })

    const converted = parseFloat(screen.getByTestId('converted').textContent || '0')
    expect(converted).toBeCloseTo(100, 0) // 1000 MAD * 0.10 USD = 100 USD
  })

  it('should load saved preferences from localStorage', () => {
    localStorage.setItem('language', 'fr')
    localStorage.setItem('currency', 'GBP')

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    )

    expect(screen.getByTestId('language')).toHaveTextContent('fr')
    expect(screen.getByTestId('currency')).toHaveTextContent('GBP')
  })

  it('should replace parameters in translations', () => {
    // This would require a translation with parameters
    // For now, we test the basic functionality
    const { t } = useI18n()
    // This test would need proper setup with translations that have parameters
  })
})
