import { connectDb, getDb } from './db.js'
const dbPromise = connectDb()

self.addEventListener('fetch', event => {
  const path = new URL(event.request.url).pathname
  console.log("Caught a fetch!", path)

  if (path !== "/" && path !== "/db.js" && !path.startsWith("/mastro/")) {
    event.respondWith(
      dbPromise.then(() =>
        getDb(path).then(text =>
          new Response(text, {
            status: text ? 200 : 404,
            headers: {'Content-Type': 'text/javascript'}
          })
      ))
    )
  }

})
