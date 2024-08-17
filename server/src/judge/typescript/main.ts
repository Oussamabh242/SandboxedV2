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

interface Response {
	result : any | null; 
	stdout : string
	message? : string
	stderr: string;
    expected? : any ;
    input : any ;
    output : any
}

interface Testcase {
    input : any[]
    output : any
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

const testcases = JSON.parse(readFileSync('./test.json' , 'utf8')).tests;
const idInput = new Map<number, any>();
const idOutput = new Map<number , any>();


testcases.forEach((e:any) => {
  idInput.set(e.id , e.input);
  idOutput.set(e.id , e.expected); 
});

export function runPython(file : string  ,id :string) : Promise<TsResponse | string > {
  return new Promise((resolve) => {
    const command = "docker";
    const args = [
      "run",
      '-e' ,
      `TYPE=SUBMIT`,
      "--rm",
      "-v",
      `./user_code/${file}:/app/code.py`,
      `-v` , 
      `./test.json:/app/test.json` ,
      `--name`,
      `${id}`,
      "pythonrunner", 
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
        console.log(response); 
        const sanitizedRespons = await  JSON.parse(response) 
        for(const resp of sanitizedRespons){
          resp.input = idInput.get(resp.id) ; 
          resp.expected= idOutput.get(resp.id); 
        }
        resolve(sanitizedRespons)
      }
      catch (err : any){
        console.error('err : ' , err);
        resolve('error') ; 
      }
    }) ; 

  })}

export function submitPython(file : string , id :string  ) : Promise<PyResponse | any > {
  return new Promise((resolve) => {
    const command = "docker";
    const args = [
      "run",
      '-e' ,
      `TYPE=SUBMIT`,
      "--rm",
      "-v",
      `./user_code/${file}:/app/code.py`,
      `-v` , 
      `./test.json:/app/test.json` ,
      `--name`,
      `${id}`,
      "pythonrunner", 
    ];
    let i = 0 ; 
    let all :any = []; 
    let response :SubmitResponse = {passed:0};
    const pyChild = spawn(command, args);
    pyChild.stdout.on('data' , (data : any)=>{
      let res = data.toString() ;
      res = JSON.parse(res) ;
      for(i  ; i<res.length ; i++){
        const thing = res[i]; 
        console.log(thing)
        const expected = idOutput.get(thing.id) ; 
        if(!_.isEqual(thing.result , expected)){
          resolve({...response ,...thing});
        }
        response.passed++; 
      }



//export function runTypescript(file: string, timeout: number, id: string) {
//  console.log(file, timeout, id);
//  return new Promise((resolve, reject) => {
//    const command = "docker";
//    const args = [
//      "run",
//      "-v",
//      `./user_code/${file}:/app/code.ts`,
//      "--name",
//      `${id}`,
//      "sandts",
//    ];
//    let output = {
//      stdout: "",
//      stderr: "",
//      isError: false,
//      timedOut: false,
//      killedByContainer: false,
//    };
//    const run = spawn(command, args);
//    run.stdout.on("data", (data) => {
//      output.stdout += data;
//
//    });
//    run.stderr.on("data", (data) =>{
//      output.stderr += data;
//    });
//    let timeoutCheck = setTimeout(() => {
//      output.timedOut = true; 
//      const stopCommand = `docker stop ${id}`;
//      exec(stopCommand, (err, stdout, stderr) => {
//        resolve(trim(output));
//      });
//    }, timeout);
//    run.on("close", (exitCode) => {
//      clearTimeout(timeoutCheck);
//      if (exitCode !== 0) {
//        output.isError = true;
//        if (output.stdout.includes("error TS")) {
//          output.stderr += output.stdout;
//          output.stdout = "";
//        }
//      }
//      resolve(output);
//    });
//  });
//}function trim(output : Output) {
//  console.log(output.stdout.length) ; 
//  if (output.stdout.length > 100) {
//    output.stdout =
//      output.stdout.substring(0, 10001) +
//      "... " +
//      (output.stdout.length - 10000).toString() +
//      " more characters";
//  }
//  return output;
//}
//interface Output {
//    stdout: string; 
//    stderr: string;
//    isError?: boolean;
//    timedOut?: boolean ; 
//
//}
//

