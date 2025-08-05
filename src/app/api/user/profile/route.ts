import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthenticatedRequest, getCurrentUser } from '@/lib/authMiddleware';

const getProfile = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    // Pobranie danych użytkownika z bazy
    const user = await prisma.users.findUnique({
      where: { id: BigInt(currentUser.userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        date_of_birth: true,
        gender: true,
        city: true,
        postal_code: true,
        preferred_currency: true,
        income_range: true,
        investment_experience: true,
        preferred_property_type: true,
        preferred_cities: true,
        max_budget: true,
        min_area: true,
        max_area: true,
        newsletter_subscription: true,
        email_notifications: true,
        language: true,
        theme: true,
        company_name: true,
        nip: true,
        business_address: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Użytkownik nie znaleziony' }, { status: 404 });
    }

    // Konwertuj BigInt na Number dla JSON
    const userResponse = {
      ...user,
      id: Number(user.id),
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Błąd podczas pobierania profilu:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

const updateProfile = async (request: AuthenticatedRequest) => {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const {
      name,
      phone,
      date_of_birth,
      gender,
      city,
      postal_code,
      preferred_currency,
      income_range,
      investment_experience,
      preferred_property_type,
      preferred_cities,
      max_budget,
      min_area,
      max_area,
      newsletter_subscription,
      email_notifications,
      language,
      theme,
      company_name,
      nip,
      business_address,
    } = await request.json();

    // Kompleksowa walidacja danych
    const validationErrors: string[] = [];

    // 1. Walidacja podstawowych danych
    if (!name || name.trim().length === 0) {
      validationErrors.push('Imię jest wymagane');
    } else if (name.trim().length < 2) {
      validationErrors.push('Imię musi mieć co najmniej 2 znaki');
    } else if (name.trim().length > 100) {
      validationErrors.push('Imię nie może przekraczać 100 znaków');
    }

    // 2. Walidacja numeru telefonu
    if (phone && phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        validationErrors.push('Nieprawidłowy format numeru telefonu');
      }
    }

    // 3. Walidacja daty urodzenia
    if (date_of_birth) {
      const birthDate = new Date(date_of_birth);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 120); // Maksymalny wiek 120 lat
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 13); // Minimalny wiek 13 lat

      if (isNaN(birthDate.getTime())) {
        validationErrors.push('Nieprawidłowa data urodzenia');
      } else if (birthDate > today) {
        validationErrors.push('Data urodzenia nie może być w przyszłości');
      } else if (birthDate < minAge) {
        validationErrors.push('Data urodzenia wydaje się nieprawidłowa (za stara)');
      } else if (birthDate > maxAge) {
        validationErrors.push('Musisz mieć co najmniej 13 lat');
      }
    }

    // 4. Walidacja płci
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      validationErrors.push('Nieprawidłowa wartość dla pola płeć');
    }

    // 5. Walidacja miasta
    if (city && city.trim()) {
      if (city.trim().length < 2) {
        validationErrors.push('Nazwa miasta musi mieć co najmniej 2 znaki');
      } else if (city.trim().length > 100) {
        validationErrors.push('Nazwa miasta nie może przekraczać 100 znaków');
      }
    }

    // 6. Walidacja kodu pocztowego
    if (postal_code && postal_code.trim()) {
      const postalCodeRegex = /^[0-9]{2}-[0-9]{3}$/;
      if (!postalCodeRegex.test(postal_code.trim())) {
        validationErrors.push('Nieprawidłowy format kodu pocztowego (XX-XXX)');
      }
    }

    // 7. Walidacja waluty
    if (preferred_currency && !['PLN', 'EUR', 'USD'].includes(preferred_currency)) {
      validationErrors.push('Nieprawidłowa waluta');
    }

    // 8. Walidacja zakresu dochodów
    if (income_range && !['below_3000', '3000_5000', '5000_8000', '8000_12000', '12000_20000', 'above_20000'].includes(income_range)) {
      validationErrors.push('Nieprawidłowy zakres dochodów');
    }

    // 9. Walidacja doświadczenia inwestycyjnego
    if (investment_experience && !['beginner', 'intermediate', 'advanced'].includes(investment_experience)) {
      validationErrors.push('Nieprawidłowy poziom doświadczenia inwestycyjnego');
    }

    // 10. Walidacja typu nieruchomości
    if (preferred_property_type && !['apartment', 'house', 'commercial', 'land'].includes(preferred_property_type)) {
      validationErrors.push('Nieprawidłowy typ nieruchomości');
    }

    // 11. Walidacja preferowanych miast (JSON)
    if (preferred_cities && preferred_cities.trim()) {
      try {
        const cities = JSON.parse(preferred_cities);
        if (!Array.isArray(cities)) {
          validationErrors.push('Preferowane miasta muszą być tablicą');
        } else if (cities.length > 10) {
          validationErrors.push('Można dodać maksymalnie 10 preferowanych miast');
        } else {
          for (const city of cities) {
            if (typeof city !== 'string' || city.trim().length < 2) {
              validationErrors.push('Nieprawidłowe nazwy miast w preferowanych miastach');
              break;
            }
          }
        }
      } catch (error) {
        validationErrors.push('Nieprawidłowy format JSON dla preferowanych miast');
      }
    }

    // 12. Walidacja budżetu
    if (max_budget !== undefined && max_budget !== null) {
      const budget = parseFloat(max_budget.toString());
      if (isNaN(budget) || budget < 0) {
        validationErrors.push('Budżet musi być liczbą dodatnią');
      } else if (budget > 100000000) { // 100 mln zł
        validationErrors.push('Budżet nie może przekraczać 100 000 000 zł');
      }
    }

    // 13. Walidacja powierzchni
    if (min_area !== undefined && min_area !== null) {
      const minArea = parseFloat(min_area.toString());
      if (isNaN(minArea) || minArea < 0) {
        validationErrors.push('Minimalna powierzchnia musi być liczbą dodatnią');
      } else if (minArea > 10000) { // 10 000 m²
        validationErrors.push('Minimalna powierzchnia nie może przekraczać 10 000 m²');
      }
    }

    if (max_area !== undefined && max_area !== null) {
      const maxArea = parseFloat(max_area.toString());
      if (isNaN(maxArea) || maxArea < 0) {
        validationErrors.push('Maksymalna powierzchnia musi być liczbą dodatnią');
      } else if (maxArea > 10000) { // 10 000 m²
        validationErrors.push('Maksymalna powierzchnia nie może przekraczać 10 000 m²');
      }
    }

    // 14. Walidacja min_area vs max_area
    if (min_area && max_area) {
      const minArea = parseFloat(min_area.toString());
      const maxArea = parseFloat(max_area.toString());
      if (minArea > maxArea) {
        validationErrors.push('Minimalna powierzchnia nie może być większa od maksymalnej');
      }
    }

    // 15. Walidacja języka
    if (language && !['pl', 'en'].includes(language)) {
      validationErrors.push('Nieprawidłowy język');
    }

    // 16. Walidacja motywu
    if (theme && !['light', 'dark', 'auto'].includes(theme)) {
      validationErrors.push('Nieprawidłowy motyw');
    }

    // 17. Walidacja nazwy firmy
    if (company_name && company_name.trim()) {
      if (company_name.trim().length < 2) {
        validationErrors.push('Nazwa firmy musi mieć co najmniej 2 znaki');
      } else if (company_name.trim().length > 255) {
        validationErrors.push('Nazwa firmy nie może przekraczać 255 znaków');
      }
    }

    // 18. Walidacja NIP
    if (nip && nip.trim()) {
      const cleanNip = nip.replace(/\s/g, '');
      if (!/^[0-9]{10}$/.test(cleanNip)) {
        validationErrors.push('NIP musi składać się z 10 cyfr');
      } else {
        // Sprawdzenie sumy kontrolnej NIP
        const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          sum += parseInt(cleanNip[i]) * weights[i];
        }
        const checksum = sum % 11;
        if (checksum !== parseInt(cleanNip[9])) {
          validationErrors.push('Nieprawidłowa suma kontrolna NIP');
        }
      }
    }

    // 19. Walidacja adresu biznesowego
    if (business_address && business_address.trim()) {
      if (business_address.trim().length < 10) {
        validationErrors.push('Adres biznesowy musi mieć co najmniej 10 znaków');
      } else if (business_address.trim().length > 1000) {
        validationErrors.push('Adres biznesowy nie może przekraczać 1000 znaków');
      }
    }

    // Jeśli są błędy walidacji, zwróć je wszystkie
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Błędy walidacji danych',
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Przygotowanie danych do aktualizacji
    const updateData: any = {
      name: name.trim(),
      updated_at: new Date(),
    };

    // Dodanie opcjonalnych pól tylko jeśli są podane
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (date_of_birth !== undefined) {
      // Konwertuj datę na pełny format ISO-8601 DateTime
      updateData.date_of_birth = date_of_birth ? new Date(date_of_birth + 'T00:00:00.000Z') : null;
    }
    if (gender !== undefined) updateData.gender = gender || null;
    if (city !== undefined) updateData.city = city.trim() || null;
    if (postal_code !== undefined) updateData.postal_code = postal_code.trim() || null;
    if (preferred_currency !== undefined) updateData.preferred_currency = preferred_currency || 'PLN';
    if (income_range !== undefined) updateData.income_range = income_range || null;
    if (investment_experience !== undefined) updateData.investment_experience = investment_experience || null;
    if (preferred_property_type !== undefined) updateData.preferred_property_type = preferred_property_type || null;
    if (preferred_cities !== undefined) updateData.preferred_cities = preferred_cities || null;
    if (max_budget !== undefined) updateData.max_budget = max_budget || null;
    if (min_area !== undefined) updateData.min_area = min_area || null;
    if (max_area !== undefined) updateData.max_area = max_area || null;
    if (newsletter_subscription !== undefined) updateData.newsletter_subscription = newsletter_subscription;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (language !== undefined) updateData.language = language || 'pl';
    if (theme !== undefined) updateData.theme = theme || 'light';
    if (company_name !== undefined) updateData.company_name = company_name.trim() || null;
    if (nip !== undefined) updateData.nip = nip.trim() || null;
    if (business_address !== undefined) updateData.business_address = business_address.trim() || null;

    // Aktualizacja danych użytkownika
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(currentUser.userId) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        date_of_birth: true,
        gender: true,
        city: true,
        postal_code: true,
        preferred_currency: true,
        income_range: true,
        investment_experience: true,
        preferred_property_type: true,
        preferred_cities: true,
        max_budget: true,
        min_area: true,
        max_area: true,
        newsletter_subscription: true,
        email_notifications: true,
        language: true,
        theme: true,
        company_name: true,
        nip: true,
        business_address: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Konwertuj BigInt na Number dla JSON
    const userResponse = {
      ...updatedUser,
      id: Number(updatedUser.id),
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Błąd podczas aktualizacji profilu:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getProfile);
export const PUT = withAuth(updateProfile); 