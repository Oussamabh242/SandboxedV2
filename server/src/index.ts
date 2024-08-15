import express from "express";
import bodyParser, { json } from "body-parser";
import { writeFileSync,  unlinkSync } from "fs";
import cors from "cors";
import path from "path";
import { v4 as uuid } from 'uuid';
import { fileExtension } from "./language";
import { gateway, runPython, runTs } from "./runner";
import { unlink } from "fs/promises";
import { formatTypescript, fromatGateway } from "./fromatter";


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/", async (req, res) => {
  const { code, timeOut, language , functionName } = req.body;
  const extension = fileExtension(language);
  const id = uuid();
  const file = `${id}${extension}`;
  const filePath = path.join("user_code", file);

  try {
    writeFileSync(filePath, fromatGateway(language , code , functionName));
    let  result :any = await gateway(language ,file , timeOut ,id);
    //result = JSON.parse(result); 
    res.json(result); 
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
    
  }
  finally{
    await unlink(filePath); 
  }

});

app.listen(3002, () => {
  console.log("Listening on port 3002 ...");
});
