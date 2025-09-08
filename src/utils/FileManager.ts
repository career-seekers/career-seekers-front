export class FileManager {
    saveFileToCache(file) {
        return new Promise<string>((resolve, reject) => {
            const request = indexedDB.open('FileCacheDB', 1);
            const fileName = `${file.name}_${Date.now()}`

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'name' });
                }
            };

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['files'], 'readwrite');
                const store = transaction.objectStore('files');
                store.put({ name: fileName, file: file });

                transaction.oncomplete = () => {
                    db.close();
                    resolve(fileName);
                };
            };

            request.onerror = function(event) {
                reject('IndexedDB error:' + event.target.errorCode);
            };
        })
    }

    loadFileFromCache(fileName) {
        return new Promise<File | Error>((resolve, reject) => {
            const request = indexedDB.open('FileCacheDB', 1);

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['files'], 'readonly');
                const store = transaction.objectStore('files');
                const getRequest = store.get(fileName);

                getRequest.onsuccess = function() {
                    const record = getRequest.result;
                    if (record) {
                        resolve(record.file);
                    } else {
                        reject(new Error('File not found in IndexedDB'));
                    }
                    db.close();
                };

                getRequest.onerror = function(event) {
                    reject(new Error('Error retrieving file: ' + event.target.errorCode));
                    db.close();
                };
            };

            request.onerror = function(event) {
                reject(new Error('IndexedDB error: ' + event.target.errorCode));
            };
        });
    }

    removeFileFromCache(fileName) {
        return new Promise<boolean>((resolve, reject) => {
            const request = indexedDB.open('FileCacheDB', 1);

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['files'], 'readwrite');
                const store = transaction.objectStore('files');

                const deleteRequest = store.delete(fileName);

                deleteRequest.onsuccess = function() {
                    db.close();
                    resolve(true)
                };

                deleteRequest.onerror = function(event) {
                    db.close();
                    reject(false)
                };
            };

            request.onerror = function() {
                reject(false);
            };
        })
    }
}