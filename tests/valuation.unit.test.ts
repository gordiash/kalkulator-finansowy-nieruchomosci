/**
 * Testy jednostkowe - walidacja logiki biznesowej
 * @jest-environment node
 */

describe('Kalkulator Wyceny - Walidacja Logiki', () => {
  // Funkcja walidacji metrażu
  const validateArea = (value: string): boolean => {
    if (value === '') return true // pusty dozwolony
    const numValue = parseFloat(value)
    return numValue > 0 && numValue <= 1000
  }

  // Funkcja walidacji pokoi
  const validateRooms = (value: string): boolean => {
    if (value === '') return true
    const numValue = parseInt(value)
    return numValue > 0 && numValue <= 20
  }

  // Funkcja walidacji roku
  const validateYear = (value: string): boolean => {
    if (value === '') return true
    if (value.length > 4) return false
    const numValue = parseInt(value)
    const currentYear = new Date().getFullYear()
    return (value.length < 4) || (numValue >= 1800 && numValue <= currentYear + 5)
  }

  // Funkcja formatowania payload
  const formatPayload = (formData: any) => {
    return {
      city: formData.city.trim(),
      district: formData.district?.trim() || '',
      street: formData.street?.trim() || '',
      area: parseFloat(formData.area),
      rooms: parseInt(formData.rooms),
      floor: formData.floor ? parseInt(formData.floor) : 0,
      year: formData.year ? parseInt(formData.year) : undefined,
    }
  }

  describe('9.1 Walidacja wejścia', () => {
    describe('Metraż', () => {
      it('akceptuje poprawne wartości', () => {
        expect(validateArea('60')).toBe(true)
        expect(validateArea('45.5')).toBe(true)
        expect(validateArea('1000')).toBe(true)
      })

      it('odrzuca niepoprawne wartości', () => {
        expect(validateArea('0')).toBe(false)
        expect(validateArea('-10')).toBe(false)
        expect(validateArea('2000')).toBe(false)
      })

      it('pozwala na pustą wartość', () => {
        expect(validateArea('')).toBe(true)
      })
    })

    describe('Liczba pokoi', () => {
      it('akceptuje poprawne wartości', () => {
        expect(validateRooms('1')).toBe(true)
        expect(validateRooms('3')).toBe(true)
        expect(validateRooms('20')).toBe(true)
      })

      it('odrzuca niepoprawne wartości', () => {
        expect(validateRooms('0')).toBe(false)
        expect(validateRooms('-1')).toBe(false)
        expect(validateRooms('25')).toBe(false)
      })

      it('pozwala na pustą wartość', () => {
        expect(validateRooms('')).toBe(true)
      })
    })

    describe('Rok budowy', () => {
      it('akceptuje poprawne lata', () => {
        expect(validateYear('2015')).toBe(true)
        expect(validateYear('1900')).toBe(true)
        expect(validateYear('2024')).toBe(true)
      })

      it('pozwala na niepełne lata', () => {
        expect(validateYear('20')).toBe(true)
        expect(validateYear('201')).toBe(true)
      })

      it('odrzuca lata poza zakresem', () => {
        expect(validateYear('1700')).toBe(false)
        expect(validateYear('2050')).toBe(false)
      })

      it('pozwala na pustą wartość', () => {
        expect(validateYear('')).toBe(true)
      })

      it('odrzuca zbyt długie wartości', () => {
        expect(validateYear('20150')).toBe(false)
      })
    })
  })

  describe('9.1 Formatowanie payload', () => {
    it('formatuje kompletne dane', () => {
      const formData = {
        city: '  Olsztyn  ',
        district: '  Kortowo  ',
        street: '  Warszawska  ',
        area: '60',
        rooms: '3',
        floor: '2',
        year: '2015'
      }

      const result = formatPayload(formData)

      expect(result).toEqual({
        city: 'Olsztyn',
        district: 'Kortowo', 
        street: 'Warszawska',
        area: 60,
        rooms: 3,
        floor: 2,
        year: 2015
      })
    })

    it('obsługuje opcjonalne pola', () => {
      const formData = {
        city: 'Olsztyn',
        area: '45',
        rooms: '2'
      }

      const result = formatPayload(formData)

      expect(result).toEqual({
        city: 'Olsztyn',
        district: '',
        street: '',
        area: 45,
        rooms: 2,
        floor: 0,
        year: undefined
      })
    })

    it('trimuje białe znaki', () => {
      const formData = {
        city: '   Olsztyn   ',
        district: '',
        street: '',
        area: '60',
        rooms: '3'
      }

      const result = formatPayload(formData)
      expect(result.city).toBe('Olsztyn')
    })
  })

  describe('Obliczenia przedziału ufności', () => {
    const calculateConfidenceInterval = (price: number, margin: number = 0.07) => {
      const minPrice = Math.round(price * (1 - margin))
      const maxPrice = Math.round(price * (1 + margin))
      return { minPrice, maxPrice }
    }

    it('oblicza przedział ±7%', () => {
      const result = calculateConfidenceInterval(1000000)
      expect(result.minPrice).toBe(930000)
      expect(result.maxPrice).toBe(1070000)
    })

    it('obsługuje różne ceny', () => {
      const result1 = calculateConfidenceInterval(500000)
      expect(result1.minPrice).toBe(465000)
      expect(result1.maxPrice).toBe(535000)

      const result2 = calculateConfidenceInterval(650000)
      expect(result2.minPrice).toBe(604500)
      expect(result2.maxPrice).toBe(695500)
    })

    it('zaokrągla do pełnych złotych', () => {
      const result = calculateConfidenceInterval(123456)
      expect(result.minPrice).toBe(114814)
      expect(result.maxPrice).toBe(132098)
    })
  })

  describe('Walidacja miast regionu Olsztyn', () => {
    const isOlsztynRegion = (city: string): boolean => {
      const olsztynCities = [
        'Olsztyn', 'Stawiguda', 'Barczewo', 'Dywity', 
        'Jonkowo', 'Biskupiec', 'Mrągowo', 'Ostróda'
      ]
      return olsztynCities.includes(city)
    }

    it('rozpoznaje miasta z regionu', () => {
      expect(isOlsztynRegion('Olsztyn')).toBe(true)
      expect(isOlsztynRegion('Stawiguda')).toBe(true)
      expect(isOlsztynRegion('Barczewo')).toBe(true)
    })

    it('odrzuca miasta spoza regionu', () => {
      expect(isOlsztynRegion('Warszawa')).toBe(false)
      expect(isOlsztynRegion('Kraków')).toBe(false)
      expect(isOlsztynRegion('Nieznane Miasto')).toBe(false)
    })

    it('jest case-sensitive', () => {
      expect(isOlsztynRegion('olsztyn')).toBe(false)
      expect(isOlsztynRegion('OLSZTYN')).toBe(false)
    })
  })
}) 