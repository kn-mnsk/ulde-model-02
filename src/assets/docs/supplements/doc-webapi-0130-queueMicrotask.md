
[Javascript’s queueMicrotask vs requestAnimationFrame](https://medium.com/@TheJsMaster/javascripts-queuemicrotask-vs-requestanimationframe-which-runs-first-and-why-a043182cc098)
===



As a wise man once said, “Learn by asking questions”.

Here is a question, what’s the order of console logs here ?

```code
const p = new Promise((r)=>{r(); console.log("in promise contructor")}); 

p.then(()=>console.log("in p's then")); 

queueMicrotask(()=>console.log("micro task")); 

Promise.resolve().then(()=>console.log("in then")); 

console.log("promise created");

requestAnimationFrame(()=>console.log("raf")); 

setTimeout(()=>{console.log("in timeout")}, 1000);
```

__Task Queues:__

![Task Queues](../../images/task-queues.png)

we know that Javascript runtime has call Stack which contains set of instructions to execute. It goes through each instruction and executes it, and if that instruction adds more instructions to call stack then, It executes those also as it’s a stack before going to next instruction.

But there is also something called task queues (2 of them). one stores the micro tasks (which are more prioritised), another stores the macro tasks (which are often called Tasks) that are less prioritised over micro tasks.

__queueMicrotask:__

It lets you add a micro task to micro task queue. which gets executed once all the instructions in call stack are executed and call stack is emptied.

Promise’s then or catch callbacks are added to micro task queue.

```code
queueMicrotask(()=>console.log("micro task"));

Promise.resolve().then(()=>console.log("in then")); 
```

__requestAnimationFrame or setInterval or setTimeout or Dom events..etc:__

This is how you will add a macro task to queue. Some DOM apis take time to respond wether it’s api response or response from user or response needed from the operating system / browser. Once they respond, the responded will be added to task queue. So for example setTimeout ads the task to execute that call back function after the timeout value is run out. same with setInterval. Because we don’t know when they are supposed to be executed, they are always less prioritised over micro tasks.

```code
requestAnimationFrame(()=>console.log("raf"));

setTimeout(()=>{console.log("in timeout")}, 1000);
```

these tasks will be added to Task Queue once they are ready. Here requestAnimationFrame’s task probably will be ready before setTimtouts.

```new Promise(()=>console.log(“ in promise”))```

we also know that when we pass a function to a constructor function, we know that that function gets called immediately.

Which gets called first and why?

Here is the answer:
```code
in promise contructor
promise creted
in p's then
micro task
in then
raf
in timeout
```

1. Promise’s consturctor function will be called immediately and prints “in promise constructor”

2. Then it schedules a micro task to print “in p’s then”. then it schedules another micro task to print “micro task”. then another to print “in then”.

3. Then it prints “promise created” as it’s part of call stack.

4. Then it schedules a macro task to print ‘raf’ when the requestAntimationFrame api responds.

5. Then it schedules a timer to print ‘in timeout’

Then the call stack gets emptied as all instructors are done executing.

now, all microtasks added to micro task queue in step 2, are moved to call stack and prints “in p’s then”, “micro task”, “in then”

Call Stack is emptied now.

Request Animation Frame api responds now. so it will print “raf”
then, the timer’s call back will be called printing “in timeout”

The End…
