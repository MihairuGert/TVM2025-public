import { Expr, Num, Var, Bin } from "../../lab04";

export function cost(e: Expr): number
{
    if (e instanceof Num) {
        return 0;
    }

    if (e instanceof Var) {
        return 1;
    }

    return 0;
}