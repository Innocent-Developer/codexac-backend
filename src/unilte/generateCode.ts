// create a 6 digit random number for invite code
export const generateCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};