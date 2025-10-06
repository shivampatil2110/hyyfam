export function formatDateToLocalYYYYMMDD(date: Date | string | null): string | null {
  if (!date) return null;

  let d: Date;
  if (typeof date === 'string') {
    // Parse the string correctly: split and create using numeric constructor
    const parts = date.split('-');
    if (parts.length === 3) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const formatDateForAPI = (date: Date | string | null): string => {
  if (!date) return "";

  let d: Date;
  if (typeof date === "string") {
    // Parse safely as local date
    const parts = date.split('-');
    if (parts.length === 3) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};