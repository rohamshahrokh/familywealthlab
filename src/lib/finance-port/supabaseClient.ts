/**
 * supabaseClient.ts — COMMERCIAL PORT STUB
 * ─────────────────────────────────────────────────────────────────────────────
 * In the personal app this file talks to a hard-coded Supabase project. For
 * the commercial port we MUST NOT connect to the old Supabase, so every
 * helper here is a no-op that returns empty data. The queryClient is hard-
 * forced into demo mode, so these stubs should never actually be reached at
 * runtime — they exist only so the personal pages compile unchanged.
 *
 * The shape of each "store" is loose-on-purpose: we expose a Proxy that
 * answers `any` method name with a no-op so all the personal-app call sites
 * (`.getAll()`, `.create()`, `.bulkCreate()`, `.upsertAll()`, `.getRecent()`,
 * `.merge()`, `.saveKey()`, `.getForMonth()`, `.createUser()`,
 * `.updatePassword()`, etc.) compile and silently succeed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Row = Record<string, unknown>;
type GenericStore = Record<string, (...args: any[]) => Promise<any>> & {
  list: () => Promise<Row[]>;
  get: () => Promise<Row | null>;
  getOne: () => Promise<Row | null>;
  fetch: () => Promise<Row[]>;
  fetchAll: () => Promise<Row[]>;
  insert: (...args: any[]) => Promise<Row | null>;
  upsert: (...args: any[]) => Promise<Row | null>;
  update: (...args: any[]) => Promise<Row | null>;
  save: (...args: any[]) => Promise<Row | null>;
  remove: (...args: any[]) => Promise<void>;
  delete: (...args: any[]) => Promise<void>;
  deleteAll: () => Promise<void>;
  clear: () => Promise<void>;
  exists: (...args: any[]) => Promise<boolean>;
};

function genericStore(): GenericStore {
  const handler: ProxyHandler<Record<string, any>> = {
    get: (_target, prop) => {
      // every property is a no-op async function
      return async (..._args: any[]) => {
        const name = String(prop);
        if (name === "list" || name === "fetch" || name === "fetchAll") return [];
        if (name === "exists") return false;
        if (
          name === "remove" ||
          name === "delete" ||
          name === "deleteAll" ||
          name === "clear"
        )
          return undefined;
        // create / upsert / save / insert / update / get / getOne / getAll …
        if (name === "getAll" || name === "list") return [];
        return null;
      };
    },
  };
  return new Proxy({}, handler) as GenericStore;
}

export const sbSnapshot           = genericStore();
export const sbExpenses           = genericStore();
export const sbProperties         = genericStore();
export const sbStocks             = genericStore();
export const sbCrypto             = genericStore();
export const sbTimeline           = genericStore();
export const sbScenarios          = genericStore();
export const sbStockTx            = genericStore();
export const sbIncome             = genericStore();
export const sbStockDCA           = genericStore();
export const sbCryptoDCA          = genericStore();
export const sbPlannedInvestments = genericStore();
export const sbCryptoTx           = genericStore();
export const sbBills              = genericStore();
export const sbBudgets            = genericStore();
export const sbTelegramSettings   = genericStore();
export const sbAlertLogs          = genericStore();
export const sbFamilyMsgLog       = genericStore();
export const sbAppSettings        = genericStore();
export const sbUsers              = genericStore();
export const sbFireSettings       = genericStore();
export const sbFireScenarioConfig = genericStore();
export const sbFireYearAssumptions= genericStore();
export const sbMCFireSettings     = genericStore();
export const sbMCFireResults      = genericStore();
export const sbMCFirePresets      = genericStore();
export const sbTaxProfile         = genericStore();
export const sbV2Scenarios        = genericStore();
export const sbV2AssumptionsPreset= genericStore();
export const sbHouseholdPermissions = genericStore();

/**
 * Loose "supabase" client compatible with the personal app's call patterns.
 * Returns chainable no-ops; nothing is ever actually sent over the network.
 */
const noopChain: any = new Proxy(function () {}, {
  get: () => noopChain,
  apply: () => noopChain,
});

export const supabase: any = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (_cb: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: (_table: string) => ({
    select: () => ({
      eq: () => ({ single: async () => ({ data: null, error: null }), then: (r: any) => r({ data: [], error: null }) }),
      order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
      limit: () => Promise.resolve({ data: [], error: null }),
      then: (r: any) => r({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
  }),
  rpc: async () => ({ data: null, error: null }),
  storage: noopChain,
  channel: () => noopChain,
};
