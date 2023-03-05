// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, remove, set, child, get } = require('firebase/database');

//import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTh4zy9kXMt0I7EndoszCtyQD7mnGQ2E4",
  authDomain: "ivtadventura.firebaseapp.com",
  databaseURL: "https://ivtadventura-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ivtadventura",
  storageBucket: "ivtadventura.appspot.com",
  messagingSenderId: "969657846418",
  appId: "1:969657846418:web:855342c8cec5d40a83344b",
  measurementId: "G-8ZM9YPKKF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
//const analytics = getAnalytics(app);



function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

async function addBranch(branchKey, branchValue, branchResponse) {
    const newBranchKey = randomString(32);
    
    await set(ref(database, `root/${newBranchKey}`), {
        branchParent: branchKey, 
        rootValue: branchValue,
        rootResponse: branchResponse,
    });    
}

async function getTree() {
    const snapshot = await get(child(ref(database), 'root'))
    
    if(!snapshot.exists())
        return undefined;
    
    let fullTree = snapshot.val();

    //The root returns an array, so we parse it to an object
    if(fullTree.length != undefined) {
        const branchItemsTemp = {};
        for (let i = 0; i < fullTree.length; i++) {
            const element = fullTree[i];
            branchItemsTemp[`${i}`] = element;
        }
        fullTree = branchItemsTemp;
    }
    return fullTree;
}
async function getBranchItems(branchKey) {
    const tree = await getTree();
    const items = [];
    for (const key in tree) {
        if (Object.hasOwnProperty.call(tree, key)) {
            const element = tree[key];
            if(element.branchParent == branchKey) {
                items.push({
                    branch: element,
                    branchKey: key
                });
            }
        }
    }
    return items;
}

function getItemsToDelete(tree, rootKey) {
    let branchToDeleteKeys = [];

    for (const key in tree) {
        if (Object.hasOwnProperty.call(tree, key)) {
            const element = tree[key];
            if(element.branchParent == rootKey) {
                branchToDeleteKeys.push(key);
                //Delete the children of this child
                branchToDeleteKeys = branchToDeleteKeys.concat(getItemsToDelete(tree,key));
            }
        }
    }
    return branchToDeleteKeys;
}

async function deleteBranch(branchKey) {
    const tree = await getTree();
    const branchToDeleteKeys = getItemsToDelete(tree, branchKey);

    //Delete all children


    //Delete self
    branchToDeleteKeys.push(branchKey);

    branchToDeleteKeys.forEach(deleteKey => {
        const dataRef = ref(database, `root/${deleteKey}`);
        remove(dataRef);
    });
}

module.exports = {
    addBranch: addBranch,
    getBranchItems: getBranchItems,
    deleteBranch: deleteBranch
};