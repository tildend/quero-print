import { db } from "~/drivers/mongodb";
import { AddressOfCoords } from "~/models/AddressOfCoords";

const GEO_BASE_URL = 'https://api.geoapify.com/v1/geocode/';

type Coordinates = {
  latitude: number;
  longitude: number;
};

async function getAddrFromDB(coords: Coordinates) {
  return db.collection<AddressOfCoords>('AddressOfCoords').findOne({ coordinates: `${coords.latitude.toPrecision(6)},${coords.longitude.toPrecision(6)}` });
}

async function saveAddrToDB(coords: Coordinates, addr: Omit<AddressOfCoords, 'coordinates'>) {
  const newAddr: AddressOfCoords = {
    ...addr,
    coordinates: `${coords.latitude.toPrecision(6)},${coords.longitude.toPrecision(6)}`,
  };
  await db.collection<AddressOfCoords>('AddressOfCoords').insertOne(newAddr);
  return newAddr;
}

export async function getFullAddrFromCoords(coords: Coordinates, env: { GEOAPIFI_KEY: string }) {
  const url = new URL('reverse', GEO_BASE_URL);
  url.searchParams.append('lat', coords.latitude.toString());
  url.searchParams.append('lon', coords.longitude.toString());
  url.searchParams.append('apiKey', env.GEOAPIFI_KEY!);
  url.searchParams.append('lang', 'pt');

  const addrFromDB = await getAddrFromDB(coords);
  if (addrFromDB) {
    return addrFromDB;
  }

  const addr: ReverseRes = await fetch(url).then(res => res.json());
  console.log('addr', addr);
  if (!addr.features.length) {
    throw new Error('No address found');
  }
  
  const addrFeatures = addr.features[0];

  return saveAddrToDB(coords, {
    city: addrFeatures.properties.city,
    state: addrFeatures.properties.county,
    street: addrFeatures.properties.street,
    number: addrFeatures.properties.housenumber,
    complement: '',
    neighborhood: addrFeatures.properties.suburb,
    zip: addrFeatures.properties.postcode
  });
}

export async function getFullAddr(env: { GEOAPIFI_KEY: string }, street: string, number: string, city: string, state: string, zip: string, country = 'Brazil') {
  const url = new URL('search', GEO_BASE_URL);
  url.searchParams.append('text', `${street} ${number}, ${city}, ${state}, ${zip}, ${country}`);
  url.searchParams.append('format', 'json');
  url.searchParams.append('apiKey', env.GEOAPIFI_KEY!);

  const addr: ForwardRes = await fetch(url).then(res => res.json());
  if (!addr.results.length) {
    throw new Error('No address found');
  }
  return addr.results[0];
}

export async function getCoordsDistance(coords: Coordinates, env: { BASE_LAT: number, BASE_LON: number, GEOAPIFI_KEY: string }) {
  console.log('getCoordsDistance', coords);
  const url = new URL('reverse', GEO_BASE_URL);
  url.searchParams.append('lat', coords.latitude.toString());
  url.searchParams.append('lon', coords.longitude.toString());
  url.searchParams.append('apiKey', env.GEOAPIFI_KEY!);

  const addr: ReverseRes = await fetch(url).then(res => res.json());
  if (!addr.features.length) {
    throw new Error('No address found');
  }
  
  const forwardUrl = new URL('search', GEO_BASE_URL);
  forwardUrl.searchParams.append('text', addr.features[0].properties.formatted);
  forwardUrl.searchParams.append('bias', `proximity:${env.BASE_LON},${env.BASE_LAT}`);
  forwardUrl.searchParams.append('format', 'json');
  forwardUrl.searchParams.append('apiKey', env.GEOAPIFI_KEY!);

  const res: ForwardRes = await fetch(forwardUrl).then(res => res.json());
  const addrWDistance = res.results.filter(f => f.distance)[0];
  console.log('DISTANCIA', addrWDistance);

  return addrWDistance.distance;
}

export async function getAddrDistance(env: { BASE_LAT: number, BASE_LON: number, GEOAPIFI_KEY: string }, street: string, number: string, city: string, state: string, zip: string, country = 'Brazil') {
  console.log('getAddrDistance', street, number, city, state, zip);
  const url = new URL('search', GEO_BASE_URL);
  url.searchParams.append('text', `${street} ${number}, ${city}, ${state}, ${zip}, ${country}`);
  url.searchParams.append('bias', `proximity:${env.BASE_LON},${env.BASE_LAT}`);
  url.searchParams.append('format', 'json');
  url.searchParams.append('apiKey', env.GEOAPIFI_KEY!);

  const { distance } = await fetch(url).then(res => res.json());
  return distance;
}

export type ForwardRes = {
  results: {
    datasource: {
      sourcename: string;
      attribution: string;
      license: string;
      url: string;
    };
    name: string;
    country: string;
    country_code: string;
    city: string;
    postcode: string;
    district: string;
    neighbourhood: string;
    suburb: string;
    street: string;
    housenumber: string;
    lon: number;
    lat: number;
    distance: number;
    result_type: string;
    formatted: string;
    address_line1: string;
    address_line2: string;
    category: string;
    timezone: {
      name: string;
      offset_STD: string;
      offset_STD_seconds: number;
      offset_DST: string;
      offset_DST_seconds: number;
      abbreviation_STD: string;
      abbreviation_DST: string;
    };
    plus_code: string;
    plus_code_short: string;
    rank: {
      importance: number;
      popularity: number;
    };
    place_id: string;
    bbox: {
      lon1: number;
      lat1: number;
      lon2: number;
      lat2: number;
    };
  }[];
  query: {
    lat: number;
    lon: number;
    plus_code: string;
  };
};

export type ReverseRes = {
  type: string;
  features: {
    type: string;
    properties: {
      country_code: string;
      housenumber: string;
      street: string;
      country: string;
      county: string;
      datasource: {
        sourcename: string;
        attribution: string;
        license: string;
      };
      postcode: string;
      state: string;
      district: string;
      city: string;
      suburb: string;
      lon: number;
      lat: number;
      distance: number;
      result_type: string;
      formatted: string;
      address_line1: string;
      address_line2: string;
      timezone: {
        name: string;
        offset_STD: string;
        offset_STD_seconds: number;
        offset_DST: string;
        offset_DST_seconds: number;
      };
      plus_code: string;
      plus_code_short: string;
      rank: {
        popularity: number;
      };
      place_id: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    bbox: [number, number, number, number];
  }[];
  query: {
    lat: number;
    lon: number;
    plus_code: string;
  };
};