const citiesWFlex = [
  'São Paulo',
  'Guarulhos',
  'Osasco',
  'Santo André',
  'Mogi das Cruzes',
  'Barueri'
]

export const allowFlex = (city: string, state: string) => {
  switch (state) {
    case 'SP':
      return citiesWFlex.includes(city);
    default:
      return false;
  }
}