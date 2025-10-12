import { Bin, Expr, Num, Var } from "../../lab04";

export function derive(e: Expr, varName: string): Expr {
    const derivative = rawDerive(e, varName);  
    return simplify(derivative); 
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
                e.parenthesis,
                false
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
    return e;
}

function isZero(e: Expr): boolean { 
    if (e instanceof Bin) {
        switch(e.op){
            case "+":
                return isZero(e.arg0) && isZero(e.arg1);
            case "-":// todo if opposite they are zero
                return isZero(e.arg0) && isZero(e.arg1);
            case "*":
                return isZero(e.arg0) || isZero(e.arg1);
        }
    } else if (e instanceof Num) {
        return e.value === "0";
    } 
    return false;
}

function isOne(e: Expr): boolean  { 
    if (e instanceof Bin) {
        switch(e.op){
            case "+":
                return isZero(e.arg0) && isOne(e.arg1) || isZero(e.arg1) && isOne(e.arg0);
            case "-":
                return isOne(e.arg0) && isZero(e.arg1);
            case "*":
                return isOne(e.arg0) && isOne(e.arg1); // if they are devided can equal to 1
        }
    } else if (e instanceof Num) {
        return e.value === "1";
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
            right.minus = (right.minus + 1) % 2;
            return right;
        }
        if (e.op === "/") {
            let minus = left.minus % 2 === right.minus % 2 ? 0 : 1;
            left.minus = 0;
            right.minus = 0;
            let b = new Bin(left, e.op, right, e.parenthesis);
            b.minus = minus;
            return b;
        }
        return new Bin(left, e.op, right, e.parenthesis);
    }
    return e;
}

function simplifyReduce(e: Expr): Expr {
    throw "asd";
}
