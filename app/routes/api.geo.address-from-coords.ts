import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getFullAddrFromCoords } from "~/controllers/GeoAPI.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!process.env.GEOAPIFI_KEY) {
    console.error('GEOAPIFI_KEY not set');
    return json({ error: 'Internal error' }, { status: 500 });
  }

  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  if (!lat || !lon) {
    return json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const addr = await getFullAddrFromCoords({
    latitude: parseFloat(lat),
    longitude: parseFloat(lon)
  }, { GEOAPIFI_KEY: process.env.GEOAPIFI_KEY });
  
  return json(addr);
}