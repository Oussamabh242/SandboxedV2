const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { exit } = require('process');
const _ = require('lodash'); 
const spawn = require('child_process').spawn



const type = process.env.TYPE ; 
const ID = process.env.ID ; 

const testcases = JSON.parse(readFileSync(`./user_code/${ID}.json`, 'utf8'))

if (_.isEqual(type , 'RUN')){
  runTestCases() ; 
} 
else if (_.isEqual(type , 'SUBMIT')){
  submitTestCases() ; 
}
//console.log(testcases.tests[0].input)
//execTypescript(testcases.timeout , testcases.tests[0].input).then(res=>console.log(res))
//


function compile(){
  return new Promise(resolve =>{
    const command = "npx"; 
    const args = [
      "tsc",
      `./user_code/${ID}.ts` 
    ] ;
    const child = spawn(command , args) ; 
    const response = {stdout : '' , stderr : '' }
    child.stdout.on('data' , (data)=>{
      response.stdout+=data.toString() ; 
    });
    child.stderr.on('data' , (data)=>{
      response.stderr+=data.toString(); 
    })

    child.on('exit' , (code)=>{
      response.code = code  ;
      resolve(response); 
    })
  })
}


function execTypescript( timeout , testcase )  {
  return new Promise((resolve) => {
    good = true; 
    //const compileRes = await compile()
    const command = "node";
    const args = [
      //"ts-node",
      `./user_code/${ID}.js`,
      `${testcase}`   
    ];
    const child = spawn(command, args);
    const response= {  stdout: "", stderr: "", message: "" , code : 0};
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      response.message = "Time Limit Exceeded";
      response.stderr = "Time Limit Exceeded";
      response.code = 1
      response.result = null;
      good = false; 
    }, timeout * 1000);
    child.stdout.on("data", (data) => {
      response.stdout += data.toString();
      if(response.stdout.length > 10000){
        response.stderr = 'output limit exceeded' ; 
        child.kill('SIGKILL');
        good = false ;
      }
    });
    child.stderr?.on("data", (data) => {
      response.stderr += data.toString();
      response.result = null;
      response.code = 1 ;
      good = false ; 
    });
    child.on("error", (error) => {
      response.stderr += error.toString();
      response.code = 1
      response.result = null;
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      const x = response.stdout.split("\n").filter((item) => item.trim());
      try {
        const res = x[x.length - 1];
        let y = JSON.stringify(res);
        response.result = JSON.parse(JSON.parse(y)).content;
      } catch {
        response.result = null;
      }
     
      x.pop();
      response.stdout = x.join("\n");
      response.stderr = response.stderr.replace(/File ".*?", /g , "code.ts ");
      
      response.good = good; 
      resolve(response);
    });
  });
}

async function runTestCases() {
  try {
    const compileRes = await compile();
    if (_.isEqual(compileRes.code , 0)){
      let results = []
      let tests = testcases.tests
       for (const test of tests) {
        let res = await execTypescript(testcases.timeout, JSON.stringify(test.input));
        res.id = test.id;
        if(_.isEqual(res.result , undefined) ){
          res.result = null
          
        }
        results.push(res)
        await sleep(20);
      }

      console.log(JSON.stringify(results));
    }
    else{
      const res = [{
        code : 1  , 
        stderr: compileRes.stdout + compileRes.stderr , 
        message: 'Compile Error' , 
        result : null 
      }];
      console.log(JSON.stringify(res)); 
    }

    } catch (error) {
    console.error("Error running test cases:", error);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitTestCases() {
  try {
    const compileRes = await compile() ; 
    if(_.isEqual(compileRes.code , 0)){
      const tests = testcases.tests;
      const results = [];
      
      for (const test of tests) {
        let res = await execTypescript(testcases.timeout, JSON.stringify(test.input));
        res.id = test.id;
        if(_.isEqual(res.result , undefined) ){
          res.result = null
          
        }
        results.push(res);
        if ( _.isEqual(res.good , false)){
          break ; 
        } 
        await sleep(20);
      }
      
      console.log(JSON.stringify(results));
    }
    else{
      console.log(JSON.stringify([{
        code : 1 , 
        message : 'Compile Error'  ,
        stderr : compileRes.stderr + compileRes.stdout , 
        stdout : '' , 
        result : 'null',
      }]))
    } 

  } catch (error) {
    console.error("Error running test cases:", error);
  }
}

