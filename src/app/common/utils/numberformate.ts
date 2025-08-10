import { format } from "date-fns";

export const formatAmount = (params: any): string => {
  const value = Number(params?.value ?? params);
  if (isNaN(value)) {
    return '';
  }
  return value.toFixed(2);
}

export const formatDate = (params: any) => {
  if (!params.value) {
    return;
  }
  const date = new Date(params.value);
  return format(date, "dd/MM/YYYY");
}

export const formatCurrency = (params: any) => {
  if (params.value === 0) {
    return ''
  }
  const value = Math.abs(params.value); // Get the absolute value
  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return params.value < 0 ? `${formattedValue}` : formattedValue;
}
