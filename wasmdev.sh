# GOOS=js GOARCH=wasm go build -o main.wasm test.go
# cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

GOOS=js GOARCH=wasm go build -o main.wasm test2.go
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .



# https://github.com/golang/go/wiki/WebAssembly#getting-started
# GOOS=js GOARCH=wasm go run -exec="$(go env GOROOT)/misc/wasm/go_js_wasm_exec"
# GOOS=js GOARCH=wasm go test -exec="$(go env GOROOT)/misc/wasm/go_js_wasm_exec" .


# GOOS=js GOARCH=wasm go run -exec="$(go env GOROOT)/misc/wasm/go_js_wasm_exec" test.go
