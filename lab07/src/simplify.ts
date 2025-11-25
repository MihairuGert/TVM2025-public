import { Bin, Expr, Num, UnMin, Var } from "../../lab04";
import { cost } from "./cost";

type Rule = [Expr, Expr];

function exprEquals(a: Expr, b: Expr): boolean {
    if (a.constructor !== b.constructor) return false;
    
    if (a instanceof Num && b instanceof Num) {
        return a.value === b.value;
    }
    
    if (a instanceof Var && b instanceof Var) {
        return a.name === b.name;
    }

    if (a instanceof UnMin && b instanceof UnMin) {
        return exprEquals(a.arg, b.arg);
    }
    
    if (a instanceof Bin && b instanceof Bin) {
        return a.op === b.op && 
               exprEquals(a.arg0, b.arg0) && 
               exprEquals(a.arg1, b.arg1);
    }
    
    return false;
}

function getMatchMap(pattern: Expr, expr: Expr): Map<string, Expr> | null {
    const bindings = new Map<string, Expr>();
    
    function match(p: Expr, e: Expr): boolean {
        if (p instanceof Var) {
            if (bindings.has(p.name)) {
                return exprEquals(bindings.get(p.name)!, e);
            } else {
                bindings.set(p.name, e.copy());
                return true;
            }
        }
        
        if (p instanceof Num && e instanceof Num) {
            return p.value === e.value;
        }
        
        if (p instanceof UnMin && e instanceof UnMin) {
            return match(p.arg, e.arg);
        }
        
        if (p instanceof Bin && e instanceof Bin) {
            return p.op === e.op && 
                   match(p.arg0, e.arg0) && 
                   match(p.arg1, e.arg1);
        }
        
        return false;
    }
    
    return match(pattern, expr) ? bindings : null;
}

function substitute(expr: Expr, bindings: Map<string, Expr>): Expr {
    if (expr instanceof Var) {
        const bound = bindings.get(expr.name);
        return bound ? bound.copy() : expr.copy();
    }
    
    if (expr instanceof Num) {
        return expr.copy();
    }
    
    if (expr instanceof UnMin) {
        return new UnMin(substitute(expr.arg, bindings), expr.parenthesis);
    }
    
    if (expr instanceof Bin) {
        return new Bin(
            substitute(expr.arg0, bindings),
            expr.op,
            substitute(expr.arg1, bindings),
            expr.parenthesis
        );
    }
    
    return expr.copy();
}

function foldConstants(expr: Expr): Expr {
    if (expr instanceof Num || expr instanceof Var) {
        return expr.copy();
    }
    
    if (expr instanceof UnMin) {
        const arg = foldConstants(expr.arg);
        
        if (arg instanceof UnMin) {
            return arg.arg;
        }

        if (arg instanceof Num) {
            return new Num((-parseFloat(arg.value)).toString());
        }
        
        return new UnMin(arg, expr.parenthesis);
    }
    
    if (expr instanceof Bin) {
        const left = foldConstants(expr.arg0);
        const right = foldConstants(expr.arg1);
        
        if (left instanceof Num && right instanceof Num) {
            const a = parseFloat(left.value);
            const b = parseFloat(right.value);
            switch (expr.op) {
                case "+": return new Num((a + b).toString());
                case "-": return new Num((a - b).toString());
                case "*": return new Num((a * b).toString());
                case "/": 
                    if (b === 0) return new Bin(left, expr.op, right, expr.parenthesis);
                    return new Num((a / b).toString());
            }
        }
        
        if (left instanceof Num) {
            const numVal = parseFloat(left.value);
            if (numVal === 0) {
                switch (expr.op) {
                    case "+": return right;
                    case "*": return new Num("0");
                    case "-": 
                        return new UnMin(right, expr.parenthesis);
                }
            } else if (numVal === 1 && expr.op === "*") {
                return right;
            }
        }
        
        if (right instanceof Num) {
            const numVal = parseFloat(right.value);
            if (numVal === 0) {
                switch (expr.op) {
                    case "+": return left;
                    case "-": return left; 
                    case "*": return new Num("0");
                }
            } else if (numVal === 1) {
                switch (expr.op) {
                    case "*": return left; 
                    case "/": return left;
                }
            }
        }
        
        return new Bin(left, expr.op, right, expr.parenthesis);
    }
    
    return expr.copy();
}

function collectVars(expr: Expr, vars: Set<string>): void {
    if (expr instanceof Var) {
        vars.add(expr.name);
    } else if (expr instanceof UnMin) {
        collectVars(expr.arg, vars);
    } else if (expr instanceof Bin) {
        collectVars(expr.arg0, vars);
        collectVars(expr.arg1, vars);
    }
}

function sameVarSet(a: Expr, b: Expr): boolean {
    const varsA = new Set<string>();
    const varsB = new Set<string>();
    collectVars(a, varsA);
    collectVars(b, varsB);
    
    if (varsA.size !== varsB.size) return false;
    for (const v of varsA) {
        if (!varsB.has(v)) return false;
    }
    return true;
}

function applyRuleEverywhere(expr: Expr, from: Expr, to: Expr): Expr[] {
    const results: Expr[] = [];

    const bindings = getMatchMap(from, expr);
    if (bindings) {
        const substituted = substitute(to, bindings);
        results.push(foldConstants(substituted));
    }

    if (expr instanceof UnMin) {
        for (const result of applyRuleEverywhere(expr.arg, from, to)) {
            results.push(foldConstants(new UnMin(result, expr.parenthesis)));
        }
    } else if (expr instanceof Bin) {
        for (const leftResult of applyRuleEverywhere(expr.arg0, from, to)) {
            results.push(foldConstants(new Bin(leftResult, expr.op, expr.arg1, expr.parenthesis)));
        }
        for (const rightResult of applyRuleEverywhere(expr.arg1, from, to)) {
            results.push(foldConstants(new Bin(expr.arg0, expr.op, rightResult, expr.parenthesis)));
        }
    }

    return results;
}

function reduce(expr: Expr, rules: Rule[]): Expr {
    let current = expr;
    
    while (true) {
        const currentCost = cost(current);
        let best = current;
        let bestCost = currentCost;

        for (const [from, to] of rules) {
            for (const candidate of applyRuleEverywhere(current, from, to)) {
                const candidateCost = cost(candidate);
                if (candidateCost < bestCost) {
                    bestCost = candidateCost;
                    best = candidate;
                }
            }
        }

        if (bestCost < currentCost) {
            current = best;
        } else {
            return current;
        }
    }
}

export function simplify(expr: Expr, identities: [Expr, Expr][]): Expr {
    const rules: Rule[] = [...identities];
    for (const [left, right] of identities) {
        if (sameVarSet(left, right)) {
            rules.push([right, left]);
        }
    }

    const startCost = cost(expr);

    const MAX_EXTRA_COST = 10;
    const MAX_NODES = 50000;

    const visited = new Set<string>();
    const queue: Expr[] = [];

    let best = expr;
    let bestCost = startCost;

    function getKey(e: Expr): string {
        if (e instanceof Num) return `Num(${e.value})`;
        if (e instanceof Var) return `Var(${e.name})`;
        if (e instanceof UnMin) return `UnMin(${getKey(e.arg)})`;
        if (e instanceof Bin) return `Bin(${getKey(e.arg0)},${e.op},${getKey(e.arg1)})`;
        return "Unknown";
    }

    function enqueue(e: Expr): void {
        const currentCost = cost(e);
        if (currentCost > startCost + MAX_EXTRA_COST) return;

        const key = getKey(e);
        if (visited.has(key)) return;
        
        visited.add(key);
        queue.push(e);

        if (currentCost < bestCost) {
            bestCost = currentCost;
            best = e;
        }
    }

    enqueue(expr);

    while (queue.length > 0 && visited.size < MAX_NODES) {
        const current = queue.shift()!;
        
        for (const [from, to] of rules) {
            for (const candidate of applyRuleEverywhere(current, from, to)) {
                enqueue(candidate);
            }
        }
    }

    return reduce(best, rules);
}
