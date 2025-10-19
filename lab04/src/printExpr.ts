import { Expr, Bin, Num, Var, UnMin } from "./ast";

const PRECEDENCE: { [key: string]: number } = {
    '+': 1, '-': 1,
    '*': 2, '/': 2,
    'unary-': 3  
};

export function printExpr(e: Expr, parentPrecedence: number = 0): string {
    if (e instanceof Bin) {
        const currentPrecedence = PRECEDENCE[e.op];
        const left = printExpr(e.arg0, currentPrecedence);
        const right = printExpr(e.arg1, currentPrecedence + (e.op === '-' || e.op === '/' ? 0.1 : 0));
        
        let result = `${left} ${e.op} ${right}`;
        
        if (parentPrecedence > currentPrecedence) {
            result = `(${result})`;
        }
        
        return result;
        
    } else if (e instanceof UnMin) {
        const currentPrecedence = PRECEDENCE['unary-'];
        const inner = printExpr(e.arg, currentPrecedence);
        
        let result = `-${inner}`;
        
        if (parentPrecedence > currentPrecedence || 
            (e.arg instanceof Bin && PRECEDENCE[e.arg.op] < currentPrecedence)) {
            result = `(${result})`;
        }
        
        return result;
        
    } else if (e instanceof Num) {
        return e.value;
    } else if (e instanceof Var) {
        return e.name;
    }
    
    return "";
}
