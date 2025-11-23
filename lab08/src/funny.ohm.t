Funny <: Arithmetic {  
  Module = Function+
  
  Function = variable "(" ParameterList? ")" 
             ("requires" Predicate)? 
             "returns" ReturnList
             ("ensures" Predicate)?
             ("uses" UsesList)?
             Statement
  
  ParameterList = NonemptyListOf<VarDecl, ",">
  ReturnList = NonemptyListOf<VarDecl, ",">
  UsesList = NonemptyListOf<VarDecl, ",">
  
  VarDecl = variable ":" Type

  Type = "int" | "int[]"

  Statement = Assignment | Conditional | Loop | Block
  Expression = Sum
  
  Assignment = 
      | LValue "=" Expression ";"                          -- simple
      | ArrayAccess "=" Expression ";"                     -- array
      | NonemptyListOf<LValue, ","> "=" FunctionCall ";"  -- tuple
  
  LValue = variable
  
  Conditional = "if" "(" Condition ")" Statement ("else" Statement)?
  
  Loop = "while" "(" Condition ")" 
         ("invariant" Predicate)?
         Statement
  
  Block = "{" Statement* "}"
  
  FunctionCall = variable "(" ArgumentList? ")"
  ArgumentList = NonemptyListOf<Expression, ",">
  
  ArrayAccess = variable "[" Expression "]"
  
  Condition = 
      | "true" | "false" --c
      | Comparison 
      | "not" Condition --not
      | Condition "and" Condition --and
      | Condition "or" Condition --or
      | Condition "->" Condition --imp
      | "(" Condition ")" --parent
  
  Comparison = 
      | Expression "==" Expression
      | Expression "!=" Expression
      | Expression ">=" Expression
      | Expression "<=" Expression
      | Expression ">" Expression
      | Expression "<" Expression
  
  Predicate = 
      | Quantifier
      | FormulaRef
      | "true" | "false"
      | Comparison
      | "not" Predicate --not
      | Predicate "and" Predicate --and
      | Predicate "or" Predicate --or
      | "(" Predicate ")" --parent
  
  Quantifier = ("forall" | "exists") "(" VarDecl "|" Predicate ")"
  
  FormulaRef = variable "(" ArgumentList? ")"
  
  Atom := 
      | variable "(" ArgumentList? ")"  -- function_call
      | variable "[" Expression "]"     -- array_access  
      | ...                
  
    space := " " | "\t" | "\n" | comment | ...
    comment = "//" (~endOfLine any)* endOfLine
    endOfLine = "\r" | "\n" | "\r\n"
    spaces := space+ | ...
}