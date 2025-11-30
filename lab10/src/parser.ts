import { MatchResult, Semantics } from 'ohm-js';

import grammar, { FunnierActionDict } from './funnier.ohm-bundle';

import { AnnotatedModule, AnnotatedFunctionDef } from './funnier';
import { getFunnyAst, parseFunny, parseOptional, Predicate, checkFunctionCalls, ParameterDef, checkUniqueNames, collectNamesInNode, Statement} from '@tvm/lab08';

const getFunnierAst = {
    ...getFunnyAst,

    Preopt(_, pred) {
        return pred.parse();
    },

    Postopt(_, post) {
        return post.parse();
    },

    Function(name, left_paren, params_opt, right_paren, preopt, returns_list, postopt, useopt, statement: any) {
        const func_name = name.sourceString;
        const func_parameters: ParameterDef[] = params_opt.parse();
        const return_array: ParameterDef[] = returns_list.parse();
    
        // uses
        const locals_array: ParameterDef[] = parseOptional<ParameterDef[]>(useopt, []);
    
        const all = [...func_parameters, ...return_array, ...locals_array];
        checkUniqueNames(all, "variable");
        
        const declared = new Set<string>();
        for (const i of func_parameters) {
            declared.add(i.name);
        }
        for (const i of return_array) {
            declared.add(i.name);
        }
        for (const i of locals_array) {
            declared.add(i.name);
        }
        const used_in_body = new Set<string>();
        const parsedStatement = statement.parse() as Statement;
    
        collectNamesInNode(parsedStatement, used_in_body);
    
        for (const name of used_in_body) {
            if (!declared.has(name)) {
                throw new Error("Function: local variable " + name + " is not declared");
            }
        }
    
        return { 
            type: "func", 
            name: func_name, 
            parameters: func_parameters, 
            returns: return_array, 
            locals: locals_array, 
            body: parsedStatement, 
            post: parseOptional<Predicate | null>(postopt, null),
            pre: parseOptional<Predicate | null>(preopt, null),
            } as AnnotatedFunctionDef;
        },
} satisfies FunnierActionDict<any>;

export const semantics: FunnySemanticsExt = grammar.Funnier.createSemantics() as FunnySemanticsExt;
semantics.addOperation("parse()", getFunnierAst);
export interface FunnySemanticsExt extends Semantics
{
    (match: MatchResult): FunnyActionsExt
}

interface FunnyActionsExt 
{
    parse(): AnnotatedModule;
}

export function parseFunnier(source: string, origin?: string): AnnotatedModule
{
    const matchResult = grammar.Funnier.match(source, "Module");

    if (!matchResult.succeeded()) {
        throw new SyntaxError(matchResult.message);
    }

    const ast_module = semantics(matchResult).parse();
    checkFunctionCalls(ast_module);
    return ast_module;
}