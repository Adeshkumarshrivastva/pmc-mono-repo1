export interface SelectOption {
  value: string;
  label: string;
}

export const GENDER_OPTIONS: SelectOption[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other / prefer not to say" },
];

export type EnquiryTypeId = "cghs" | "csr";

export const ENQUIRY_TYPES: Record<EnquiryTypeId, { title: string }> = {
  cghs: { title: "CGHS empanelment" },
  csr: { title: "CSR / corporate wellness" },
};

export function optionLabel(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
