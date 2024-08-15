const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { exit } = require('process');

const spawn = require('child_process').spawn

const testcases = JSON.parse(readFileSync('test.json', 'utf8'))

//const type = process.env.TYPE ; 
//switch (type) {
//  case 'RUN':
//    runTestCases() ; 
//    break;
//  case 'SUBMIT':
//    submitTestCases(); 
//    break; 
//  default:
//    console.log('invalid option'); 
//    exit(1); 
//}



function execPython( timeout , testcase )  {
  return new Promise((resolve) => {
    const command = "python3";
    const args = [
      "code.py",
      testcase
    ];

    const pyChild = spawn(command, args);
    const response= { input : testcase, stdout: "", stderr: "", message: "" , code : 0};
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

async function submitTestCases() {
  try {
    const tests = testcases.tests;  
    tests.forEach(async test => {
      let res  = await execPython(testcases.timeout , JSON.stringify(test.input)) ;
      res = JSON.stringify(res) ;
      console.log(res); 
    });
    

  } catch (error) {
    console.error("Error running test cases:", error);
  }
}

submitTestCases(); 
//runTestCases();
