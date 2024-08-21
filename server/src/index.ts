import express , {Request} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { v4 as uuid } from 'uuid';
import { fileExtension } from "./language";
import {  runGateway, submitGateway } from "./runner";
import { unlink , writeFile } from "fs/promises";
import {  fromatGateway } from "./fromatter";
import { formatJSON } from "./fromatter";
import Bottleneck from "bottleneck";
import { getProblem , addProblem } from "./utils/_db";
import { existsSync } from "fs";

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
  const { code,  language , problemId} = req.body;
  const extension = fileExtension(language);
  const id = uuid();
  const file = `${id}${extension}`; 
  const jsonFile = `${id}.json`;
  const filePath = path.join("user_code", file); 
  try {
    const problem = await getProblem(problemId); 
    if(problem){
      const [inCode , idOutput ,idInput] = formatJSON(problem) 
      await writeFile(filePath, fromatGateway(language , code , problem.functionName , problem.argType));
      await writeFile(path.join('user_code' , jsonFile) , inCode) ;
      let result :any=await submitGateway(language,file,id , jsonFile ,idOutput, idInput,problem.order); 
      //result = JSON.parse(result); 
      res.json(result); 
    }  
    else{
      return res.status(404).send("no problem found")
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
  finally{
    if (existsSync(filePath) && existsSync(path.join('user_code' , jsonFile))){
      await unlink(filePath); 
      await unlink(path.join('user_code' , jsonFile));
    }
  }   


});


app.post("/run", async (req, res) => {
  const { code, language ,   problemId } = req.body;
  const extension = fileExtension(language);
  const id = uuid();
  const file = `${id}${extension}`;
  const filePath = path.join("user_code", file);
  const jsonFile = `${id}.json`;
  try {
    const problem = await getProblem(problemId); 
    console.log(problem); 
    
    if(problem){

      //problem.tests = problem.tests.slice(0, 2); 
      const [inCode , idOutput ,idInput] = formatJSON(problem) ;
      await writeFile(filePath, fromatGateway(language , code , problem.functionName , problem.argType));
      await writeFile(path.join('user_code' , jsonFile) , inCode) ;
      let result :any=await runGateway(language,file,id , jsonFile ,idOutput, idInput , problem.order); 
      //result = JSON.parse(result); 
      res.json(result); 
    }
    else{
      return res.status(404).send("no problem found")
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
  finally{
    if (existsSync(filePath) && existsSync(path.join('user_code' , jsonFile))){
      await unlink(filePath); 
      await unlink(path.join('user_code' , jsonFile));
    }

  }

});
interface DbInput{
  id : string , 
  testCases : string , 
  timeout : number , 
  order : number ,  
  functionName : string , 
  argType: string
}

app.post('/problem' , async (req :Request<{},{},DbInput>  , res)=>{
  try {
    console.log(req.body); 
    const problem = await addProblem(req.body); 
    console.log(problem);  
    return res.status(201).send(problem); 
 }
 catch(err){
    console.log(err); 
    return res.send({'error':'something wrong happend'})
  }

})

app.listen(3002, () => {
  console.log("Listening on port 3002 ...");
});

