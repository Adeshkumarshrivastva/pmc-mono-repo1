export const site = {
  brand: "Positive Mind Care",
  legalName: "Positive Mind Care",
  address: "GF - 43, M2K Corporate Park, N Block, Mayfield Garden, Sector 51, Gurugram, Haryana 122018",
  phone: "089205 30832",
  phoneDigits: "8920530832",
  email: "care@positivemindcare.com",
};

export function whatsappLink(message: string, phoneWithCountryCode: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneWithCountryCode}?text=${encoded}`;
}
