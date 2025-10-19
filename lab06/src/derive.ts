import { Bin, Expr, Num, Var, UnMin } from "../../lab04";

export function derive(e: Expr, varName: string): Expr {
    const derivative = rawDerive(e, varName);
    // hell yeah.  
    return simplify(simplify(derivative)); 
}

function rawDerive(e: Expr, varName: string): Expr {
    if (e instanceof Bin) {
        switch(e.op) {
        case "+":
        case "-":
            return new Bin(
                rawDerive(e.arg0, varName), 
                e.op, 
                rawDerive(e.arg1, varName),
                e.parenthesis
            );
            
        case "*":
            return new Bin(
                new Bin(
                    rawDerive(e.arg0, varName), "*", e.arg1, false),
                "+",
                new Bin(
                    e.arg0, "*", rawDerive(e.arg1, varName), false),
                e.parenthesis
            );
            
        case "/":
            return new Bin(
                new Bin(
                    new Bin(
                        rawDerive(e.arg0, varName), "*", e.arg1
                    ),
                    "-",
                    new Bin(
                        e.arg0, "*", rawDerive(e.arg1, varName)
                    )
                ),
                "/",
                new Bin(e.arg1, "*", e.arg1, true), 
                e.parenthesis
            );
        }
    } 
    else if (e instanceof Num) {
        return new Num("0", e.parenthesis);
    } 
    else if (e instanceof Var) {
        if (e.name === varName) {
            return new Num("1", e.parenthesis);
        } else {
            return new Num("0", e.parenthesis);
        }
    }
    else if (e instanceof UnMin) {
        return new UnMin(rawDerive(e.arg, varName), e.parenthesis);
    }
    return e;
}

function isZero(e: Expr): boolean { 
    if (e instanceof Bin) {
        switch(e.op){
            case "+":
                return isZero(e.arg0) && isZero(e.arg1);
            case "-":
                return isZero(e.arg0) && isZero(e.arg1);
            case "*":
                return isZero(e.arg0) || isZero(e.arg1);
        }
    } else if (e instanceof Num) {
        return e.value === "0";
    } else if (e instanceof UnMin) {
        return isZero(e.arg);
    }
    return false;
}

function isOne(e: Expr): boolean  { 
    if (e instanceof Bin) {
        switch(e.op){
            case "+":
                return (isZero(e.arg0) && isOne(e.arg1)) || (isZero(e.arg1) && isOne(e.arg0));
            case "-":
                return isOne(e.arg0) && isZero(e.arg1);
            case "*":
                return isOne(e.arg0) && isOne(e.arg1);
        }
    } else if (e instanceof Num) {
        return e.value === "1";
    } else if (e instanceof UnMin) {
        return false;
    }
    return false;
}

function simplify(e: Expr): Expr {
    if (e instanceof Bin) {
        const left = simplify(e.arg0);
        const right = simplify(e.arg1);
        
        if (e.op === "*" && (isZero(left) || isZero(right))) {
            return new Num("0");
        }
        
        if (e.op === "*" && isOne(left)) return right;
        if (e.op === "*" && isOne(right)) return left;
        
        if (e.op === "+" && isZero(left)) return right;
        if (e.op === "+" && isZero(right)) return left;
        
        if (e.op === "-" && isZero(right)) return left;
        if (e.op === "-" && isZero(left)) {
            return new UnMin(right);
        }
        
        if (e.op === "-" && right instanceof UnMin) {
            return new Bin(left, "+", right.arg, e.parenthesis);
        }
        
        if (e.op === "/" && left instanceof UnMin && right instanceof UnMin) {
            return new Bin(left.arg, "/", right.arg, e.parenthesis);
        }
        if (e.op === "/" && left instanceof UnMin) {
            return new UnMin(new Bin(left.arg, "/", right, e.parenthesis));
        }
        if (e.op === "/" && right instanceof UnMin) {
            return new UnMin(new Bin(left, "/", right.arg, e.parenthesis));
        }
        
        return new Bin(left, e.op, right, e.parenthesis);
    }
    else if (e instanceof UnMin) {
        const inner = simplify(e.arg);
        
        if (inner instanceof UnMin) {
            return inner.arg;
        }

        if (isZero(inner)) {
            return new Num("0");
        }

        if (inner instanceof Num) {
            const value = parseFloat(inner.value);
            return new Num((-value).toString());
        }
        
        return new UnMin(inner, e.parenthesis);
    }
    return e;
}

function expand(e: Expr): Expr {
    if (e instanceof Bin) {
        const left = expand(e.arg0);
        const right = expand(e.arg1);
        
        if (e.op === "*") {
            if (left instanceof Bin && left.op === "+") {
                return new Bin(
                    new Bin(left.arg0, "*", right),
                    "+",
                    new Bin(left.arg1, "*", right)
                );
            }
            if (right instanceof Bin && right.op === "+") {
                return new Bin(
                    new Bin(left, "*", right.arg0),
                    "+",
                    new Bin(left, "*", right.arg1)
                );
            }

            if (left instanceof UnMin) {
                return new UnMin(new Bin(left.arg, "*", right));
            }
            if (right instanceof UnMin) {
                return new UnMin(new Bin(left, "*", right.arg));
            }
        }
        
        if ((e.op === "+" || e.op === "-") && left instanceof UnMin && right instanceof UnMin) {
            if (e.op === "+") {
                return new UnMin(new Bin(left.arg, "+", right.arg));
            } else { 
                return new Bin(right.arg, "-", left.arg);
            }
        }
        
        return new Bin(left, e.op, right, e.parenthesis);
    }
    else if (e instanceof UnMin) {
        const inner = expand(e.arg);
        return new UnMin(inner, e.parenthesis);
    }
    return e;
}

const reduceMap = new Map<string, number>();

function reduce(e: Expr): Expr {
    if (e instanceof Bin) {
        const left = reduce(e.arg0);
        const right = reduce(e.arg1);

        return new Bin(left, e.op, right, e.parenthesis);
    }
    else if (e instanceof UnMin) {
        return new UnMin(reduce(e.arg), e.parenthesis);
    }
    return e;
}

function isNegative(e: Expr): boolean {
    return e instanceof UnMin;
}

function removeUnMin(e: Expr): Expr {
    if (e instanceof UnMin) {
        return e.arg;
    }
    return e;
}

function getVar(e: Expr): string {
    if (e instanceof Bin) {
        if (e.op === "*") {
            return getVar(e.arg0) + getVar(e.arg1);
        }
    } else if (e instanceof Var) {
        return e.name;
    } else if (e instanceof UnMin) {
        return getVar(e.arg);
    }
    return "";
}

function getNum(e: Expr): number {
    if (e instanceof Bin) {
        if (e.op === "*") {
            return getNum(e.arg0) * getNum(e.arg1);
        }
    } else if (e instanceof Num) {
        return parseFloat(e.value);
    } else if (e instanceof UnMin) {
        return -getNum(e.arg);
    }
    return 1;
}
