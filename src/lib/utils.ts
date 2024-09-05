import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  userId: string;
  subscriptionStatus: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUBSCRIPTION_TOKEN_KEY = 'subscriptionToken';

export const setSubscriptionToken = async (token: string): Promise<void> => {
  localStorage.setItem(SUBSCRIPTION_TOKEN_KEY, token);
};

export const isTokenValid = async (token: string): Promise<boolean> => {
  try {
    const decoded = jwtDecode(token) as DecodedToken;
    if (decoded.exp < Date.now() / 1000) {
      return false;
    }
    return decoded.subscriptionStatus;
  } catch (error) {
    console.error('Error validating subscription token:', error);
    return false;
  }
};

export const refreshSubscriptionToken = async (
  clerkAuthToken: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_LINKEEP_API_URL}/get-subscription-token`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clerkAuthToken}`,
        },
      }
    );
    if (response.ok) {
      const { token } = await response.json();
      await setSubscriptionToken(token);
    } else {
      console.error(
        'Error refreshing subscription token:',
        response.statusText
      );
    }
  } catch (error) {
    console.error('Error refreshing subscription token:', error);
  }
};

export function decodeToken(token: string): DecodedToken {
  return jwtDecode<DecodedToken>(token);
}

export function isTokenExpired(token: string): boolean {
  const { exp } = decodeToken(token);
  const now = Math.floor(Date.now() / 1000);
  return now >= exp;
}

export async function getSubscriptionToken(
  clerkAuthToken: string
): Promise<string> {
  const storedToken = localStorage.getItem(SUBSCRIPTION_TOKEN_KEY);
  if (storedToken && !isTokenExpired(storedToken)) {
    return storedToken;
  }

  const response = await fetch(
    `${import.meta.env.VITE_LINKEEP_API_URL}/get-subscription-token`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clerkAuthToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get subscription token');
  }

  const data = await response.json();
  localStorage.setItem(SUBSCRIPTION_TOKEN_KEY, data.token);
  return data.token;
}
