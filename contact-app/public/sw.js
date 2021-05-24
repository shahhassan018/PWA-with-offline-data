// console.log("sw.js file in public ");

let cahceData = "todoAppV1";
let staticCacheName = "site-static-v3";
let dynamicCacheName = "site-dynamic-v1";

// install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll([
        "",
        "/",
        "/static/js/main.chunk.js",
        "/static/js/0.chunk.js",
        "/static/js/bundle.js",
        "/index.html",
        "/index.js",
        "/add",
      ]);
    })
  );
});

const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (evt) => {
  if (!navigator.onLine) {
    console.log("!offline navigator", evt.request.url);
    evt.respondWith(
      caches
        .match(evt.request)
        .then((cacheRes) => {
          return (
            cacheRes ||
            fetch(evt.request).then((fetchRes) => {
              return caches.open(dynamicCacheName).then((cache) => {
                cache.put(evt.request.url, fetchRes.clone());
                limitCacheSize(dynamicCacheName, 15);
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          if (evt.request.url.indexOf(".html") > 1) {
            return caches.match("index.html");
          }
          // let requestUrl = evt.request.clone();
          // fetch(requestUrl);
        })
    );
  }
});

// self.addEventListener("fetch", (event) => {
//   if (!navigator.onLine) {
//     console.log("!navigator.onLine");
//     event.respondWith(
//       caches.match(event.request).then((resp) => {
//         if (resp) {
//           return resp;
//         }
//         let requestUrl = event.request.clone();
//         fetch(requestUrl);
//       })
//     );
//   }
// });
