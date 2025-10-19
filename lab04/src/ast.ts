export abstract class Expr {
    parenthesis: boolean;
    
    constructor(parenthesis: boolean = false) {
        this.parenthesis = parenthesis;
    }
    
    abstract copy(): Expr;
}

export class Bin extends Expr {
    op: string;
    arg0: Expr;
    arg1: Expr;
    
    constructor(arg0: Expr, op: string, arg1: Expr, par: boolean = false) {
        super(par);
        this.op = op;
        this.arg0 = arg0;
        this.arg1 = arg1;
    }
    
    copy(): Expr {
        return new Bin(this.arg0.copy(), this.op, this.arg1.copy(), this.parenthesis);
    }
}

export class Num extends Expr {
    value: string;
        
    constructor(value: string, par: boolean = false) {
        super(par);
        this.value = value;
    }
    
    copy(): Expr {
        return new Num(this.value, this.parenthesis);
    }
}

export class Var extends Expr {
    name: string;
        
    constructor(name: string, par: boolean = false) {
        super(par);
        this.name = name;
    }
    
    copy(): Expr {
        return new Var(this.name, this.parenthesis);
    }
}

export class UnMin extends Expr {
    arg: Expr;
    
    constructor(arg: Expr, par: boolean = false) {
        super(par);
        this.arg = arg;
    }
    
    copy(): Expr {
        return new UnMin(this.arg.copy(), this.parenthesis);
    }
}
