// ============================================================
// Brightloop Hub — Product & Subscription TypeScript Types
// ============================================================

// ──────────────────────────────────────────────────────────
// PRODUCT CATALOGUE
// ──────────────────────────────────────────────────────────

export type BillingModel = 'recurring' | 'usage_based' | 'annual_license' | 'one_time';
export type BillingInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
export type BillingType = 'recurring' | 'one_time' | 'usage_metered';
export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed join
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string | null;
  billing_model: BillingModel;
  sales_price: number;
  cost_price: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed join
  category?: ProductCategory | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  code: string;
  billing_interval: BillingInterval;
  billing_interval_count: number;
  price_adjustment: number;
  final_price: number;
  min_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed join
  product?: Product | null;
}

export interface AddOn {
  id: string;
  name: string;
  code: string;
  description: string | null;
  unit_price: number;
  billing_type: BillingType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────
// SUBSCRIPTION PLANS
// ──────────────────────────────────────────────────────────

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature: string;
  sort_order: number;
}

export interface PlanItem {
  id: string;
  plan_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  product?: Product | null;
  variant?: ProductVariant | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billing_interval: BillingInterval;
  billing_interval_count: number;
  base_price: number;
  min_quantity: number;
  available_from: string | null;
  available_until: string | null;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed joins
  plan_features?: PlanFeature[];
  plan_items?: PlanItem[];
  active_subscribers?: number;
}

// ──────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ──────────────────────────────────────────────────────────

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
  product?: Product | null;
  variant?: ProductVariant | null;
}

export interface SubscriptionAddon {
  id: string;
  subscription_id: string;
  addon_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  addon?: AddOn | null;
}

export interface Subscription {
  id: string;
  subscription_number: string;
  customer_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_interval: BillingInterval;
  billing_interval_count: number;
  agreed_price: number;
  currency: string;
  start_date: string;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_date: string | null;
  available_from: string | null;
  available_until: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  expires_at: string | null;
  source_sales_order_id: string | null;
  auto_renew: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // computed joins
  plan?: SubscriptionPlan | null;
  subscription_items?: SubscriptionItem[];
  subscription_addons?: SubscriptionAddon[];
}

// ──────────────────────────────────────────────────────────
// FORM PAYLOADS (for create/update operations)
// ──────────────────────────────────────────────────────────

export type CreateCategoryPayload = Pick<ProductCategory, 'name' | 'slug' | 'description'>;
export type UpdateCategoryPayload = Partial<CreateCategoryPayload & { is_active: boolean }>;

export type CreateProductPayload = Pick<Product, 'name' | 'sku' | 'billing_model' | 'sales_price' | 'cost_price' | 'notes'> & {
  category_id?: string | null;
};
export type UpdateProductPayload = Partial<CreateProductPayload & { is_active: boolean }>;

export type CreateVariantPayload = Pick<ProductVariant, 'product_id' | 'name' | 'code' | 'billing_interval' | 'billing_interval_count' | 'price_adjustment' | 'final_price' | 'min_quantity'>;
export type UpdateVariantPayload = Partial<Omit<CreateVariantPayload, 'product_id'> & { is_active: boolean }>;

export type CreateAddonPayload = Pick<AddOn, 'name' | 'code' | 'description' | 'unit_price' | 'billing_type'>;
export type UpdateAddonPayload = Partial<CreateAddonPayload & { is_active: boolean }>;

export type CreatePlanPayload = Pick<SubscriptionPlan, 'name' | 'code' | 'description' | 'billing_interval' | 'billing_interval_count' | 'base_price' | 'min_quantity' | 'available_from' | 'available_until' | 'is_popular'> & {
  features?: string[];
};
export type UpdatePlanPayload = Partial<CreatePlanPayload & { is_active: boolean }>;

export type CreateSubscriptionPayload = {
  customer_id: string;
  plan_id: string;
  billing_interval: BillingInterval;
  billing_interval_count?: number;
  agreed_price: number;
  currency?: string;
  start_date: string;
  auto_renew?: boolean;
  notes?: string;
  source_sales_order_id?: string;
};

export type SubscriptionActionPayload = {
  subscription_id: string;
  reason?: string;
};
