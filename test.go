// https://withblue.ink/2020/10/03/go-webassembly-http-requests-and-promises.html

package main

import (
	// "fmt";
	"time";
	"math/rand";
	"errors";
	"syscall/js"
)

func main() {
	// fmt.Println("[WASM] FUCK CCP!")
	// c := make(chan struct{}, 0)
	// <-c
	js.Global().Set("returnMap", js.FuncOf(returnMap))
	js.Global().Set("add", js.FuncOf(add))
	js.Global().Set("asyncTest", js.FuncOf(asyncTest))
	js.Global().Set("callJs", js.FuncOf(callJs))
	// keep wasm module running...
	c1,c2 := await( js.Global().Call("jsAsync", 1, 3))
	println(c1[0].Int());
	println(c2);
	select {}
}

func aYes() {
	println("Yes");
}

func aNo() {
	println("No");
}

func returnMap(this js.Value, args []js.Value) interface{} {
	return map[string]interface{}{
		"key1": "val1",
		"key2": 64,
	}
}

func add(this js.Value, args []js.Value) interface{} {
	sum := args[0].Int() + args[1].Int()
    return js.ValueOf(sum)
}

func callJs(this js.Value, args []js.Value) interface{} {
	// println(js.Global().Get("aaa").Float())
	sum := js.Global().Call("jsAdd", 1, 3)
	println(sum.Float())
	return nil
    // return js.ValueOf(sum)
}

func asyncTest(this js.Value, args []js.Value) interface{} {
	handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		resolve := args[0]
		reject := args[1]
		go func() {
			time.Sleep(3 * time.Second)
			println(rand.Int())
			if rand.Int() % 2 == 0 {
				// resolve.Invoke("OK")
				resolve.Invoke(map[string]interface{}{
					"message": "OK",
					"error":   nil,
				})
			} else {
				err := errors.New("Failed!")
				errorConstructor := js.Global().Get("Error")
				errorObject := errorConstructor.New(err.Error())
				reject.Invoke(errorObject)
			}
		}()
		return nil
	})
	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(handler)
}



func await(awaitable js.Value) ([]js.Value, []js.Value) {
    then := make(chan []js.Value)
    defer close(then)
    thenFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        then <- args
        return nil
    })
    defer thenFunc.Release()

    catch := make(chan []js.Value)
    defer close(catch)
    catchFunc := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        catch <- args
        return nil
    })
    defer catchFunc.Release()

    awaitable.Call("then", thenFunc).Call("catch", catchFunc)

    select {
    case result := <-then:
        return result, nil
    case err := <-catch:
        return nil, err
    }
}


// func main() {
//     wait := make(chan interface{})
//     js.Global().Call("sayHello", 5000).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
//         fmt.Println(args[0])
//         wait <- nil
//         return nil
//     }))
//     <-wait
//     fmt.Println("we're done here")
// }







//
