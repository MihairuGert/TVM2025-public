import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
/// write the action rules here
    Expr_plus(arg0, arg1, arg2) {
        return arg0 + arg2
    },
} satisfies AddMulActionDict<number>

addMulSemantics.addOperation<Number>("calculate()", addMulCalc);

interface AddMulDict extends Dict {
    calculate(): number;
}

interface AddMulSemantics extends Semantics
{
    (match: MatchResult): AddMulDict;
}
