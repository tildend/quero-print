const dateOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
};

export const dateFmt = (unformattedDate: string | Date) => {
  if (typeof unformattedDate === 'string') {
    const date = new Date(unformattedDate);
    return date.toLocaleDateString('pt-BR', dateOptions);
  }

  return unformattedDate.toLocaleDateString('pt-BR', dateOptions);
}