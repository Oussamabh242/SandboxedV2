import { PrismaClient } from "@prisma/client";
import { functions } from "lodash";

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

export async function allProblems(){
  const problems = await prisma.problem.findMany();
  if(problems){
    return problems; 
  }
  return null;  
}

