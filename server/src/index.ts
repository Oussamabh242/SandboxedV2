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
import { getProblem , addProblem, allProblems } from "./utils/_db";
import { existsSync } from "fs";



const app = express();

app.use(bodyParser.json());
app.use(cors());
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
      console.log(problem)
      const [inCode , idOutput ,idInput] = formatJSON(problem) 
      await writeFile(filePath, fromatGateway(language , code , problem.functionName , problem.argType));
      await writeFile(path.join('user_code' , jsonFile) , inCode) ;
      let result :any=await submitGateway(language,file,id , jsonFile ,idOutput, idInput,problem.order); 
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
    
    if(problem){

      problem.tests = problem.tests.slice(0, 3); 
      const [inCode , idOutput ,idInput] = formatJSON(problem) ;
      await writeFile(filePath, fromatGateway(language , code , problem.functionName , problem.argType));
      await writeFile(path.join('user_code' , jsonFile) , inCode) ;
      let result :any=await runGateway(language,file,id , jsonFile ,idOutput, idInput , problem.order); 
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
  testCases : any , 
  timeout : number , 
  order : number ,  
  functionName : string , 
  argType: string
}
  //id : string , 
  //testCases : string , 
  //timeout : number , 
  //order : number ,  
  //functionName : string , 
  //argType: string

app.post('/problem' , async (req :Request<{},{},DbInput>  , res)=>{
  try {
    req.body.testCases = await JSON.stringify(req.body.testCases) ;
    const problem = await addProblem(req.body); 
    return res.status(201).send(problem); 
 }
 catch(err){
    console.log(err); 
    return res.send({'error':'something wrong happend'})
  }

})
app.get('/problem' , async (req :Request<{},{},DbInput>  , res)=>{
  try {
    const problems = await allProblems();
    if (problems){

      return res.status(200).send(problems); 
    }
    return res.status(404).json({
      "error" : "no problems found"
    }); 
 }
 catch(err){
    console.log(err); 
    return res.send({'error':'something wrong happend'})
  }

})
app.listen(3000, () => {
  console.log("Listening on port 3000 ...");
});

