export abstract class Expr
{
    parenthesis : boolean;
    
    constructor(parenthesis : boolean = false) {
        this.parenthesis = parenthesis;
    }
}
 
export class Bin extends Expr
{
    op : string;
    arg0 : Expr;
    arg1 : Expr;
    
    constructor(arg0: Expr, op : string, arg1: Expr, par : boolean = false) {
        super(par);
        this.op = op;
        this.arg0 = arg0;
        this.arg1 = arg1;
    }
}

export class Num extends Expr
{
    value : string;
        
    constructor(value : string, par : boolean = false) {
        super(par);
        this.value = value;
    }
}

export class Var extends Expr
{
    name : string;
        
    constructor(name : string, par : boolean = false) {
        super(par);
        this.name = name;
    }
}

export class UnMin extends Expr
{
    arg : Expr;

    constructor(arg : Expr, par : boolean = false) {
        super(par);
        this.arg = arg;
    }
}
