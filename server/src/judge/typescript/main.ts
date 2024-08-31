import { spawn } from "child_process";
const  _ = require('lodash');

interface TsResponse {
  stdout: string;
  stderr: string;
  message: string;
  result?: any | null;
  expected? : any 
  code? : number ,
  input? : any

}
interface SubmitResponse {
		passed : number 
		input? : any 
		result? : any
		expected? : any
		stdout?: string
		stderr?: string 
		message?: string
}



export function runTypescript(file : string , id :string,testcasesFile:string , idOutput:Map<number,any>, idInput: Map<number,any> , order : number ) : Promise<TsResponse | string > {

  return new Promise((resolve) => {
    const command = "docker";
    const args = [
      "run",
      '-e' ,
      `TYPE=RUN`,
      `-e` , 
      `ID=${id}`,
      "--rm",
      "-v",
      `user_code_volume:/app/user_code`,
      `--name`,
      `${id}`,
      "tsrun", 
    ];

    let response = '';
    const pyChild = spawn(command, args);
    pyChild.stdout.on('data' , (data : any)=>{
      response+= data.toString() ;
    }) ; 
    pyChild.stderr?.on('data' , (data : any)=>{
      console.error(data.toString()) ; 
    }) ;
    pyChild.on("exit", async (code) => {
      try{ 
        let sanitizedRespons = await  JSON.parse(response)
        console.log(sanitizedRespons , typeof(sanitizedRespons))

        for(const resp of sanitizedRespons){
          resp.input = idInput.get(resp.id) ; 
          resp.expected= idOutput.get(resp.id); 
          let okay ; 
          if (order ===1){
            okay = _.isEqual(resp.result , idOutput.get(resp.id));
          }
          else{
            console.log(resp.result , resp)
            okay = _.isEqual(resp.result.sort() , idOutput.get(resp.id).sort())
          }
         if(okay){
            resp.message = 'Accepted'; 
          }else{
            resp.message = 'Wrong Answer'; 
          }
        }
        resolve(sanitizedRespons)
      }
      catch (err : any){
        console.error('err : ' , err);
        resolve('error') ; 
      }
    }) ; 

  })}

export function submitTypescript(file : string , id :string,testcasesFile:string , idOutput:Map<number,any>, idInput: Map<number,any>, order:number ) : Promise<TsResponse | any > {
  return new Promise((resolve) => {
    const command = "docker";
    const args = [
      "run",
      '-e' ,
      `TYPE=SUBMIT`,
      `-e` , 
      `ID=${id}`,
      "--rm",
      "-v",
      `user_code_volume:/app/user_code`,
      `--name`,
      `${id}`,
      "tsrun", 
    ];
    console.log(command , args.join(" "))
    let response :SubmitResponse = {passed:0};
    const pyChild = spawn(command, args);
    pyChild.stdout.on('data' , (data : any)=>{
      let res = data.toString() ;
      res = JSON.parse(res) ;
      if (_.isEqual(res[0].message ,"Compile Error")){
          response={...res[0] , passed : 0 , message:"Compile Error"};
      } 
      else {
        for(let i = 0  ; i<res.length ; i++){
        const thing = res[i]; 
        const expected = idOutput.get(thing.id) ; 
        let okay ;  
        if (order===1  || _.isEqual(thing.result,null)){
           okay = _.isEqual(thing.result , expected)
        }  
        else {
          okay = _.isEqual(thing.result.sort() , expected.sort())
        }
        if(!okay){
          response= {...response ,...thing,  input : idInput.get(thing.id) , expected : idOutput.get(thing.id) , message : "Wrong Answer"};
          break ; 
        }
        response.passed++; 
      }

    }
      

         }) ;
    pyChild.on("exit", async (code) => {
      if(!response.message)response.message = "Accepted"  ;
      resolve({...response })  
    }) ; 

  })}    




