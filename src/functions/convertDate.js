export const convertDate = (timestamp) => {
  const myDate = new Date(timestamp);
  const day = String(myDate.getDate()).padStart(2, '0');
  const month = String(myDate.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};
