const dbName = "mastro"
const dbVersion = 1
const storeName = "files"

let db

export const connectDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion)
    request.onerror = event => {
      console.error("indexedDB.open failed", event)
      reject(event)
    }
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      const objectStore = db.createObjectStore(storeName)
    }
    request.onsuccess = event => {
      db = event.target.result
      resolve(db)
    }
  })

export const putDb = (key, value) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite")
    transaction.oncomplete = event => resolve()
    transaction.onerror = event => {
      console.error("putDb failed", event)
      reject(event)
    }

    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.put(value, key)
  })

export const getDb = (key) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly")
    transaction.onerror = event => {
      console.error("getDb failed", event)
      reject(event)
    }

    const objectStore = transaction.objectStore(storeName)
    const request = objectStore.get(key)
    transaction.oncomplete = event => resolve(request.result)
  })
