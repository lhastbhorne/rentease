// =====================================================
// RENTAL CONSTANTS
// =====================================================

// =====================================================
// PROPERTY STATUS
// =====================================================

export const PROPERTY_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
};

// =====================================================
// APPLICATION STATUS
// =====================================================

export const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

// =====================================================
// PAYMENT STATUS
// =====================================================

export const PAYMENT_STATUS = {
  NOT_STARTED: "not_started",
  PENDING: "pending",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  EXPIRED: "expired",
};

// =====================================================
// TENANCY STATUS
// =====================================================

export const TENANCY_STATUS = {
  NOT_STARTED: "not_started",
  AWAITING_PAYMENT: "awaiting_payment",
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
};

// =====================================================
// RENT FREQUENCY
// =====================================================

export const RENT_FREQUENCY = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  HALF_YEARLY: "half_yearly",
  ANNUAL: "annual",
};

// =====================================================
// PROPERTY MANAGEMENT TYPE
// =====================================================

export const MANAGEMENT_TYPE = {
  OWNER: "owner",
  AGENT: "agent",
};

// =====================================================
// PROPERTY MANAGER ROLE
// =====================================================

export const PROPERTY_MANAGER_ROLE = {
  LANDLORD: "landlord",
  AGENT: "agent",
};

// =====================================================
// PAYMENT DEADLINE
// =====================================================

// Tenant has 7 days to pay after application approval.
export const PAYMENT_DEADLINE_DAYS = 7;

// =====================================================
// TRANSACTION TYPES
// =====================================================

export const TRANSACTION_TYPE = {
  RENT: "rent",
  INSPECTION: "inspection",
  PLATFORM_FEE: "platform_fee",
  SETTLEMENT: "settlement",
  REFUND: "refund",
};

// =====================================================
// TRANSACTION STATUS
// =====================================================

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// =====================================================
// TRANSACTION CURRENCY
// =====================================================

export const TRANSACTION_CURRENCY = {
  NGN: "NGN",
};

// =====================================================
// FEE TYPES
// =====================================================

export const FEE_TYPE = {
  PLATFORM: "platform",
  INSPECTION: "inspection",
  PROCESSING: "processing",
};

// =====================================================
// PAYMENT PROVIDER
// =====================================================

export const PAYMENT_PROVIDER = {
  PAYSTACK: "paystack",
};

// =====================================================
// PLATFORM FEE
// =====================================================

// RentEase platform fee.
// 5% of eligible rental transactions.
export const PLATFORM_FEE_RATE = 0.05;

// =====================================================
// INSPECTION FEE
// =====================================================

// Default inspection fee in NGN.
// This can later become configurable from Admin.
export const INSPECTION_FEE = 10000;

// =====================================================
// SETTLEMENT STATUS
// =====================================================

export const SETTLEMENT_STATUS = {
  NOT_STARTED: "not_started",
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// =====================================================
// SETTLEMENT RECIPIENT TYPE
// =====================================================

export const SETTLEMENT_RECIPIENT_ROLE = {
  LANDLORD: "landlord",
  AGENT: "agent",
};

// =====================================================
// SETTLEMENT CURRENCY
// =====================================================

export const SETTLEMENT_CURRENCY = {
  NGN: "NGN",
};

// =====================================================
// REFUND STATUS
// =====================================================

export const REFUND_STATUS = {
  NOT_REQUESTED: "not_requested",
  REQUESTED: "requested",
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

// =====================================================
// REFUND REASONS
// =====================================================

export const REFUND_REASON = {
  TENANCY_TERMINATION: "tenancy_termination",
  OVERPAYMENT: "overpayment",
  DUPLICATE_PAYMENT: "duplicate_payment",
  PAYMENT_ERROR: "payment_error",
  APPLICATION_CANCELLED: "application_cancelled",
  OTHER: "other",
};

// =====================================================
// INSPECTION STATUS
// =====================================================

export const INSPECTION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  PAYMENT_PENDING: "payment_pending",
  CONFIRMED: "confirmed",

  COMPLETION_PENDING_CONFIRMATION: "completion_pending_confirmation",

  COMPLETION_CONFIRMATION_EXPIRED: "completion_confirmation_expired",

  REJECTED: "rejected",
  RESCHEDULED: "rescheduled",
  CANCELLED: "cancelled",
  COMPLETED: "completed",

  AWAITING_TENANT_CONFIRMATION: "awaiting_tenant_confirmation",
};

// =====================================================
// INSPECTION TYPE
// =====================================================

export const INSPECTION_TYPE = {
  PROPERTY_VIEWING: "property_viewing",
};
