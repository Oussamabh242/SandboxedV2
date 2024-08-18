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
console.log(args)
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


let code = `function isPalindrome(n:number):boolean{
  for(;;){
    console.log('.' )
  }   
  return n.toString().split('').reverse().join('') === n.toString() 
}`

console.log(formatTypescript(code  , "isPalindrome" , '[number]'))
