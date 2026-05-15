/**
 * Re-export of the demo-mode finance-port Supabase stub.
 * The personal pages reference `@/lib/supabaseClient`; routing it here keeps
 * imports working while still guaranteeing we never hit the old Supabase.
 */
export * from "./finance-port/supabaseClient";
export { supabase } from "./finance-port/supabaseClient";
