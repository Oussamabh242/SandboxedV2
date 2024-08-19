import express from "express";
import bodyParser, { json } from "body-parser";
import {  writeFileSync,   } from "fs";
import cors from "cors";
import path from "path";
import { v4 as uuid } from 'uuid';
import { fileExtension } from "./language";
import {  runGateway, submitGateway } from "./runner";
import { unlink , writeFile } from "fs/promises";
import { formatTypescript, fromatGateway } from "./fromatter";
import { formatJSON } from "./fromatter";
import Bottleneck from "bottleneck";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000
});

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  limiter.schedule(() => {
    return new Promise((resolve) => {
      next();
      resolve(0);
    });
  });
});
app.post("/submit", async (req, res) => {
  const { code, timeOut, language , functionName ,argType , testcases} = req.body;
  const extension = fileExtension(language);
  const id = uuid();
  const file = `${id}${extension}`; 
  const jsonFile = `${id}.json`;
  const filePath = path.join("user_code", file); 
  try {
    const [inCode , idOutput ,idInput] = formatJSON(testcases) 
    await writeFile(filePath, fromatGateway(language , code , functionName , argType));
    await writeFile(path.join('user_code' , jsonFile) , inCode) ;
    let result :any=await submitGateway(language,file,timeOut,id , jsonFile ,idOutput, idInput); 
    //result = JSON.parse(result); 
    res.json(result); 
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
  finally{
    await unlink(filePath); 
    await unlink(path.join('user_code' , jsonFile));
  }


});


app.post("/run", async (req, res) => {
  const { code, timeOut, language , functionName, argType , testcases } = req.body;
  const extension = fileExtension(language);
  const id = uuid();
  const file = `${id}${extension}`;
  const filePath = path.join("user_code", file);
  const jsonFile = `${id}.json`;
  try {
    testcases.tests = testcases.tests.slice(0, 4); 
    const [inCode , idOutput ,idInput] = formatJSON(testcases) 
    await writeFile(filePath, fromatGateway(language , code , functionName , argType));
    await writeFile(path.join('user_code' , jsonFile) , inCode) ;
    let result :any=await runGateway(language,file,timeOut,id , jsonFile ,idOutput, idInput); 
    //result = JSON.parse(result); 
    res.json(result); 
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
  finally{
    await unlink(filePath); 
    await unlink(path.join('user_code' , jsonFile));
  }

});


app.listen(3002, () => {
  console.log("Listening on port 3002 ...");
});

