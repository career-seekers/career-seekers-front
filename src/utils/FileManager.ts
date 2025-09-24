interface FileRecord {
  name: string,
  file: File
}

export class FileManager {
  saveFileToCache(file: File) {
    return new Promise<string>((resolve, reject) => {
      const request = indexedDB.open("FileCacheDB", 1);
      const fileName = `${file.name}_${Date.now().toString()}`;

      request.onupgradeneeded = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "name" });
        }
      };

      request.onsuccess = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");
        store.put({ name: fileName, file: file } as FileRecord);

        transaction.oncomplete = () => {
          db.close();
          resolve(fileName);
        };
      };

      request.onerror = function (event) {
        reject(new Error((event.target as IDBOpenDBRequest).error?.message.toString()));
      };
    });
  }

  loadFileFromCache(fileName: string) {
    return new Promise<File>((resolve, reject) => {
      const request = indexedDB.open("FileCacheDB", 1);

      request.onsuccess = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["files"], "readonly");
        const store = transaction.objectStore("files");
        const getRequest = store.get(fileName);

        getRequest.onsuccess = function () {
          const record = getRequest.result as FileRecord | undefined;
          if (record) {
            resolve(record.file);
          } else {
            reject(new Error((event.target as IDBOpenDBRequest).error?.message.toString()));
          }
          db.close();
        };

        getRequest.onerror = function () {
          reject(new Error((event.target as IDBOpenDBRequest).error?.message.toString()));
          db.close();
        };
      };

      request.onerror = function (event) {
        reject(
          new Error((event.target as IDBOpenDBRequest).error?.message.toString()),
        );
      };
    });
  }

  removeFileFromCache(fileName: string) {
    return new Promise<boolean>((resolve, reject) => {
      const request = indexedDB.open("FileCacheDB", 1);

      request.onsuccess = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");

        const deleteRequest = store.delete(fileName);

        deleteRequest.onsuccess = function () {
          db.close();
          resolve(true);
        };

        deleteRequest.onerror = function () {
          db.close();
          reject(false as unknown as Error);
        };
      };

      request.onerror = function () {
        reject(false as unknown as Error);
      };
    });
  }
}
