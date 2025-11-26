import * as arith from "@tvm/lab04";
import { validateHeaderName } from "http";

export interface Position {
    line: number;
    column: number;
}

export interface Location {
    start: Position;
    end: Position;
}

export interface Located {
    location?: Location;
}

export interface Module
{
    type: 'mod';
    functions: FunctionDef[]
}
export interface FunctionDef
{
    type: 'func';
    name: string;
    parameters: ParameterDef[];
    returns: ParameterDef[];
    locals: ParameterDef[];
    body: Statement;
    loc: Located;
}

export interface Type
{
    type: "type"
    name: string
    isArray : boolean
}
export interface ParameterDef
{
    type:       "param";
    name:       string;
    varType:    Type;
    loc:        Located;
}

export type LValue = (SingleLValue | ArrLValue) & Located;
export interface SingleLValue {
  type: "lsingvar";
  name: string;
}
export interface ArrLValue {
  type: "larr";
  name: string;
  index: Expr;
}

export type Statement = (Ass | Cond | Loop | Blk) & Located;
export interface Ass {
    type: "assign";
    left: LValue[];
    right: Expr[];
}
export interface Cond {
    type: "if";
    condition: Condition;
    then: Statement;
    else: Statement | null;
}
export interface Loop {
    type: "while";
    condition: Condition;
    invariant: Predicate | null;
    body: Statement;
}
export interface Blk {
    type: "blk";
    stmts: Statement[];
}

export type Expr = (arith.Expr | FuncCallExpr | ArrAccessExpr) & Located;
export interface FuncCallExpr {
    type: "funccall";
    name: string;
    args: Expr[]; 
}
export interface ArrAccessExpr {
    type: "arraccess";
    name: string;
    index: Expr;
}

export type Condition = (True | False | Not | Paren | BinCond | Comp) & Located;

export interface True {
    type: "true";
}
export interface False {
    type: "false";
}
export interface Not {
    type: "not";
    condition: Condition;
}
export interface Paren {
    type: "paren";
    inner: Condition;   
}

export type BinCond = AndCond | OrCond | ImplCond;
export interface AndCond {
    type: "and";
    left: Condition;
    right: Condition;
}
export interface OrCond {
    type: "or";
    left: Condition;
    right: Condition;
}
export interface ImplCond {
    type: "impl";
    left: Condition;
    right: Condition;
}

export interface Comp {
    type: "comp";
    left: Expr;
    op: "==" | "!=" | ">" | "<" | ">=" | "<=";
    right: Expr;
}

export type Predicate = (Quantifier | FormulaRef | False | True | Comp | NotPred | BinPred | ParenPred) & Located;
export interface Quantifier {
    type: "quantifier";
    quant: "forall" | "exists";
    varName: string;
    varType: "int" | "int[]";
    body: Predicate;
}
export interface FormulaRef {
    type: "formula";
    name: string;
    parameters: ParameterDef[];
}
export interface NotPred {
    type: "not";
    predicate: Predicate;
}
export type BinPred = AndPred | OrPred; 
export interface AndPred {
    type: "and";
    left: Predicate;
    right: Predicate;
}
export interface OrPred {
    type: "or";
    left: Predicate;
    right: Predicate;
}
export interface ParenPred {
    type: "paren";
    inner: Predicate;
}
