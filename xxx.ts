import { spawn , exec } from "child_process";
import { run } from "node:test";

export function runTs(file: string, timeout: number, id: string) {
  return new Promise((resolve, reject) => {
    const command = "docker";
    const args = [
      "run",
      "--rm",
      "-v",
      `./user_code/${file}:/app/code.ts`,
      "--name",
      `${id}`,
      "snadts",
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

    run.stderr.on("data", (data) => {
      output.stderr += data;
    });

    let timeoutCheck = setTimeout(() => {
      const stopCommand = `docker stop ${id}`;
      exec(stopCommand, (err, stdout, stderr) => {
        resolve(output);
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
}

//runTs('t.ts' , 5000 , 'flkadsjfhasdflkadsjfhasdf').then(res => console.log(res));
