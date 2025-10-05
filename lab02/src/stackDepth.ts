import { ReversePolishNotationActionDict } from "./rpn.ohm-bundle";

export const rpnStackDepth = {
    number(arg0) {
        return { max: 1, out: 1 };
    },  
    Expr_bin(arg0 : any, arg1 : any, arg2) {
        const stack1 = arg0.stackDepth;
        const stack2 = arg1.stackDepth;
        const res = stack1.out + stack2.out;
        const mx = Math.max(stack1.max, stack2.max + stack1.out);
        return {max: mx, out: res - 1};
    },
} satisfies ReversePolishNotationActionDict<StackDepth>;
export type StackDepth = {max: number, out: number};
