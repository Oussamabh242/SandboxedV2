export function fromatGateway(lagnuage:string , code :string, funtionName : string ,argType:string ){
  switch (lagnuage) {
    case 'python':
      return formatPython(code , funtionName);  
      break;
    case 'typescript' :
      return formatTypescript(code , funtionName , argType); 
    default:
      throw new Error('Invalid lagnuage') 
      break;
  }
}

export function formatTypescript(code :string , functionName : string , argType : string){

  let tsTemplate = `

const args : any[]= JSON.parse(process.argv[2]);
type ArgType = ${argType} ;
const data = {
    'type' : 'result' ,
    'content' :${functionName}(...args as ArgType),
}

console.log()
console.log(JSON.stringify(data)); `

  return code+tsTemplate ;

}
export function formatPython(code :string , funtionName :string ){

  let pythonTemplate = `
import sys
import json

args = json.loads(sys.argv[1])


data = {
'type' : 'result' ,
'content' : ${funtionName}(*args),
}

print(json.dumps(data))
`
  let formatted = '' ; 
  formatted = code + pythonTemplate ;
  return formatted ; 
}


//{
//  timeout :...  , 
//  argType : ... , 
//  tests : [
//    {
//      id : ... ,
//      input: ... , 
//      expected : ... , 
//    }
//  ]
//}
//{
//  timeout : ... , 
//  argType : ... , 
//  tests : [
//  {
//    id ... , 
//    input ... , 
//  }
//  ]
//}
//

interface TestCase {
  id : any , 
  input : any , 
  output : any
}
interface Inputs{
  id : string , 
  tests: TestCase[] , 
  timeout : number , 
  order : number ,  
  functionName : string , 
  argType: string
} 

export function formatJSON(originalObject : Inputs):[string , Map<number , any>,  Map<number , any>]{
  console.log(originalObject)
  const transformedObject = {
    timeout: originalObject.timeout,
    argType: originalObject.argType,
    tests: originalObject.tests.map(({ id, input }) => ({ id, input }))
  };
  const idOutput = new Map<number , any>(); 
  const idInput = new Map<number , any>();
  originalObject.tests.forEach((e:any) => {
    idOutput.set(e.id , e.expected); 
    idInput.set(e.id , e.input); 
  });

  return [JSON.stringify(transformedObject) , idOutput , idInput];
}

