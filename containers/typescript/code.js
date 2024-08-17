function isPalindrome(n) {
    for (;;) {
        console.log('.');
    }
    return n.toString().split('').reverse().join('') === n.toString();
}
//the toppings ...
var args = JSON.parse(process.argv[2]);
console.log(args);
var data = {
    'type': 'result',
    'content': isPalindrome.apply(void 0, args),
};
console.log();
console.log(JSON.stringify(data));
