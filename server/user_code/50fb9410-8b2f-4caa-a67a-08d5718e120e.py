def main(a, b):
	return 'hello world'
import sys
import json

args = json.loads(sys.argv[1])


data = {
    'type' : 'result' ,
    'content' : main(*args),
}

print(json.dumps(data))
