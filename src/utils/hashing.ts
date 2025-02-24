import { hash, compare } from 'bcryptjs';
const { createHmac } = require('crypto')

// Define the function with proper types for value and saltValue
export const doHash = async (value: string, saltValue: number): Promise<string> => {
  // Hash the value using bcryptjs with the given salt value
  const hashResult = await hash(value, saltValue); // Using await since hash is async
  return hashResult;
};

export const doHashValidation = async (value: string, hashedValue: string): Promise<boolean> => {
    // Compare the plain text value with the hashed value
    const validationResult = await compare(value, hashedValue); // Use compare to check the password
    return validationResult;  // Returns true if they match, false otherwise
};
  
export const hmacProcess = (value: string | Buffer, key: string | Buffer): string => {
    const result = createHmac('sha256', key).update(value).digest('hex');
    return result;
};