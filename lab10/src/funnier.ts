import { FunctionDef, Located, Module, ParameterDef, Predicate, Statement } from 'lab08/src';


export interface AnnotatedModule extends Module {
    type: 'mod';
    functions: AnnotatedFunctionDef[];
}

export interface AnnotatedFunctionDef {
    type: 'func';
    name: string;
    parameters: ParameterDef[];
    returns: ParameterDef[];
    locals: ParameterDef[];
    body: Statement;
    loc: Located;

    pre?: Predicate | null;
    post?: Predicate | null;
}