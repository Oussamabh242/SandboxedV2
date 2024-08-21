import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient() ;

interface DbInput{
  id : string , 
  testCases : string , 
  timeout : number , 
  order : number ,  
  functionName : string , 
  argType: string
}

interface TestCase {
  id : any , 
  input : any , 
  output : any
}
interface DbOutput{
  id : string , 
  tests : TestCase[] , 
  timeout : number , 
  order : number ,  
  functionName : string , 
  argType: string
}

export async function addProblem(input : DbInput){
  const problem = await prisma.problem.create({
    data: {
      id : input.id ,
      testCases:input.testCases ,
      timeout : input.timeout , 
      order : input.order ,
      functionName : input.functionName , 
      argType : input.argType 
    },
  });
  return problem; 
} 




export async function getProblem(id: string):Promise<DbOutput|null>{
  let problem = await prisma.problem.findUnique({
    where : {
      id : id ,
    }
  });
  let testCases = {}; 
  if (problem && problem.testCases){
    const testCases: TestCase[] = JSON.parse(problem.testCases) as TestCase[];
    const enhanced: DbOutput = { ...problem, tests:testCases };
    return enhanced;  
  }
  
 
  return null
}

const thing:DbInput = {
  testCases : JSON.stringify([
  {
    "id": 1,
    "input": "abcabcbb",
    "expected": 3
  },
  {
    "id": 2,
    "input": "bbbbb",
    "expected": 1
  },
  {
    "id": 3,
    "input": "pwwkew",
    "expected": 3
  },
  {
    "id": 4,
    "input": "aab",
    "expected": 2
  }
]
)  ,
  id : 'whatever' , 
  functionName : 'length_of_longest_substring',
  argType : '[string]' , 
  timeout : 3 , 
  order  : 1 
}

