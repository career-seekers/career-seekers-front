export class FileManager {
    saveFileToCache(file) {
        return new Promise<string>((resolve, reject) => {
            const request = indexedDB.open('FileCacheDB', 1);

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
                store.put({ name: file.name, file: file });

                transaction.oncomplete = () => {
                    db.close();
                    resolve(file.name);
                };
            };

            request.onerror = function(event) {
                reject('IndexedDB error:' + event.target.errorCode);
            };
        })
    }

    loadFileFromCache(fileName) {
        return new Promise<any>((resolve, reject) => {
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
}

export interface TutorFiles {
    consentFileName: string
}

export interface ExpertFiles {
    consentFileName: string
}

export interface ParentFiles {
    childConsentFileName: string
    childBirthCertificateName: string
    childSnilsScanName: string
    childSchoolCertificateName: string
    childPlatformCertificateName: string
}


export type FilesToVerify = TutorFiles | ExpertFiles | ParentFiles