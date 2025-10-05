import { ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export const rpnCalc = {
    number(arg0) {
        return parseInt(arg0.sourceString)
    },
    Expr_bin(arg0 : any, arg1, arg2 : any) {
        if (arg2.sourceString == "+")
            return arg0.calculate() + arg1.calculate()
        if (arg2.sourceString == "*")
            return arg0.calculate() * arg1.calculate()
        throw 1
    },
} satisfies ReversePolishNotationActionDict<number>;
