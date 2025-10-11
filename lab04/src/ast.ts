export abstract class Expr
{
    parenthesis : boolean;
    minus : number = 0;
    
    constructor(parenthesis : boolean = false, minus : boolean = false) {
        this.parenthesis = parenthesis;
        this.minus += minus ? 1 : 0;
    }
}
 
export class Bin extends Expr
{
    op : string;
    arg0 : Expr;
    arg1 : Expr;
    
    constructor(arg0: Expr, op : string, arg1: Expr, par : boolean = false, minus : boolean = false) {
        super(par, minus);
        this.op = op;
        this.arg0 = arg0;
        this.arg1 = arg1;
    }
}

export class Num extends Expr
{
    value : string;
        
    constructor(value : string, par : boolean = false, minus : boolean = false) {
        super(par, minus);
        this.value = value;
    }
}

export class Var extends Expr
{
    name : string;
        
    constructor(name : string, par : boolean = false, minus : boolean = false) {
        super(par, minus);
        this.name = name;
    }
}

