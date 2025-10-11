import { grammar, MatchResult, NonterminalNode } from 'ohm-js';
import { arithGrammar, ArithmeticActionDict, ArithmeticSemantics, SyntaxError } from '../../lab03';
import { Bin, Expr, Num, Var } from './ast';

export const getExprAst: ArithmeticActionDict<Expr> = {
    number_number(arg0: any) {
        return new Num(arg0.sourceString);
    },
    number_variable(arg0 : any) {
        return new Var(arg0.sourceString);
    },
    Sum(arg0) {
        return parseBinaryExpression(arg0, "+");
    },
    Sub(arg0) {
        return parseBinaryExpression(arg0, "-");
    },
    Mul(arg0) {
        return parseBinaryExpression(arg0, "*");
    },
    Div(arg0) {
        return parseBinaryExpression(arg0, "/");
    },
    Atom_parenthesis(arg0, arg1, arg2) {
        const expr = arg1.parse();
        expr.parenthesis = true;
        return expr;
    }, 
    UnaryMin(arg0, arg1) {
        const minuses = arg0.children.length;
        let atom = arg1.parse();
        atom.minus += minuses;
        return atom;
    }
}

function parseBinaryExpression(arg0 : NonterminalNode, op : string): Expr {
    const children = arg0.asIteration().children;
    const values = children.map(child => child.parse());

    if (values.length === 0) return new Num("");
    if (values.length === 1) return values[0];

    let result = values[0];
    for (let i = 1; i < values.length; i++) {
        result = new Bin(result, op, values[i]);
    }
    return result;
}

export const semantics = arithGrammar.createSemantics();
semantics.addOperation("parse()", getExprAst);

export interface ArithSemanticsExt extends ArithmeticSemantics
{
    (match: MatchResult): ArithActionsExt
}

export interface ArithActionsExt 
{
    parse(): Expr
}
export function parseExpr(source: string): Expr
{
    const match = arithGrammar.match(source);
    if (!match.succeeded()) {
        throw new SyntaxError(match.message)
    } 
    return semantics(match).parse();
}


    
