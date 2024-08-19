import { PrismaClient } from "@prisma/client";
import { JSDocParsingMode } from "typescript";
import { where } from "underscore";

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
  testCases : TestCase[] , 
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



const thing:any = {
  "id" : 'flaskdfja' , 
  "functionName": "two_sum",
  "argType": "[[int], int]",
    "timeout": 2,
    "testcases": [
      {
        "id": 1,
        "input": [[2, 7, 11, 15], 9],
        "expected": [0, 1]
      },
      {
        "id": 2,
        "input": [[3, 2, 4], 6],
        "expected": [1, 2]
      },
      {
        "id": 3,
        "input": [[3, 3], 6],
        "expected": [0, 1]
      },
      {
        "id": 4,
        "input": [[1, 2, 3, 4, 5], 9],
        "expected": [3, 4]
      },
      {
        "id": 5,
        "input": [[2, 7, 11, 15], 18],
        "expected": [1, 2]
      }
    ]
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
    const enhanced: DbOutput = { ...problem, testCases };
    return enhanced;  
  }
  
 
  return null
}

//thing.testcases = JSON.stringify(thing.testcases);

