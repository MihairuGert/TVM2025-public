import { c as C, Op, I32 } from "../../wasm";
import { Expr, Bin, Var, Num, UnMin } from "../../lab04";
import { buildOneFunctionModule, Fn } from "./emitHelper";
const { i32, get_local} = C;
    
export function getVariables(e: Expr): string[] {
    const collectVars = (expr: Expr, vars: Set<string>): void => {
        if (expr instanceof Var) {
            vars.add(expr.name);
        } else if (expr instanceof Bin) {
            collectVars(expr.arg0, vars);
            collectVars(expr.arg1, vars);
        }
    };
    
    const varsSet = new Set<string>();
    collectVars(e, varsSet);
    return Array.from(varsSet);
}

export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>>
{
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: string[]): Op<I32> {
    let result: Op<I32>;
    
    if (e instanceof Var) {
        const index = args.indexOf(e.name);
        if (index === -1) {
            throw new Error(`Variable ${e.name} not found in function parameters`);
        }
        result = get_local(i32, index);
    }
    else if (e instanceof Bin) {
        const left = wasm(e.arg0, args);
        const right = wasm(e.arg1, args);
        
        switch (e.op) {
            case '+': result = i32.add(left, right); break;
            case '-': result = i32.sub(left, right); break;
            case '*': result = i32.mul(left, right); break;
            case '/': result = i32.div_s(left, right); break;
            default: throw new Error(`Unsupported op`);
        }
    }
    else if (e instanceof Num) {
        result = i32.const(parseInt(e.value));
    }
    else if (e instanceof UnMin) {
        result = i32.sub(i32.const(0), wasm(e.arg, args));
    }
    else {
        throw new Error(`Unknown class`);
    }
    
    return result;
}
