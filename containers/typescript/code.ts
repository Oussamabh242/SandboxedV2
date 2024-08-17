function isPalindrome(n:number):boolean{
  for(;;){
    console.log('.' )
  }   
  return n.toString().split('').reverse().join('') === n.toString() 
}

//the toppings ...
const args : any[]= JSON.parse(process.argv[2]);
console.log(args)
// add the type (func (...args as type)
//add when formatting the code in the main server 
type ArgType = [number] 
const data = {
    'type' : 'result' ,
    'content' :isPalindrome(...args as ArgType),
}

console.log()
console.log(JSON.stringify(data)); 
