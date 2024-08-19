import { spawn , exec } from "child_process";
import _ from "underscore";
import { runTypescript, submitTypescript } from "./judge/typescript/main";
import { runPython, submitPython , } from "./judge/python/main";
// export function runPython(file: string): Promise<Response> {
//   return new Promise((resolve, reject) => {
//     const command = "docker";
//     const args = [
//       "run",
//       "--rm",
//       "-v",
//       `${process.cwd()}/${file}:/app/code.py`,
//       "snadpy",
//     ];

//     let output:any ;

//     const dockerPy = spawn(command, args);

//     dockerPy.stdout.on("data", (data: Buffer) => {
//       output.stdout += data.toString();
//     });

//     dockerPy.stderr.on("data", (data: Buffer) => {
//       output.stderr += data.toString();
//     });

//     dockerPy.on("close", (code) => {
//       output.isError = code !== 0;
//       resolve(output);
//     });

//     dockerPy.on("error", (err) => {
//       output.isError = true;
//       output.stderr = `Error starting Docker container: ${err.message}`;
//       resolve(output);
//     });
//   });
// }


export async function submitGateway(language : string , file:string ,timeout: number , id : string , testcasesFile : string , idOutput : Map<number , any> , idInput : Map<number , any>){
  switch (language) {
    case "python":
      return submitPython(file  ,id,testcasesFile , idOutput , idInput );
    case "typescript" :
      return submitTypescript(file, id , testcasesFile, idOutput , idInput);
    default:
      break;
  }
}



export async function runGateway(language : string , file:string ,timeout: number , id : string , testcasesFile : string , idOutput : Map<number , any> , idInput : Map<number , any>){
  switch (language) {
    case "python":
      return runPython(file  ,id,testcasesFile , idOutput , idInput );
    case "typescript" :
      return runTypescript(file, id , testcasesFile, idOutput , idInput);
    default:
      break;
  }
}


//export function runPython(file: string , timeout : number , id:string){
//  console.log(file , timeout , id); 
//  console.log(timeout);
//  return new Promise((resolve, reject) => {
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
//
//    let output = { stdout: "", stderr: "" };
//
//    const run = spawn(command, args);
//
//    run.stdout.on("data", (data) => {
//      output.stdout += data;
//    });
//    run.stderr.on("data", (data) => {
//      output.stderr += data;
//    });
//    let timeoutCheck = setTimeout(() => {
//    const stopCommand = `docker stop ${id}`;
//      output = _.extend(output, {
//        timedOut: true,
//        isError: true,
//        killedByContainer: true,
//      });
//      exec(stopCommand, (err, stdout, stderr) => {
//
//        resolve(trim(output));
//      });
//      resolve(trim(output));
//    }, timeout);
//    run.on("close", (exitCode) => {
//      clearTimeout(timeoutCheck);
//      output = _.extend(output, { isError: exitCode !== 0 });
//      resolve(trim(output));
//    });
//  });
//}
//

export function runTs(file: string, timeout: number, id: string) {
  console.log(file, timeout, id);
  return new Promise((resolve, reject) => {
    const command = "docker";
    const args = [
      "run",
      "-v",
      `./user_code/${file}:/app/code.ts`,
      "--name",
      `${id}`,
      "sandts",
    ];
    let output = {
      stdout: "",
      stderr: "",
      isError: false,
      timedOut: false,
      killedByContainer: false,
    };
    const run = spawn(command, args);
    run.stdout.on("data", (data) => {
      output.stdout += data;

    });
    run.stderr.on("data", (data) =>{
      output.stderr += data;
    });
    let timeoutCheck = setTimeout(() => {
      output.timedOut = true; 
      const stopCommand = `docker stop ${id}`;
      exec(stopCommand, (err, stdout, stderr) => {
        resolve(trim(output));
      });
    }, timeout);
    run.on("close", (exitCode) => {
      clearTimeout(timeoutCheck);
      if (exitCode !== 0) {
        output.isError = true;
        if (output.stdout.includes("error TS")) {
          output.stderr += output.stdout;
          output.stdout = "";
        }
      }
      resolve(output);
    });
  });
}function trim(output : Output) {
  console.log(output.stdout.length) ; 
  if (output.stdout.length > 100) {
    output.stdout =
      output.stdout.substring(0, 10001) +
      "... " +
      (output.stdout.length - 10000).toString() +
      " more characters";
  }
  return output;
}
interface Output {
    stdout: string; 
    stderr: string;
    isError?: boolean;
    timedOut?: boolean ; 

}

//runTs('t.ts' , 5000 , 'sdasd').then((res : any)=>console.log(res)) ;

// import Docker from "dockerode";

// export function runPython(file: string, timeout: number) {
//   return new Promise((resolve, reject) => {
//     const docker = new Docker();

//     const containerConfig = {
//       Image: "snadpy",
//       Cmd: ["python", "/app/code.py"],
//       Volumes: {
//         "/app": {},
//       },
//       HostConfig: {
//         Binds: [`${process.cwd()}/user_code/${file}:/app/code.py`],
//       },
//     };

//     docker.createContainer(containerConfig, (err:any, container:any) => {
//       if (err) {
//         reject(err);
//         return;
//       }

//       const timeoutCheck = setTimeout(() => {
//         container.kill((killErr:any) => {
//           if (killErr) {
//             console.error("Error killing container:", killErr);
//           }
//           container.remove((removeErr:any) => {
//             if (removeErr) {
//               console.error("Error removing container:", removeErr);
//             }
//           });
//         });
//         resolve({ timedOut: true, isError: true, killedByContainer: true });
//       }, timeout);

//       container.start((startErr:any) => {
//         if (startErr) {
//           reject(startErr);
//           return;
//         }

//         let output = { stdout: "", stderr: "" };

//         container.attach({ stream: true, stdout: true, stderr: true }, (attachErr:any, stream:any) => {
//           if (attachErr) {
//             reject(attachErr);
//             return;
//           }

//           stream.on("data", (chunk:any) => {
//             const data = chunk.toString("utf8");
//             if (chunk.toString("utf8").includes("\n")) {
//               console.log(chunk.toString("utf8"));
//           });

//           container.modem.demuxStream(stream, process.stdout, process.stderr);
//           });
//         });

//         container.wait((waitErr:any, data:any) => {
//           clearTimeout(timeoutCheck);
//           if (waitErr) {
//             reject(waitErr);
//             return;
//           }
//           container.remove((removeErr : any) => {
//             if (removeErr) {
//               console.error("Error removing container:", removeErr);
//             }
//           });
//           resolve(_.extend(output, { isError: data.StatusCode !== 0 }));
//         });
//       });
//     });
//   });
// }
