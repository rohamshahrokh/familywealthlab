"use client";

/**
 * IpCapacityForm — client component with controlled inputs that submit
 * via GET form (URL params) so the server-rendered calculator refreshes.
 * Defaults are pre-populated from current URL params.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, inputCls } from "@/components/workspace/forms/Field";
import { Button } from "@/components/ui/Button";

export function IpCapacityForm({ basePath }: { basePath: string }) {
  const sp = useSearchParams();
  const router = useRouter();

  const [targetPrice, setTargetPrice] = React.useState(
    sp.get("ip_target_price") ?? "750000"
  );
  const [months, setMonths] = React.useState(
    sp.get("ip_months") ?? "12"
  );
  const [buffer, setBuffer] = React.useState(
    sp.get("ip_buffer") ?? "10000"
  );
  const [liqStocks, setLiqStocks] = React.useState(
    sp.get("ip_liq_stocks") === "1"
  );
  const [liqStocksPct, setLiqStocksPct] = React.useState(
    sp.get("ip_liq_stocks_pct") ?? "50"
  );
  const [liqCrypto, setLiqCrypto] = React.useState(
    sp.get("ip_liq_crypto") === "1"
  );
  const [liqCryptoPct, setLiqCryptoPct] = React.useState(
    sp.get("ip_liq_crypto_pct") ?? "50"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      tab: "portfolio",
      ip_target_price: targetPrice,
      ip_months: months,
      ip_buffer: buffer,
      ip_liq_stocks: liqStocks ? "1" : "0",
      ip_liq_stocks_pct: liqStocksPct,
      ip_liq_crypto: liqCrypto ? "1" : "0",
      ip_liq_crypto_pct: liqCryptoPct,
      ip_open: "1",
    });
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Target property price (AUD)">
          <input
            type="number" min="0" step="1"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Months until purchase">
          <input
            type="number" min="0" max="120" step="1"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Safety buffer (AUD)">
          <input
            type="number" min="0" step="1"
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Stocks liquidation */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={liqStocks}
              onChange={(e) => setLiqStocks(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-ember-500"
            />
            <span className="text-body-sm text-ink-secondary font-medium">
              Liquidate stocks for deposit
            </span>
          </label>
          {liqStocks && (
            <Field label={`Liquidate ${liqStocksPct}% of stock portfolio`}>
              <input
                type="range" min="0" max="100" step="5"
                value={liqStocksPct}
                onChange={(e) => setLiqStocksPct(e.target.value)}
                className="w-full accent-ember-500"
              />
            </Field>
          )}
        </div>

        {/* Crypto liquidation */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={liqCrypto}
              onChange={(e) => setLiqCrypto(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-ember-500"
            />
            <span className="text-body-sm text-ink-secondary font-medium">
              Liquidate crypto for deposit
            </span>
          </label>
          {liqCrypto && (
            <Field label={`Liquidate ${liqCryptoPct}% of crypto portfolio`}>
              <input
                type="range" min="0" max="100" step="5"
                value={liqCryptoPct}
                onChange={(e) => setLiqCryptoPct(e.target.value)}
                className="w-full accent-ember-500"
              />
            </Field>
          )}
        </div>
      </div>

      <div className="pt-1">
        <Button type="submit" variant="primary" size="sm">
          Recalculate
        </Button>
      </div>
    </form>
  );
}
