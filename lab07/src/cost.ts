import { Expr, Num, Var, Bin, UnMin } from "../../lab04";

export function cost(e: Expr): number
{
    if (e instanceof Num) {
        return 0;
    }

    if (e instanceof Var) {
        return 1;
    }

    if (e instanceof UnMin) {
        return 1 + cost(e.arg);
    }

    if (e instanceof Bin) {
        return 1 + cost(e.arg0) + cost(e.arg1);
    }

    return 0;
}