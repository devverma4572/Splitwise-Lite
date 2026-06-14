import { SplitInput, SplitType } from "@/types";
import { formatCurrency, roundAmount } from "@/lib/utils";

export function computeSplitAmounts(
  totalAmount: number,
  splitType: SplitType,
  splits: SplitInput[]
): { userId: string; amount: number }[] {
  if (splits.length === 0) return [];

  switch (splitType) {
    case "equal": {
      const perPerson = roundAmount(totalAmount / splits.length);
      const result = splits.map((s, index) => ({
        userId: s.userId,
        amount:
          index === splits.length - 1
            ? roundAmount(
                totalAmount -
                  perPerson * (splits.length - 1)
              )
            : perPerson,
      }));
      return result;
    }
    case "unequal": {
      return splits.map((s) => ({
        userId: s.userId,
        amount: roundAmount(s.value),
      }));
    }
    case "percentage": {
      return splits.map((s, index) => ({
        userId: s.userId,
        amount:
          index === splits.length - 1
            ? roundAmount(
                totalAmount -
                  splits
                    .slice(0, -1)
                    .reduce(
                      (sum, split) =>
                        sum + roundAmount((totalAmount * split.value) / 100),
                      0
                    )
              )
            : roundAmount((totalAmount * s.value) / 100),
      }));
    }
    case "share": {
      const totalShares = splits.reduce((sum, s) => sum + s.value, 0);
      if (totalShares === 0) return [];

      let allocated = 0;
      return splits.map((s, index) => {
        if (index === splits.length - 1) {
          return {
            userId: s.userId,
            amount: roundAmount(totalAmount - allocated),
          };
        }
        const amount = roundAmount((totalAmount * s.value) / totalShares);
        allocated += amount;
        return { userId: s.userId, amount };
      });
    }
    default:
      return [];
  }
}

export function validateSplits(
  totalAmount: number,
  splitType: SplitType,
  splits: SplitInput[]
): string | null {
  if (splits.length === 0) return "At least one member must be included";

  switch (splitType) {
    case "equal":
      return null;
    case "unequal": {
      const sum = roundAmount(splits.reduce((acc, s) => acc + s.value, 0));
      if (Math.abs(sum - totalAmount) > 0.01) {
        return `Split amounts must equal ${formatCurrency(totalAmount)} (currently ${formatCurrency(sum)})`;
      }
      return null;
    }
    case "percentage": {
      const sum = roundAmount(splits.reduce((acc, s) => acc + s.value, 0));
      if (Math.abs(sum - 100) > 0.01) {
        return `Percentages must equal 100% (currently ${sum.toFixed(2)}%)`;
      }
      return null;
    }
    case "share": {
      const sum = splits.reduce((acc, s) => acc + s.value, 0);
      if (sum <= 0) return "Total shares must be greater than 0";
      return null;
    }
    default:
      return "Invalid split type";
  }
}
