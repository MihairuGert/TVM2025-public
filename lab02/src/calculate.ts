import { ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export const rpnCalc = {
    number(arg0) {
        return parseInt(arg0.sourceString)
    },
    Expr_sum(arg0 : any, arg1, arg2 : any) {
        return arg0.calculate() + arg1.calculate()
    },
    Expr_mul(arg0 : any, arg1, arg2 : any) {
        return arg0.calculate() * arg1.calculate()
    },
} satisfies ReversePolishNotationActionDict<number>;
