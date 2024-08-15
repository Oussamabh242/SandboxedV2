import { spawn } from "child_process";
import { readFileSync } from "fs";
const  _ = require('lodash');
import { cwd } from "process";

interface PyResponse {
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

export function execPython(file : string , timeout : number ,id :string ,  input :any ) : Promise<PyResponse | string > {
  return new Promise((resolve) => {
    const command = "docker";
    const args = [
      "run",
      '-e' ,
      'RUN',
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
        resolve(sanitizedRespons)
      }
      catch (err : any){
        console.error('err : ' , err);
        resolve('error') ; 
      }
    }) ; 

  })}

export function SubmitPython(file : string , timeout : number ,id :string ,  input :any ) : Promise<PyResponse | any > {
  return new Promise((resolve) => {
    const command = "docker";
    const args = [
      "run",
      '-e' ,
      'RUN',
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
    let response :SubmitResponse = {passed:0};
    const pyChild = spawn(command, args);
    pyChild.stdout.on('data' , (data : any)=>{
      const res = JSON.parse(data.toString()) ;
      if(_.isEqual(res.result , testcases[i].expected)){
        response.passed++ ;

      }
      else {
        response = {...response , ...res , expected : testcases[i].expected , code : 1};
        resolve(response);  
      }

      i++ ; 
    }) ; 
    //pyChild.stderr?.on('data' , (data : any)=>{
    //  console.error(data.toString()) ; 
    //}) ;
    pyChild.on("exit", async (code) => {
      console.log(response)
      resolve(response)  
    }) ; 

  })}




//export function execPython(file : string , timeout : number ,id :string ,  input :any) : Promise<PyResponse> {
//  return new Promise((resolve) => {
//    const command = "docker";
//    const args = [
//      "run",
//      "--rm",
//      "-v",
//      `./user_code/${file}:/app/code.py`,
//      `--name`,
//      `${id}`,
//      "snadpy", 
//    ];
//    const pyChild = spawn(command, args);
//    const response: PyResponse = { stdout: "", stderr: "", message: "" , code : 0 };
//    const timer = setTimeout(() => {
//      pyChild.kill("SIGKILL");
//      response.message = "Time Limit Exceeded";
//      response.stderr = "Time Limit Exceeded";
//      response.code = 1
//      response.result = null;
//    }, timeout * 1000);
//    pyChild.stdout?.on("data", (data: any) => {
//      response.stdout += data.toString();
//    });
//    pyChild.stderr?.on("data", (data) => {
//      response.stderr += data.toString();
//      response.result = null;
//      response.code = 1 ; 
//    });
//    pyChild.on("error", (error) => {
//      response.stderr += error.toString();
//      response.code = 1
//      response.result = null;
//    });
//    pyChild.on("exit", (code) => {
//      clearTimeout(timer);
//      const x = response.stdout.split("\n").filter((item) => item.trim());
//      try {
//        const res = x[x.length - 1];
//        let y = JSON.stringify(res);
//        response.result = JSON.parse(JSON.parse(y)).content;
//      } catch {
//        response.result = null;
//      }
//      x.pop();
//      //response.stdout = trimOutput(x.join("\n"));
//      response.stderr = response.stderr.replace(/File ".*?", /g , "code.py ");
//      resolve(response);
//    });
//  });
//}
