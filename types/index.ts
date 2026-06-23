// types/index.ts

export interface BusinessWorkspace {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  stripeCustomerId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  activeBusinessId: string;
  businesses: string[];
  createdAt: Date;
}

export interface AuthContextType {
  user: UserProfile | null;
  business: BusinessWorkspace | null;
  loading: boolean;
  logout: () => Promise<void>;
}


