const GEO_BASE_URL = 'https://api.geoapify.com/v1/geocode/';

export async function getFullAddrFromCoords(coords: GeolocationCoordinates, env: { GEOAPIFI_KEY: string }) {
  const url = new URL('reverse', GEO_BASE_URL);
  url.searchParams.append('lat', coords.latitude.toString());
  url.searchParams.append('lon', coords.longitude.toString());
  url.searchParams.append('apiKey', env.GEOAPIFI_KEY!);

  const addr: ReverseRes = await fetch(url).then(res => res.json());
  if (!addr.features.length) {
    throw new Error('No address found');
  }
  return addr.features[0];
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

export async function getCoordsDistance(coords: GeolocationCoordinates, env: { BASE_LAT: number, BASE_LON: number, GEOAPIFI_KEY: string }) {
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
      datasource: {
        sourcename: string;
        attribution: string;
        license: string;
        url: string;
      };
      name: string;
      country: string;
      country_code: string;
      region: string;
      state: string;
      state_district: string;
      county: string;
      city: string;
      municipality: string;
      postcode: string;
      suburb: string;
      street: string;
      lon: number;
      lat: number;
      state_code: string;
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
      };
      plus_code: string;
      plus_code_short: string;
      rank: {
        importance: number;
        popularity: number;
      };
      place_id: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
    bbox: [number, number, number, number];
  }[];
  query: {
    lat: number;
    lon: number;
    plus_code: string;
  };
};
/*
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "datasource": {
                    "sourcename": "openstreetmap",
                    "attribution": "© OpenStreetMap contributors",
                    "license": "Open Database License",
                    "url": "https://www.openstreetmap.org/copyright"
                },
                "name": "Sé Square",
                "country": "Brazil",
                "country_code": "br",
                "region": "Southeast Region",
                "state": "São Paulo",
                "state_district": "Região Geográfica Intermediária de São Paulo",
                "county": "Região Metropolitana de São Paulo",
                "city": "São Paulo",
                "municipality": "Região Imediata de São Paulo",
                "postcode": "01016-000",
                "suburb": "Glicério",
                "street": "Rua Venceslau Brás",
                "lon": -46.63316310000001,
                "lat": -23.55054107894736,
                "state_code": "SP",
                "distance": 0,
                "result_type": "amenity",
                "formatted": "Sé Square, Rua Venceslau Brás, Glicério, São Paulo - SP, 01016-000, Brazil",
                "address_line1": "Sé Square",
                "address_line2": "Rua Venceslau Brás, Glicério, São Paulo - SP, 01016-000, Brazil",
                "category": "tourism.attraction",
                "timezone": {
                    "name": "America/Sao_Paulo",
                    "offset_STD": "-03:00",
                    "offset_STD_seconds": -10800,
                    "offset_DST": "-03:00",
                    "offset_DST_seconds": -10800
                },
                "plus_code": "588MC9X8+QP",
                "plus_code_short": "X8+QP São Paulo, Região Metropolitana de São Paulo, Brazil",
                "rank": {
                    "importance": 0.4311093878774799,
                    "popularity": 8.422950522646222
                },
                "place_id": "515bc40b7d0b5147c059f82e9942f08c37c0f00102f9017add7f0400000000c0020192030a53c3a920537175617265"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -46.6342888,
                            -23.5505651
                        ],
                        [
                            -46.6339061,
                            -23.5507209
                        ],
                        [
                            -46.6337697,
                            -23.5507765
                        ],
                        [
                            -46.6338053,
                            -23.5508495
                        ],
                        [
                            -46.6338746,
                            -23.550991
                        ],
                        [
                            -46.6339563,
                            -23.5511579
                        ],
                        [
                            -46.6338371,
                            -23.5512076
                        ],
                        [
                            -46.6337391,
                            -23.5512484
                        ],
                        [
                            -46.6335245,
                            -23.5513379
                        ],
                        [
                            -46.6325978,
                            -23.5517242
                        ],
                        [
                            -46.6319733,
                            -23.5504496
                        ],
                        [
                            -46.6319459,
                            -23.55033
                        ],
                        [
                            -46.6319455,
                            -23.5502197
                        ],
                        [
                            -46.6319551,
                            -23.5501015
                        ],
                        [
                            -46.6319934,
                            -23.5499102
                        ],
                        [
                            -46.6327645,
                            -23.5501558
                        ],
                        [
                            -46.6333925,
                            -23.5499304
                        ],
                        [
                            -46.6332324,
                            -23.5494414
                        ],
                        [
                            -46.633597,
                            -23.5491629
                        ],
                        [
                            -46.6342888,
                            -23.5505651
                        ]
                    ]
                ]
            },
            "bbox": [
                -46.6342888,
                -23.5517242,
                -46.6319455,
                -23.5491629
            ]
        }
    ],
    "query": {
        "lat": -23.55052,
        "lon": -46.633309,
        "plus_code": "588MC9X8+QM"
    }
}
    */