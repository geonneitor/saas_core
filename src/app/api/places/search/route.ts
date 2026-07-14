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

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' México')}&language=es&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Places Search] Google API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: 'Error al buscar en Google Maps', detail: data.status },
        { status: 502 }
      );
    }

    const results = (data.results || []).slice(0, 5).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || null,
      types: place.types || [],
      location: place.geometry?.location || null,
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
