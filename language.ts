export function fileExtension(language :string):string{
    let ext = "" ; 
    switch (language) {
        case "python":
            ext = ".py"
            break;
        case "typescript":
            ext = ".ts"
            break
        default:
            break;
    }
    return ext ;
    
}

console.log(fileExtension("typescript"));