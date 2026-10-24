export interface Campaign {
  id: string;
  title: string;
  description: string;
  raisedCents: number;
  goalCents: number;
  daysRemaining?: number;
  pixKey?: string;
}
