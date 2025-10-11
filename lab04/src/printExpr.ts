import { Expr, Bin, Num, Var } from "./ast";

const PRECEDENCE: { [key: string]: number } = {
    '+': 1, '-': 1,
    '*': 2, '/': 2
};

export function printExpr(e: Expr, doNeedPars?: boolean): string {
    let res: string = "";
    
    if (e instanceof Bin) {
        const left = printExpr(e.arg0);
        const right = printExpr(e.arg1);
        
        const rightNeedsParens = e.arg1 instanceof Bin && PRECEDENCE[e.op] > PRECEDENCE[e.arg1.op]
        || e.op == "-" && e.arg1 instanceof Bin && e.arg1.parenthesis
        || e.op == "/" && e.arg1 instanceof Bin && e.arg1.parenthesis;

        const leftNeedsParens = e.arg0 instanceof Bin && PRECEDENCE[e.op] > PRECEDENCE[e.arg0.op];
        
        const finalRight = rightNeedsParens ? `(${right})` : right;
        const finalLeft = leftNeedsParens ? `(${left})` : left;
        
        res = `${finalLeft} ${e.op} ${finalRight}`;
        
    } else if (e instanceof Num) {
        res = e.value;
    } else if (e instanceof Var) {
        res = e.name;
    }
    res = doNeedPars ? `(${res})` : res;
    return (doNeedPars || e instanceof Num || e instanceof Var) && e.minus % 2 != 0 ? "-" + res : res;
}
