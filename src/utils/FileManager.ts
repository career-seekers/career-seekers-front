export class FileManager {
  saveFileToCache(file: File) {
    return new Promise<string>((resolve, reject) => {
      const request = indexedDB.open("FileCacheDB", 1);
      const fileName = `${file.name}_${Date.now()}`;

      request.onupgradeneeded = function (event) {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "name" });
        }
      };

      request.onsuccess = function (event) {
        const db = (event.target as IDBRequest).result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");
        store.put({ name: fileName, file: file });

        transaction.oncomplete = () => {
          db.close();
          resolve(fileName);
        };
      };

      request.onerror = function (event) {
        reject("IndexedDB error:" + (event.target as IDBRequest).error);
      };
    });
  }

  loadFileFromCache(fileName: string) {
    return new Promise<File>((resolve, reject) => {
      const request = indexedDB.open("FileCacheDB", 1);

      request.onsuccess = function (event) {
        const db = (event.target as IDBRequest).result;
        const transaction = db.transaction(["files"], "readonly");
        const store = transaction.objectStore("files");
        const getRequest = store.get(fileName);

        getRequest.onsuccess = function () {
          const record = getRequest.result;
          if (record) {
            resolve(record.file);
          } else {
            reject(File);
          }
          db.close();
        };

        getRequest.onerror = function () {
          reject(File);
          db.close();
        };
      };

      request.onerror = function (event) {
        reject(
          new Error("IndexedDB error: " + (event.target as IDBRequest).error),
        );
      };
    });
  }

  removeFileFromCache(fileName: string) {
    return new Promise<boolean>((resolve, reject) => {
      const request = indexedDB.open("FileCacheDB", 1);

      request.onsuccess = function (event) {
        const db = (event.target as IDBRequest).result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");

        const deleteRequest = store.delete(fileName);

        deleteRequest.onsuccess = function () {
          db.close();
          resolve(true);
        };

        deleteRequest.onerror = function () {
          db.close();
          reject(false);
        };
      };

      request.onerror = function () {
        reject(false);
      };
    });
  }
}
