import { spawn } from "child_process";
const  _ = require('lodash');

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





export function runPython(file : string , id :string , testcasesFile:string , idOutput:Map<number,any>, idInput: Map<number,any> , order :number  ) : Promise<PyResponse | string > {

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
      "pyrun", 
    ];
    /*const args = [
      "run",
      '-e' ,
      `TYPE=RUN`, 
       "--rm",
      "-v",
      `/app/server/user_code/${file}:/app/code.py`,
      `-v` , 
      `/app/server/user_code/${testcasesFile}:/app/test.json` ,
      `--name`,
      `${id}`,
      "pyrunner", 
    ]*/
    let response = '';

    const pyChild = spawn(command, args);
    pyChild.stdout.on('data' , (data : any)=>{
      response+= data.toString() ;
    }) ; 
    pyChild.stderr?.on('data' , (data : any)=>{
      console.error(data.toString()) ; 
    }) ;
    pyChild.on('error' , (err:any)=>{
      console.log('error')
    })
    pyChild.on("exit", async (code) => {
      try{ 
       let sanitizedRespons = await  JSON.parse(response); 
        for(const resp of sanitizedRespons){
          resp.input = idInput.get(resp.id) ; 
          resp.expected= idOutput.get(resp.id);
          if(_.isEqual(resp.good , false)){
            resp.message = "error"; 
            console.log('here'); 
          }
          else{
          
            let okay ; 
            if (order ===1){
              okay = _.isEqual(resp.result , idOutput.get(resp.id));
            }
            else if(typeof resp.result != typeof idOutput.get(resp.id)){
              okay = false;
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
        }
        resolve(sanitizedRespons)
      }
      catch (err : any){
        console.error('err : ' , err);
        resolve('error') ; 
      }
    }) ; 

  })}

export function submitPython(file : string , id :string , testcasesFile:string , idOutput:Map<number,any>, idInput: Map<number,any> , order:number  ) : Promise<PyResponse | any > {
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
      "pyrun", 
    ];
    let i = 0 ; 
    let response :SubmitResponse = {passed:0};
    const pyChild = spawn(command, args);
    let res :any ; 
    pyChild.stdout.on('data' , async (data : any)=>{
      res = data.toString() ;
    }) ;

    pyChild.on("exit", async (code) => {
      let resp:any[] = await JSON.parse(res) ;
      console.log(resp)
      for(i  ; i<resp.length ; i++){
        const thing:any = resp[i]; 
        console.log(thing.id , typeof thing); 
        const expected = idOutput.get(thing.id) ; 
        let okay  ;
        let good = thing.good ; 
        if(_.isEqual(good , false)){
          response = {...response ,...thing,  input : idInput.get(thing.id),  expected : idOutput.get(thing.id)};
          if(!response.message)response.message= "Error" ;
          break ;
        }
        else{
          if (order===1){
            okay = _.isEqual(thing.result , expected)
          } 
          else if (typeof thing.result != typeof expected){
            okay = false ; 
          }
          else {
            okay = _.isEqual(thing.result.sort() , expected.sort())
          }
          if(!okay){
            response = {...response ,...thing,  input : idInput.get(thing.id) , message : "wrong answer" , expected : idOutput.get(thing.id)};
            break ; 
          }
             
          response.passed++; 
          } 
        }
      if(!response.message)response.message='Accepted';
      resolve(response)  
    }) ; 

  })}





