import { NextResponse } from 'next/server';

// Usa la key existente de Google Maps (también sirve para Places API si está habilitada)
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { placeId } = await req.json();

    if (!placeId || typeof placeId !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere un placeId válido' },
        { status: 400 }
      );
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key no configurada' },
        { status: 500 }
      );
    }

    const fields = [
      'name',
      'formatted_address',
      'international_phone_number',
      'opening_hours',
      'website',
      'geometry',
      'rating',
      'photos',
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=es&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[Places Details] Google API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: 'Error al obtener detalles del lugar', detail: data.status },
        { status: 502 }
      );
    }

    const place = data.result;
    const weekdayText = place.opening_hours?.weekday_text || [];

    // Extraer opening_time y closing_time del primer día hábil
    let openingTime = '09:00';
    let closingTime = '18:00';
    if (weekdayText.length > 0) {
      const firstDay = weekdayText[0]; // "Monday: 9:00 AM – 6:00 PM"
      const hoursMatch = firstDay.match(/(\d{1,2}:\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}:\d{2})\s*(AM|PM)/i);
      if (hoursMatch) {
        openingTime = convertTo24h(hoursMatch[1], hoursMatch[2]);
        closingTime = convertTo24h(hoursMatch[3], hoursMatch[4]);
      }
    }

    // Obtener foto de referencia si existe
    let photoRef = null;
    if (place.photos && place.photos.length > 0) {
      photoRef = place.photos[0].photo_reference;
    }

    const result = {
      name: place.name || '',
      address: place.formatted_address || '',
      phone: place.international_phone_number || '',
      website: place.website || '',
      rating: place.rating || null,
      openingTime,
      closingTime,
      hoursRaw: weekdayText,
      latitude: place.geometry?.location?.lat || null,
      longitude: place.geometry?.location?.lng || null,
      photoRef: null, // No exponer API key al cliente por ahora
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Places Details] Error:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function convertTo24h(time: string, period: string): string {
  let [hours, minutes] = time.split(':').map(Number);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
