function setupFirebase(collectionName){
    const fbConfig = {
        apiKey: "AIzaSyAceP9aR-KV7LSb1_9ESMR9rlUgc6mcE-c",
        authDomain: "tree-maps-7cc04.firebaseapp.com",
        databaseURL: "https://tree-maps-7cc04.firebaseio.com",
        projectId: "tree-maps-7cc04",
        storageBucket: "tree-maps-7cc04.appspot.com",
        messagingSenderId: "332200082190"
    };

    firebase.initializeApp(fbConfig);

    const db = firebase.firestore();

    db.settings({timestampsInSnapshots: true});

    return db.collection(collectionName);

}