export function getCurrentDate() {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }
  
  export function getCurrentWeekday() {
    return new Intl.DateTimeFormat("pl-PL", {
      weekday: "long",
    }).format(new Date());
  }