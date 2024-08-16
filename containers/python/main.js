const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { exit } = require('process');
const _ = require('lodash'); 
const spawn = require('child_process').spawn

const testcases = JSON.parse(readFileSync('test.json', 'utf8'))

const type = process.env.TYPE ; 

if (_.isEqual(type , 'RUN')){
  runTestCases() ; 
} 
else if (_.isEqual(type , 'SUBMIT')){
  submitTestCases() ; 
}




function execPython( timeout , testcase )  {
  return new Promise((resolve) => {
    const command = "python3";
    const args = [
      "code.py",
      testcase
    ];

    const pyChild = spawn(command, args);
    const response= {  stdout: "", stderr: "", message: "" , code : 0};
    const timer = setTimeout(() => {
      pyChild.kill("SIGKILL");
      response.message = "Time Limit Exceeded";
      response.stderr = "Time Limit Exceeded";
      response.code = 1
      response.result = null;
    }, timeout * 1000);
    pyChild.stdout.on("data", (data) => {
      response.stdout += data.toString();
      if(response.stdout.length > 1000){
        response.stderr = 'output limit exceeded' ; 
        pyChild.kill('SIGKILL'); 
      }
    });
    pyChild.stderr?.on("data", (data) => {
      response.stderr += data.toString();
      response.result = null;
      response.code = 1 ; 
    });
    pyChild.on("error", (error) => {
      response.stderr += error.toString();
      response.code = 1
      response.result = null;
    });
    pyChild.on("exit", (code) => {
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
      response.stderr = response.stderr.replace(/File ".*?", /g , "code.py ");
      resolve(response);
    });
  });
}

async function runTestCases() {
  try {
    const promises = testcases.tests.map(elm => 
      execPython(testcases.timeout, JSON.stringify(elm.input))
    );

    const results = await Promise.all(promises);


    const gather = JSON.stringify(results);

    console.log(JSON.stringify(gather));
  } catch (error) {
    console.error("Error running test cases:", error);
  }
}

//async function submitTestCases() {
//  try {
//    let arr=[]
//    const tests = testcases.tests;  
//    tests.forEach(async test => {
//      let res  = await execPython(testcases.timeout , JSON.stringify(test.input)) ;
//      res.id = test.id
//      arr.push(res)
//      //res = JSON.stringify(res);
//
//      //arr.push(res);  
//    });
//    console.log(JSON.stringify(arr)); 
//
//
//  } catch (error) {
//    console.error("Error running test cases:", error);
//  }
//}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitTestCases() {
  try {
    const tests = testcases.tests;
    const results = [];
    
    for (const test of tests) {
      // Execute the Python function and get the result
      let res = await execPython(testcases.timeout, JSON.stringify(test.input));
      // Add the test ID to the result
      res.id = test.id;
      results.push(res);
      
      // Introduce a pause of 500 milliseconds between executions
      await sleep(20);
    }
    
    // Log all results as JSON
    console.log(JSON.stringify(results));
  } catch (error) {
    // Handle any errors that occurred during the execution
    console.error("Error running test cases:", error);
  }
}
