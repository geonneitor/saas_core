import { NextResponse } from 'next/server';

// Usa la key existente de Google Maps (también sirve para Places API si está habilitada)
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json(
        { error: 'La búsqueda debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key no configurada' },
        { status: 500 }
      );
    }

    const url = 'https://places.googleapis.com/v1/places:searchText';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.location',
        'Referer': process.env.NEXT_PUBLIC_ROOT_DOMAIN ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : 'http://localhost:3000'
      },
      body: JSON.stringify({
        textQuery: query + ' México',
        languageCode: 'es'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Places Search] Google API error:', data);
      return NextResponse.json(
        { error: 'Error al buscar en Google Maps', detail: data.error?.message || 'Unknown error' },
        { status: 502 }
      );
    }

    const results = (data.places || []).slice(0, 5).map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text,
      address: place.formattedAddress,
      rating: place.rating || null,
      types: place.types || [],
      location: place.location ? { lat: place.location.latitude, lng: place.location.longitude } : null,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('[Places Search] Error:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
