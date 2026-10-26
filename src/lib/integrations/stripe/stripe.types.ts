export type CreateExpressAccountParams = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type CreateBookingCheckoutSessionParams = {
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  guestId: number;
  guestEmail: string;
  hostId: number;
  hostStripeAccountId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  platformFee: number;
  expiresAt: Date;
};

export type CreateBookingCheckoutSessionResult = {
  sessionId: string;
  checkoutUrl: string;
};

export type CreateRefundParams = {
  paymentIntentId: string;
  amount: number;
  isFullRefund: boolean;
  bookingId: number;
};
