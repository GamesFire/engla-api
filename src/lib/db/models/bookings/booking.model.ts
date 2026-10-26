import dayjs from 'dayjs';
import { Model, type Pojo, type RelationMappings } from 'objection';

import { BaseSystemModel } from '../base-system.model.js';
import { type CancellationPolicy, PropertyModel } from '../properties/property.model.js';
import { UserModel, type UserRole } from '../users/user.model.js';
import { BookingModifiers } from './booking.modifiers.js';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export interface Booking {
  // --- System & Relations ---
  id: number;
  propertyId: number; // FK to PropertyModel (id)
  guestId: number; // FK to UserModel (id)
  hostId: number; // FK to UserModel (id)
  status: BookingStatus; // Default 'pending'
  paymentStatus: PaymentStatus; // Default 'unpaid'

  // --- Dates & Capacity ---
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;

  // --- Financial Snapshot ---
  pricePerNight: number;
  cleaningFee: number; // Default 0
  nightsSubtotal: number;
  totalPrice: number;
  platformFee?: number;
  hostPayout?: number;
  currency: string; // Default 'GBP'
  cancellationPolicy: CancellationPolicy;
  specialRequests: Nullable<string>;

  // --- Stripe Integration ---
  stripeCheckoutSessionId?: Nullable<string>;
  stripePaymentIntentId?: Nullable<string>;
  stripeRefundId?: Nullable<string>;
  refundedAmount: number; // Default 0

  // --- Lifecycle Timestamps & Audit ---
  expiresAt: Nullable<Date>;
  paidAt: Nullable<Date>;
  cancelledAt: Nullable<Date>;
  cancelledByRole: Nullable<UserRole>;
  cancellationReason: Nullable<string>;
  completedAt: Nullable<Date>;
  createdAt: Date;
  updatedAt: Date;

  // --- Relations ---
  property?: PropertyModel;
  guest?: UserModel;
  host?: UserModel;
}

export class BookingModel extends BaseSystemModel implements Booking {
  static tableName = 'bookings';
  static modifiers = BookingModifiers;

  id!: number;
  propertyId!: number;
  guestId!: number;
  hostId!: number;
  status!: BookingStatus;
  paymentStatus!: PaymentStatus;
  checkInDate!: string; // !Important: pg returns date as Date object, normalized to YYYY-MM-DD
  checkOutDate!: string; // !Important: pg returns date as Date object, normalized to YYYY-MM-DD
  nights!: number;
  guestsCount!: number;
  pricePerNight!: number; // !Important: DB stores integer (in pence)
  cleaningFee!: number; // !Important: DB stores integer (in pence)
  nightsSubtotal!: number; // !Important: DB stores integer (in pence)
  totalPrice!: number; // !Important: DB stores integer (in pence)
  platformFee!: number; // !Important: DB stores integer (in pence)
  hostPayout!: number; // !Important: DB stores integer (in pence)
  currency!: string;
  cancellationPolicy!: CancellationPolicy;
  specialRequests!: Nullable<string>;
  stripeCheckoutSessionId!: Nullable<string>;
  stripePaymentIntentId!: Nullable<string>;
  stripeRefundId!: Nullable<string>;
  refundedAmount!: number; // !Important: DB stores integer (in pence)
  expiresAt!: Nullable<Date>;
  paidAt!: Nullable<Date>;
  cancelledAt!: Nullable<Date>;
  cancelledByRole!: Nullable<UserRole>;
  cancellationReason!: Nullable<string>;
  completedAt!: Nullable<Date>;

  // --- Relations ---
  property?: PropertyModel;
  guest?: UserModel;
  host?: UserModel;

  // --- Relation Mappings (For Objection) ---
  static get relationMappings(): RelationMappings {
    return {
      property: {
        relation: Model.BelongsToOneRelation,
        modelClass: PropertyModel,
        join: {
          from: 'bookings.propertyId',
          to: 'properties.id',
        },
      },

      guest: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'bookings.guestId',
          to: 'users.id',
        },
      },

      host: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'bookings.hostId',
          to: 'users.id',
        },
      },
    };
  }

  // --- Modifiers for JSON (normalizing dates and enforcing address privacy) ---
  $parseDatabaseJson(json: Pojo): Pojo {
    json = super.$parseDatabaseJson(json);

    if (json.checkInDate) {
      json.checkInDate = dayjs(json.checkInDate as string | Date).format('YYYY-MM-DD');
    }
    if (json.checkOutDate) {
      json.checkOutDate = dayjs(json.checkOutDate as string | Date).format('YYYY-MM-DD');
    }

    return json;
  }

  /**
   * Privacy Guard:
   * In GUEST_VIEW (where `platformFee` is omitted), hides the exact street address and postcode
   * of the property until the booking is CONFIRMED or COMPLETED.
   * Note: `city`, `county`, `latitude`, and `longitude` remain visible so guests can see the map area.
   */
  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);

    const isGuestView = json.platformFee === undefined;
    const isAddressAuthorized =
      json.status === BookingStatus.CONFIRMED || json.status === BookingStatus.COMPLETED;

    if (isGuestView && !isAddressAuthorized && json.property && typeof json.property === 'object') {
      const propertyObj = json.property as Record<string, unknown>;
      delete propertyObj.addressLine1;
      delete propertyObj.addressLine2;
      delete propertyObj.postcode;
    }

    return json;
  }
}
