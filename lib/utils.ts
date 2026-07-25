export const formatPrice = (value: number): string => {
  if (value >= 10_000_000) {
    const cr = (value / 10_000_000).toFixed(1).replace(/\.0$/, "");

    return `₹${cr} Cr`;
  }

  if (value >= 100_000) {
    const l = (value / 100_000).toFixed(1).replace(/\.0$/, "");

    return `₹${l} L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
};
