import { spawn } from "child_process";
import { readFileSync } from "fs";
import test from "node:test";
const  _ = require('lodash');
import { cwd } from "process";
import { isEqual } from "underscore";

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
      `TYPE=SUBMIT`,
      "--rm",
      "-v",
      `./user_code/${file}:/app/code.ts`,
      `-v` , 
      `./user_code/${testcasesFile}:/app/test.json` ,
      `--name`,
      `${id}`,
      "tsrunner", 
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
        const sanitizedRespons = await  JSON.parse(response) 
        for(const resp of sanitizedRespons){
          resp.input = idInput.get(resp.id) ; 
          resp.expected= idOutput.get(resp.id); 
          let okay ; 
          if (order ===1){
            okay = _.isEqual(resp.result , idOutput.get(resp.id));
          }
          else{
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
       "--rm",
      "-v",
      `./user_code/${file}:/app/code.ts`,
      `-v` , 
      `./user_code/${testcasesFile}:/app/test.json` ,
      `--name`,
      `${id}`,
      "tsrunner", 
    ];
    let i = 0 ; 
    let response :SubmitResponse = {passed:0};
    const pyChild = spawn(command, args);
    pyChild.stdout.on('data' , (data : any)=>{
      let res = data.toString() ;
      res = JSON.parse(res) ;
      for(i  ; i<res.length ; i++){
        const thing = res[i]; 
        const expected = idOutput.get(thing.id) ; 
        let okay ;  
        if (order===1){
           okay = _.isEqual(thing.result , expected)
        }  
        else {
          okay = _.isEqual(thing.result.sort() , expected.sort())
        }
        if(!okay){
          resolve({...response ,...thing,  input : idInput.get(thing.id) , expected : idOutput.get(thing.id)});
        }
        response.passed++; 
      }


         }) ;
    pyChild.on("exit", async (code) => {

      resolve(response)  
    }) ; 

  })}    




