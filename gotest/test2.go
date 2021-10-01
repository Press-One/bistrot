// +build js,wasm

// nolint:errcheck
package main

import (
	"context"
	"syscall/js"
	"fmt"
	"github.com/hack-pad/go-indexeddb/idb"
)

var (
	Books = []string{
		"Hitchhiker's Guide to the Galaxy",
		"Leaves of Grass",
		"The Great Gatsby",
		"The Hobbit",
	}
)

func main() {
	// Create the 'library' database, then create a 'books' object store during setup.
	// The setup func can also upgrade the database from older versions.

	println("LLLLLL>>>>>");


	ctx := context.Background()
	openRequest, _ := idb.Global().Open(ctx, "library", 1, func(db *idb.Database, oldVersion, newVersion uint) error {
		db.CreateObjectStore("books", idb.ObjectStoreOptions{})
		return nil
	})
	db, _ := openRequest.Await(ctx)

	{ // Store some books in the library database.
		txn, _ := db.Transaction(idb.TransactionReadWrite, "books")
		store, _ := txn.ObjectStore("books")
		for _, bookTitle := range Books {
			println(bookTitle);
			c1, c2 := store.Add(js.ValueOf(bookTitle))
			fmt.Printf("%v", c1);
			fmt.Printf("%v", c2);

		}
		txn.Await(ctx)
	}

	// { // Iterate through the books and print their titles.
	// 	txn, _ := db.Transaction(idb.TransactionReadOnly, "books")
	// 	store, _ := txn.ObjectStore("books")
	// 	cursorRequest, _ := store.OpenCursor(idb.CursorNext)
	// 	cursorRequest.Iter(ctx, func(cursor *idb.CursorWithValue) error {
	// 		value, _ := cursor.Value()
	// 		println(value.String())
	// 		return nil
	// 	})
	// }
}
