// Simple date formatter (DD.MM.YYYY)
export const formatDate = (date: string) => {
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear());

  return `${day}.${month}.${year}`;
};
