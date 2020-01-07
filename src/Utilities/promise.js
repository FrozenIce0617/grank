export const doAnyway = cb => {
  const action = (...args) => cb(...args);
  return [action, action];
};
