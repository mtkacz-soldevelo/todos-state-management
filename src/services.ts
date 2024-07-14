const readLocalStorage = (key: string) => {
  return localStorage.getItem(key);
};

const writeLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const LocalStorageService = {
  readLocalStorage,
  writeLocalStorage,
};
