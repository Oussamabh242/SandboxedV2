import os
import subprocess 
import time
import json

MAX_OUTPUT = 10000

data = {}

id = os.getenv("ID")
runtype = os.getenv("TYPE")

with open(f"./user_code/{id}.json") as j :
    data = json.load(j)


def execPython(testcase) :
    res = {"stdout": '' , "stderr" : '' , "message" : "" , "code": 0 , "good" : True}
    try :
        p = subprocess.run(["python3" ,  f"./user_code/{id}.py" , testcase] ,capture_output=True , text=True ,timeout=data['timeout']) 
        res["stdout"] = p.stdout[0:MAX_OUTPUT]
        res["stderr"] = p.stderr
        if p.stderr : 
            res['result'] = None
            res["good"] = False

    except subprocess.TimeoutExpired as e : 
        res["stdout"] = e.stdout[0 : MAX_OUTPUT]
        res["stderr"] = e.stderr
        res["message"] = "Time limit exceeded"
        res['result'] = None
        res['good'] = False

    if res["good"]==False :
        res["code"] = 1
        return res 
    if res.get('result' , None) == None :
        std : str = res.get("stdout" , None) 
        splited_std: list[str]= std.split('\n')
        splited_std.pop()
        result = json.loads(splited_std.pop() ) 
        std = '\n'.join(splited_std)
        res.__setitem__('result' , result['content'])
        res["stdout"] = std
    
    return res

def runPython() :
    results = []

    for tc in data['tests'] :
        res = execPython(json.dumps(tc['input'])) ;
        res.__setitem__('id' , tc['id'])
        if isinstance(res['stdout'], bytes):
            res['stdout'] = res['stdout'].decode('utf-8')
        if  isinstance(res['stderr'], bytes):
            res['stderr'] = res['stderr'].decode('utf-8')

        results.append(res)

    return json.dumps(results)

def submitPython() :
    results = []

    for tc in data['tests'] :
        res = execPython(json.dumps(tc['input'])) ;
        res.__setitem__('id' , tc['id'])
        if isinstance(res['stdout'], bytes):
            res['stdout'] = res['stdout'].decode('utf-8')
        if  isinstance(res['stderr'], bytes):
            res['stderr'] = res['stderr'].decode('utf-8')

        results.append(res)
        if res.get('good' , None) == False : 
            break 

    return json.dumps(results)

if runtype == 'SUBMIT' : 
    print(submitPython())

else : 
    print(runPython())

