import _ from "underscore";
import { runTypescript, submitTypescript } from "./judge/typescript/main";
import { runPython, submitPython , } from "./judge/python/main";

export async function submitGateway(language : string , file:string , id : string , testcasesFile : string , idOutput : Map<number , any> , idInput : Map<number , any> , order : number){
  switch (language) {
    case "python":
      return submitPython(file  ,id,testcasesFile , idOutput , idInput ,order );
    case "typescript" :
      return submitTypescript(file, id , testcasesFile, idOutput , idInput , order);
    default:
      break;
  }
}



export async function runGateway(language : string , file:string , id : string , testcasesFile : string , idOutput : Map<number , any> , idInput : Map<number , any>, order :number){
  switch (language) {
    case "python":
      return runPython(file  ,id,testcasesFile , idOutput , idInput , order  );
    case "typescript" :
      return runTypescript(file, id , testcasesFile, idOutput , idInput , order);
    default:
      break;
  }
}





