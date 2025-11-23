export abstract class Expr {
    parenthesis: boolean;
    type : string;
    
    constructor(parenthesis: boolean = false) {
        this.parenthesis = parenthesis;
        this.type = "expr";
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
        this.type = "bin";
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
        this.type = "num";
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
        this.type = "var";
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
        this.type = "unmin";
    }
    
    copy(): Expr {
        return new UnMin(this.arg.copy(), this.parenthesis);
    }
}
