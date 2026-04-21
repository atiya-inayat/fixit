"use client";

import { Badge } from "@/components/ui/badge";
import api, { assetUrl } from "@/lib/api";
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface Transaction {
  _id: string;
  type: "donation" | "expense";
  amount: number;
  description: string;
  receiptUrl?: string;
  userName: string;
  createdAt: string;
}

interface LedgerData {
  transactions: Transaction[];
  totalRaised: number;
  totalSpent: number;
  balance: number;
}

export function FundingLedger({ issueId }: { issueId: string }) {
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/issues/${issueId}/ledger`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [issueId]);

  if (loading)
    return <div className="animate-pulse h-32 bg-gray-100 rounded" />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Funding Ledger
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Raised</p>
          <p className="text-lg font-bold text-green-700">
            Rs. {data.totalRaised}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="text-lg font-bold text-red-700">
            Rs. {data.totalSpent}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-lg font-bold text-blue-700">Rs. {data.balance}</p>
        </div>
      </div>

      {data.transactions.length > 0 && (
        <div className="border rounded-lg divide-y">
          {data.transactions.map((t) => (
            <div key={t._id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                {t.type === "donation" ? (
                  <ArrowDown className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowUp className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium">{t.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.description || t.type}
                    {t.receiptUrl && (
                      <>
                        {" "}
                        •{" "}
                        <a
                          href={assetUrl(t.receiptUrl!)}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          receipt
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <Badge
                variant={t.type === "donation" ? "default" : "destructive"}
              >
                {t.type === "donation" ? "+" : "-"}Rs. {t.amount}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
