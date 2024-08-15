export function fromatGateway(lagnuage:string , code :string, funtionName : string){
  switch (lagnuage) {
    case 'python':
      return formatPython(code , funtionName);  
      break;
    case 'typescript' :
      return formatTypescript(code); 
    default:
      throw new Error('Invalid lagnuage') 
      break;
  }
}

export function formatTypescript(code :string){
  let formatted = '' ; 
  formatted += code + '\n\nconsole.log(main());'
  return formatted ;
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



