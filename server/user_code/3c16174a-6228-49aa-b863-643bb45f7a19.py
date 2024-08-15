def two_sm(arr , num) :
    for i in range(len(arr)) :
        for j in range(len(arr)) :
            if arr[i] + arr[j] == num :
                return [i+1 , j]
    return None
import sys
import json

args = json.loads(sys.argv[1])


data = {
'type' : 'result' ,
'content' : two_sum(*args),
}

print(json.dumps(data))
