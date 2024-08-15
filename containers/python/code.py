def main(arr , num) :
    # while True :
    #
    #     print('sup')
    #     pass
    for i in range(len(arr)) :
        for j in range(len(arr)) :
            if arr[i] + arr[j] == num :
                return [i , j]
    return None


import sys
import json

args = json.loads(sys.argv[1])


data = {
    'type' : 'result' ,
    'content' : main(*args),
}

print(json.dumps(data))
