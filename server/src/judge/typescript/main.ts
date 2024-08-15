import { spawn, exec } from "child_process";

export function runTypescript(file: string, timeout: number, id: string) {
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


