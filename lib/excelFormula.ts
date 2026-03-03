/**
 * Excel-style formula transpiler (European format) — frontend copy.
 *
 * Converts formulas like:
 *   =IF(amount*1,7%<650;650*1,19;amount*1,7%*1,19)
 *   =amount*3%
 *   =MIN(amount*5%;1000)
 *
 * European conventions:
 *   , = decimal separator  (1,7 → 1.7)
 *   ; = argument separator (IF(a;b;c) → IF(a,b,c))
 *   % = percent operator   (1,7% → (1.7/100))
 */

const __IF = (cond: unknown, thenVal: number, elseVal: number): number =>
  cond ? thenVal : elseVal;

const __SUM = (...args: number[]): number =>
  args.reduce((a, b) => a + b, 0);

export function excelFormulaToJS(formula: string): string {
  let f = formula.trim();

  if (f.startsWith("=")) {
    f = f.slice(1);
  }

  f = f.replace(/,/g, ".");
  f = f.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  f = f.replace(/;/g, ",");

  f = f.replace(/\bIF\s*\(/gi, "__IF(");
  f = f.replace(/\bSUM\s*\(/gi, "__SUM(");
  f = f.replace(/\bMIN\s*\(/gi, "Math.min(");
  f = f.replace(/\bMAX\s*\(/gi, "Math.max(");
  f = f.replace(/\bABS\s*\(/gi, "Math.abs(");
  f = f.replace(/\bROUND\s*\(/gi, "Math.round(");

  return f;
}

export function validateExcelFormula(
  formula: string,
): { valid: boolean; error?: string } {
  try {
    const jsExpr = excelFormulaToJS(formula);
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "amount",
      "__IF",
      "__SUM",
      "Math",
      `"use strict"; return (${jsExpr});`,
    ) as (a: number, i: typeof __IF, s: typeof __SUM, m: typeof Math) => number;

    const result = fn(100, __IF, __SUM, Math);
    if (!Number.isFinite(result)) {
      return { valid: false, error: "Formula produces non-finite result" };
    }
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e?.message ?? "Invalid formula syntax" };
  }
}
