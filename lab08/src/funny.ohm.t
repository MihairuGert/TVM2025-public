Funny <: Arithmetic {  
  Module = Function+
  
  Function = variable "(" ParameterList ")" 
             Preopt? 
             ReturnList
             Postopt?
             Useopt?
             Statement
  
  Preopt = "requires" Predicate
  Postopt = "ensures" Predicate
  Useopt = ("uses" ParameterList)
  ParameterList = ListOf<VarDecl, ",">
  ParameterListNotEmpty = NonemptyListOf<VarDecl, ",">
  ReturnList = "returns" ParameterListNotEmpty --paramlist 
  |  "returns" "void" --void
  
  VarDecl = variable ":" Type

  Type = "int[]" --int_arr
       | "int" --int

  Statement = Assignment | Conditional | Loop | Block | Expression ";" --expr
  Expression = Sum
  
  Assignment = 
      | LValue "=" Expression ";"                          -- simple
      | ArrayAccess "=" Expression ";"                     -- array
      | ListOf<LValue, ","> "=" FunctionCall ";"  -- tuple
  
  LValue = variable
  
  Conditional = "if" "(" Condition ")" Statement ("else" Statement)?
  
  Loop = "while" "(" Condition ")" 
         Invariant?
         Statement
  Invariant = ("invariant" Predicate)
  Block = "{" Statement* "}"
  
  FunctionCall = variable "(" ArgumentList ")"
  ArgumentList = ListOf<Expression, ",">
  
  ArrayAccess = variable "[" Expression "]"
  
  Condition = 
      | "true" --true
      | "false" --false
      | Comparison --comp
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
  	  | Predicate "->" Predicate --imp
      | Predicate "or" Predicate --or
      | Predicate "and" Predicate --and
      | "not" Predicate --not
      | Quantifier --quant
      | FormulaRef --formulaRef
      | "true" --true
      | "false" --false
      | Comparison --comp
      | "(" Predicate ")" --parent
  
  Quantifier = ("forall" | "exists") "(" VarDecl "|" Predicate ")"
  
  FormulaRef = variable "(" ParameterList ")"
  
  Atom := 
      | FunctionCall
      | ArrayAccess
      | ...                
  
    space := " " | "\t" | "\n" | comment | ...
    comment = "//" (~endOfLine any)* endOfLine
    endOfLine = "\r" | "\n" | "\r\n"
    spaces := space+ | ...
}