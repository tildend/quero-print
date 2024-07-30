export const maskString = (str: string, mask?: string, rtl = false) => {
  if (!mask) return str;
  
  let result = '';
  let strIndex = str.length - 1;
  
  if(rtl) {
    // Do it from the end to the start, so we can handle the case where the mask is bigger than the string
    for (let mIndex = mask.length - 1; mIndex >= 0; mIndex--) {
      if (mask[mIndex] === '#') {
        if(str[strIndex]) { // If the string is bigger than the mask, we need to check the next character
          result = str[strIndex] + result;
          strIndex--;
        }else { // If the string is smaller than the mask, we need to add the mask character
          break;
        }
      } else if (str[strIndex]) {
        result = mask[mIndex] + result;
      }
    }
  } else {
    strIndex = 0;
    // Do it from the start to the end, so we can handle the case where the mask is bigger than the string
    for (let mIndex = 0; mIndex < mask.length; mIndex++) {
      if (mask[mIndex] === '#') {
        if(str[strIndex]) { // If the string is bigger than the mask, we need to check the next character
          result += str[strIndex];
          strIndex++;
        }else { // If the string is smaller than the mask, we need to add the mask character
          break;
        }
      } else if (str[strIndex]) {
        result += mask[mIndex];
      }
    }
  }

  return result;
}

export const maskMap = {
  cpf: "###.###.###-##",
  cnpj: "##.###.###/####-##",
  tel: "(##) #####-####",
  cep: "#####-###",
  name: "",
  type: "",
  id: "",
  createdAt: "",
  updatedAt: "",
  deletedAt: "",
  email: "",
  password: "",
  accounts: "",
  bankKeys: ""
}