import { baseApi } from "@/shared/api/baseApi";
import { supabase } from "@/shared/config/supabase";
import {
  addToOutbox,
  isOfflineError,
  readCache,
  removeCachedList,
  writeCache,
} from "@/shared/lib/offlineDb";
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  Category,
} from "../model/types";

const SUBSCRIPTIONS_KEY = "subscriptions";
const CATEGORIES_KEY = "categories";

const sortByDate = (list: Subscription[]) =>
  [...list].sort((a, b) =>
    a.next_payment_date.localeCompare(b.next_payment_date),
  );

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<Subscription[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("subscriptions")
            .select("*")
            .order("next_payment_date", { ascending: true });
          if (error) throw error;
          void writeCache(SUBSCRIPTIONS_KEY, data);
          return { data: data as Subscription[] };
        } catch (error) {
          if (isOfflineError(error)) {
            const cached = await readCache<Subscription[]>(SUBSCRIPTIONS_KEY);
            if (cached) return { data: cached };
          }
          return { error: error as { message: string } };
        }
      },
      providesTags: ["Subscription"],
    }),

    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from("categories").select("*");
          if (error) throw error;
          void writeCache(CATEGORIES_KEY, data);
          return { data: data as Category[] };
        } catch (error) {
          if (isOfflineError(error)) {
            const cached = await readCache<Category[]>(CATEGORIES_KEY);
            if (cached) return { data: cached };
          }
          return { error: error as { message: string } };
        }
      },
      providesTags: ["Category"],
    }),
    createSubscriptionWithSplit: builder.mutation<
      { subscription: Subscription; split: unknown },
      CreateSubscriptionInput & {
        split_username?: string | null;
        split_amount?: number | null;
      }
    >({
      queryFn: async (input) => {
        try {
          const { data, error } = await supabase.rpc(
            "create_subscription_with_split",
            {
              p_title: input.title,
              p_amount: input.amount,
              p_currency: input.currency,
              p_next_payment_date: input.next_payment_date,
              p_color_hex: input.color_hex,
              p_category_id: input.category_id,
              p_remind_before_days: input.remind_before_days,
              p_period: input.period,
              p_split_username: input.split_username ?? null,
              p_split_amount: input.split_amount ?? null,
            },
          );
          if (error) throw error;
          return {
            data: data as { subscription: Subscription; split: unknown },
          };
        } catch (error) {
          return { error: error as { message: string } };
        }
      },
      invalidatesTags: ["Subscription"],
    }),

    createSubscription: builder.mutation<Subscription, CreateSubscriptionInput>(
      {
        queryFn: async (input) => {
          try {
            const { data, error } = await supabase
              .from("subscriptions")
              .insert([input])
              .select()
              .single();
            if (error) throw error;
            return { data: data as Subscription };
          } catch (error) {
            if (!isOfflineError(error))
              return { error: error as { message: string } };
            const now = new Date().toISOString();
            const local: Subscription = {
              id: crypto.randomUUID(),
              category_id: null,
              color_hex: null,
              period: null,
              currency: "RUB",
              remind_before_days: 1,
              ...input,
              created_at: now,
              updated_at: now,
            };
            await addToOutbox({
              table: "subscriptions",
              op: "insert",
              payload: { ...local } as Record<string, unknown>,
            });
            const cached =
              (await readCache<Subscription[]>(SUBSCRIPTIONS_KEY)) ?? [];
            await writeCache(SUBSCRIPTIONS_KEY, sortByDate([...cached, local]));
            return { data: local };
          }
        },
        invalidatesTags: ["Subscription"],
      },
    ),

    updateSubscription: builder.mutation<Subscription, UpdateSubscriptionInput>(
      {
        queryFn: async ({ id, ...updates }) => {
          try {
            const { data, error } = await supabase
              .from("subscriptions")
              .update(updates)
              .eq("id", id)
              .select()
              .single();
            if (error) throw error;
            return { data: data as Subscription };
          } catch (error) {
            if (!isOfflineError(error))
              return { error: error as { message: string } };
            const cached =
              (await readCache<Subscription[]>(SUBSCRIPTIONS_KEY)) ?? [];
            const current = cached.find((item) => item.id === id);
            if (!current)
              return {
                error: { message: "Нет сети и подписка не найдена в кеше" },
              };
            const merged: Subscription = {
              ...current,
              ...updates,
              updated_at: new Date().toISOString(),
            };
            await addToOutbox({
              table: "subscriptions",
              op: "update",
              payload: { id, ...updates },
            });
            await writeCache(
              SUBSCRIPTIONS_KEY,
              sortByDate(
                cached.map((item) => (item.id === id ? merged : item)),
              ),
            );
            return { data: merged };
          }
        },
        invalidatesTags: ["Subscription"],
      },
    ),

    deleteSubscription: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase
            .from("subscriptions")
            .delete()
            .eq("id", id);
          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          if (!isOfflineError(error))
            return { error: error as { message: string } };
          await addToOutbox({
            table: "subscriptions",
            op: "delete",
            payload: { id },
          });
          await removeCachedList(SUBSCRIPTIONS_KEY, id);
          return { data: undefined };
        }
      },
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetCategoriesQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useCreateSubscriptionWithSplitMutation,
} = subscriptionApi;
