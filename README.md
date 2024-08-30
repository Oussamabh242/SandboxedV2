# Sandboxed

# Introduction

This repository provides a Docker-based environment to run and test user-submitted code against predefined problems. It supports multiple programming languages using isolated containers.

## How to Run

1. Clone the repository:
```bash
   git clone https://github.com/Oussamabh242/SandboxedV2.git
```
### Building the Main Container

2. Navigate to the directory:

```bash
   cd SandboxedV2
```

3. Build the main contain:
   
```bash
   docker build -t sandboxed .
```

### Building the Code Execution Containers


4. Build the Python execution container:

```bash
   docker build -t pyrun ./containers/python
```


5. Build the TypeScript execution container:
   
```bash
   docker build -t tsrun ./containers/typescript
```

### Creating Shared Volume

6. Create a shared volume for user code:

```bash
   docker volume create --name user_code_volume
```

### Running the Container

7. Run the main server container:

```bash
   docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v user_code_volume:/app/user_code --name my-server sandboxed
```

## API Endpoints

The container has three endpoints:
Note that three problems are there out of the box : Palindrome number , combination sum , island perimiter .

### 1. POST /problem

Create a new problem with test cases.

**Request Body:**
```js
{
  id: string,
  testCases: string,
  timeout: number,
  order: number, //1 for strict comparison (a should equals b )  0 check if all elements in a are alson in b (if the order does not matter)
  functionName: string,
  argType: string
}
```

**Example:**

Valid Parenthesis Problem


```js
{
  "testCases":[
    { "id": 1, "input": ["()"], "expected": true },
    { "id": 2, "input": ["()[]{}"], "expected": true },
    { "id": 3, "input": ["(]"], "expected": false },
    { "id": 4, "input": ["([)]"], "expected": false },
    { "id": 5, "input": ["{[]}"], "expected": true }
  ],
   "order": 1,
   "functionName": "isValid",
   "timeout": 3,
   "argType" : "[string]"
}
```


### 2. POST /run && POST /submit

Run the code against the problem's test cases.

**Request Body:**
```js
{
  code: string,
  language: string,
  problemId: string
}
```

**Example:**

Submitting a solution in TypeScript

```js
{
  code: "function isValid(s: string): boolean {\n const stack: string[] = [];\n const mapping: { [key: string]: string } = {')': '(', '}': '{', ']': '['};\n \n for (const char of s) {\n if (char in mapping) {\n if (stack.length === 0 || stack[stack.length - 1] !== mapping[char]) {\n return false;\n }\n stack.pop();\n } else {\n stack.push(char);\n }\n }\n \n return stack.length === 0;\n}",

  problemId: "4020f89d-b4e3-4625-8042-b452e32f8de4",

  language: "typescript"
}
``
