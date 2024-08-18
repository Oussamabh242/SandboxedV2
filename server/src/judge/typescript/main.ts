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

const testcases = JSON.parse(readFileSync('./test.json' , 'utf8')).tests;
const idInput = new Map<number, any>();
const idOutput = new Map<number , any>();


testcases.forEach((e:any) => {
  idInput.set(e.id , e.input);
  idOutput.set(e.id , e.expected); 
});

export function runTypescript(file : string  ,id :string) : Promise<TsResponse | string > {
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
      `./test.json:/app/test.json` ,
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

export function submitTypescript(file : string , id :string  ) : Promise<TsResponse | any > {
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
      `./test.json:/app/test.json` ,
      `--name`,
      `${id}`,
      "tsrunner", 
    ];
    console.log(command )
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


      //  all.push(data.toString('utf8'))
      //let res :any ; 
      //   res = data.toString() ;
      //  res = res.split('\n');
      //for(let j = 0 ; j<res.length ; j++){
      //
      //  let part = res[j].trim();
      //
      //  if(part.length==0){
      //    continue ;
      //  } 
      //  part = JSON.parse(part);
      //  console.log(part); 
      //  const expected = idOutput.get(part.id); 
      //  console.log(part.id , expected, part.result);
      //  if(_.isEqual(part.result , expected)){
      //    response.passed++ ;
      //
      //  }
      //  else {
      //
      //    response = {...response , ...part , expected : expected , code : 1  , input : idInput.get(res.id)};
      //
      //    resolve(response);  
      //  }
      //
      //  i++ ;
      //}
           
        //all.push(res);
    //    const expected = idOutput.get(res["id"]); 
    //    //console.log(expected);
    //    if(_.isEqual(res.result , expected)){
    //      response.passed++ ;
    //
    //    }
    //    else {
    //
    //      response = {...response , ...res , expected : expected , code : 1  , input : idInput.get(res.id)};
    //
    //      resolve(response);  
    //    }
    //
    //    i++ ;
    //
    //}) ; 
    //pyChild.stderr?.on('data' , (data : any)=>{
    //  console.error(data.toString()) ; 
    }) ;
    pyChild.on("exit", async (code) => {
      // console.log(all); 
      //all.forEach(elm=> {
      //  if(_.isEqual(elm.result , )) 
      //});
      resolve(response)  
    }) ; 

  })}    



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

