import { Bin, Expr, Num, UnMin, Var } from "../../lab04";
import { cost } from "./cost";

export function simplify(e: Expr, identities: [Expr, Expr][]): Expr {
    return simplifyWithHistory(e, identities, new Set());
}

function simplifyWithHistory(e: Expr, identities: [Expr, Expr][], seen: Set<string>): Expr {
    const exprString = exprToString(e);
    if (seen.has(exprString)) {
        return e;
    }
    seen.add(exprString);

    let simplifiedE = e.copy();
    if (e instanceof Bin) {
        simplifiedE = new Bin(
            simplifyWithHistory(e.arg0, identities, seen), 
            e.op, 
            simplifyWithHistory(e.arg1, identities, seen), 
            e.parenthesis
        );
    } else if (e instanceof UnMin) {
        simplifiedE = new UnMin(simplifyWithHistory(e.arg, identities, seen), e.parenthesis);
    }
    
    let minCost = cost(simplifiedE);
    let minExpr = simplifiedE;

    for (const ident of identities) {
        const bindings = new Map<string, Expr>();
        if (matches(ident[0], simplifiedE, bindings)) {
            let newExpr = format(ident[1], bindings);
            let curCost = cost(newExpr);
            
            if (curCost <= minCost) {
                const recursiveSimplified = simplifyWithHistory(newExpr, identities, seen);
                const recursiveCost = cost(recursiveSimplified);
                
                if (recursiveCost < minCost) {
                    minCost = recursiveCost;
                    minExpr = recursiveSimplified;
                }
            }
        }
    }
    
    return minExpr;
}

function matches(pattern: Expr, expr: Expr, bindings: Map<string, Expr>): boolean {
    if (pattern instanceof Var) {
        if (bindings.has(pattern.name)) {
            return exprEquals(bindings.get(pattern.name)!, expr);
        } else {
            bindings.set(pattern.name, expr.copy());
            return true;
        }
    }
    
    if (pattern instanceof Num && expr instanceof Num) {
        return pattern.value === expr.value;
    }
    
    if (pattern instanceof Var && expr instanceof Var) {
        return pattern.name === expr.name;
    }
    
    if (pattern instanceof Bin && expr instanceof Bin) {
        return pattern.op === expr.op && 
               matches(pattern.arg0, expr.arg0, bindings) && 
               matches(pattern.arg1, expr.arg1, bindings);
    }
    
    if (pattern instanceof UnMin && expr instanceof UnMin) {
        return matches(pattern.arg, expr.arg, bindings);
    }
    
    return false;
}

function exprEquals(a: Expr, b: Expr): boolean {
    if (a instanceof Num && b instanceof Num) {
        return a.value === b.value;
    }
    
    if (a instanceof Var && b instanceof Var) {
        return a.name === b.name;
    }

    if (a instanceof Bin && b instanceof Bin) {
        return a.op === b.op && 
               exprEquals(a.arg0, b.arg0) && 
               exprEquals(a.arg1, b.arg1);
    }
    
    if (a instanceof UnMin && b instanceof UnMin) {
        return exprEquals(a.arg, b.arg);
    }
    
    return false;
}

function format(pattern: Expr, bindings: Map<string, Expr>): Expr {
    if (pattern instanceof Var) {
        const elem = bindings.get(pattern.name);
        if (elem == undefined) {
            throw new Error(`Variable ${pattern.name} not found in bindings`);
        }
        return elem.copy();
    }
    if (pattern instanceof Bin) {
        return new Bin(
            format(pattern.arg0, bindings), 
            pattern.op, 
            format(pattern.arg1, bindings), 
            pattern.parenthesis
        );
    }
    if (pattern instanceof UnMin) {
        return new UnMin(format(pattern.arg, bindings), pattern.parenthesis);
    }
    return pattern.copy();
}

function exprToString(e: Expr): string {
    if (e instanceof Num) return `Num(${e.value})`;
    if (e instanceof Var) return `Var(${e.name})`;
    if (e instanceof UnMin) return `UnMin(${exprToString(e.arg)})`;
    if (e instanceof Bin) return `Bin(${exprToString(e.arg0)},${e.op},${exprToString(e.arg1)})`;
    return "Unknown";
}
