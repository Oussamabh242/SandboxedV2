def isPalindrome(num) :
    print(str(num)[::-1]==str(num) , str(num)[::-1] , str(num))
    return str(num)[::-1]==str(num)
import sys
import json

args = json.loads(sys.argv[1])


data = {
'type' : 'result' ,
'content' : isPalindrome(*args),
}

print(json.dumps(data))
