'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  ProductCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductVariant,
  CreateVariantPayload,
  UpdateVariantPayload,
  AddOn,
  CreateAddonPayload,
  UpdateAddonPayload,
  SubscriptionPlan,
  CreatePlanPayload,
  UpdatePlanPayload,
  Subscription,
  CreateSubscriptionPayload,
  SubscriptionActionPayload,
} from '@/lib/types/subscription';

// ──────────────────────────────────────────────────────────
// PRODUCT CATEGORIES
// ──────────────────────────────────────────────────────────

export async function getCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(payload: CreateCategoryPayload): Promise<ProductCategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_categories')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/product-categories');
  return data;
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload): Promise<ProductCategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/product-categories');
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('product_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/product-categories');
}

// ──────────────────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:product_categories(id,name,slug)')
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*, category:product_categories(id,name,slug)')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/products');
  return data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*, category:product_categories(id,name,slug)')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/products');
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/products');
}

// ──────────────────────────────────────────────────────────
// PRODUCT VARIANTS
// ──────────────────────────────────────────────────────────

export async function getVariants(): Promise<ProductVariant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, product:products(id,name,sku)')
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVariantsByProduct(productId: string): Promise<ProductVariant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createVariant(payload: CreateVariantPayload): Promise<ProductVariant> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .insert(payload)
    .select('*, product:products(id,name,sku)')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/product-variants');
  return data;
}

export async function updateVariant(id: string, payload: UpdateVariantPayload): Promise<ProductVariant> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .update(payload)
    .eq('id', id)
    .select('*, product:products(id,name,sku)')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/product-variants');
  return data;
}

export async function deleteVariant(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/product-variants');
}

// ──────────────────────────────────────────────────────────
// ADD-ONS
// ──────────────────────────────────────────────────────────

export async function getAddons(): Promise<AddOn[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAddon(payload: CreateAddonPayload): Promise<AddOn> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('addons')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/add-ons');
  return data;
}

export async function updateAddon(id: string, payload: UpdateAddonPayload): Promise<AddOn> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('addons')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/add-ons');
  return data;
}

export async function deleteAddon(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('addons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/add-ons');
}

// ──────────────────────────────────────────────────────────
// SUBSCRIPTION PLANS
// ──────────────────────────────────────────────────────────

export async function getPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscription_plans')
    .select(`
      *,
      plan_features(id, feature, sort_order),
      active_subscribers:subscriptions(count)
    `)
    .order('base_price');
  if (error) throw new Error(error.message);

  return (data ?? []).map((plan) => ({
    ...plan,
    plan_features: (plan.plan_features ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
    active_subscribers: (plan.active_subscribers as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}

export async function createPlan(payload: CreatePlanPayload): Promise<SubscriptionPlan> {
  const supabase = await createClient();
  const { features, ...planData } = payload;

  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .insert(planData)
    .select()
    .single();
  if (planError) throw new Error(planError.message);

  if (features && features.length > 0) {
    const featureRows = features.map((feature, idx) => ({
      plan_id: plan.id,
      feature,
      sort_order: idx + 1,
    }));
    const { error: featError } = await supabase.from('plan_features').insert(featureRows);
    if (featError) throw new Error(featError.message);
  }

  revalidatePath('/subscription-plans');
  return plan;
}

export async function updatePlan(id: string, payload: UpdatePlanPayload): Promise<SubscriptionPlan> {
  const supabase = await createClient();
  const { features, ...planData } = payload;

  const { data, error } = await supabase
    .from('subscription_plans')
    .update(planData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (features !== undefined) {
    await supabase.from('plan_features').delete().eq('plan_id', id);
    if (features.length > 0) {
      const featureRows = features.map((feature, idx) => ({
        plan_id: id,
        feature,
        sort_order: idx + 1,
      }));
      await supabase.from('plan_features').insert(featureRows);
    }
  }

  revalidatePath('/subscription-plans');
  return data;
}

export async function deletePlan(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/subscription-plans');
}

// ──────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ──────────────────────────────────────────────────────────

function computeNextBillingDate(startDate: string, interval: string, intervalCount: number): string {
  const date = new Date(startDate);
  switch (interval) {
    case 'daily':   date.setDate(date.getDate() + intervalCount); break;
    case 'weekly':  date.setDate(date.getDate() + intervalCount * 7); break;
    case 'monthly': date.setMonth(date.getMonth() + intervalCount); break;
    case 'quarterly': date.setMonth(date.getMonth() + intervalCount * 3); break;
    case 'semi_annual': date.setMonth(date.getMonth() + intervalCount * 6); break;
    case 'annual':  date.setFullYear(date.getFullYear() + intervalCount); break;
  }
  return date.toISOString().split('T')[0];
}

function generateSubscriptionNumber(): string {
  return `SUB-${Date.now().toString().slice(-8)}`;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(id, name, code, base_price, billing_interval),
      subscription_items(*, product:products(id,name,sku), variant:product_variants(id,name,code)),
      subscription_addons(*, addon:addons(id,name,code))
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*, plan_features(id, feature, sort_order)),
      subscription_items(*, product:products(id,name,sku), variant:product_variants(id,name,code,final_price)),
      subscription_addons(*, addon:addons(id,name,code,unit_price,billing_type))
    `)
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function createSubscription(payload: CreateSubscriptionPayload): Promise<Subscription> {
  const supabase = await createClient();

  const startDate = payload.start_date;
  const intervalCount = payload.billing_interval_count ?? 1;
  const nextBilling = computeNextBillingDate(startDate, payload.billing_interval, intervalCount);

  const insertData = {
    subscription_number: generateSubscriptionNumber(),
    customer_id: payload.customer_id,
    plan_id: payload.plan_id,
    status: 'active' as const,
    billing_interval: payload.billing_interval,
    billing_interval_count: intervalCount,
    agreed_price: payload.agreed_price,
    currency: payload.currency ?? 'USD',
    start_date: startDate,
    current_period_start: startDate,
    current_period_end: nextBilling,
    next_billing_date: nextBilling,
    auto_renew: payload.auto_renew ?? true,
    notes: payload.notes ?? null,
    source_sales_order_id: payload.source_sales_order_id ?? null,
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .insert(insertData)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath('/subscriptions');
  return data;
}

export async function pauseSubscription({ subscription_id }: SubscriptionActionPayload): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'paused', paused_at: new Date().toISOString() })
    .eq('id', subscription_id);
  if (error) throw new Error(error.message);
  revalidatePath('/subscriptions');
  revalidatePath(`/subscriptions/${subscription_id}`);
}

export async function resumeSubscription({ subscription_id }: SubscriptionActionPayload): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'active', resumed_at: new Date().toISOString(), paused_at: null })
    .eq('id', subscription_id);
  if (error) throw new Error(error.message);
  revalidatePath('/subscriptions');
  revalidatePath(`/subscriptions/${subscription_id}`);
}

export async function cancelSubscription({ subscription_id, reason }: SubscriptionActionPayload): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason ?? null,
    })
    .eq('id', subscription_id);
  if (error) throw new Error(error.message);
  revalidatePath('/subscriptions');
  revalidatePath(`/subscriptions/${subscription_id}`);
}

export async function renewSubscription({ subscription_id }: SubscriptionActionPayload): Promise<void> {
  const supabase = await createClient();

  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('billing_interval, billing_interval_count, next_billing_date')
    .eq('id', subscription_id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const newPeriodStart = sub.next_billing_date ?? new Date().toISOString().split('T')[0];
  const newPeriodEnd = computeNextBillingDate(newPeriodStart, sub.billing_interval, sub.billing_interval_count);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: newPeriodStart,
      current_period_end: newPeriodEnd,
      next_billing_date: newPeriodEnd,
    })
    .eq('id', subscription_id);
  if (error) throw new Error(error.message);

  revalidatePath('/subscriptions');
  revalidatePath(`/subscriptions/${subscription_id}`);
}
