function main(){return 10;}
import sys
import json

args = json.loads(sys.argv[1])


data = {
    'type' : 'result' ,
    'content' : main(*args),
}

print(json.dumps(data))
