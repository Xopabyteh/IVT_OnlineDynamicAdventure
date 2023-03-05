const express = require('express');
const app = express();
const storyTree = require('./storyTree');
const bodyParser = require('body-parser');
const path = require('path');

app.set('views', '../public/views')
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..', 'public')));

function normalizeBranchKey(branchKey) {
    if(typeof(branchKey) !== 'string') {
        return null;
    }
    while (branchKey.endsWith("/")) {
        branchKey = branchKey.slice(0, -1);
    }
    return branchKey;
}

let lastShownResponse = undefined;
app.get('/', async (request, response) => {
    const branchKey = normalizeBranchKey(request.query.branchKey) || 'root';
    const shownItems = await storyTree.getBranchItems(branchKey);
    const responseToShow = request.query.responseToShow || lastShownResponse;
    lastShownResponse = responseToShow;

    response.render('mainPage', {
        branchKey: branchKey,
        responseToShow: responseToShow,
        shownItems: shownItems
    });
});

function validatePostBranchRequest(request) {
    return !(
        request === null
        || request.body === null
        || request.body.branchKey === null
        || request.body.branchValue === null
        || typeof(request.body.branchValue) !== 'string'
        || request.body.branchValue.length > 100
        || request.body.branchValue.length < 1
        || request.body.branchResponse === null
        || typeof(request.body.branchResponse) !== 'string'
        || request.body.branchResponse.length > 100
        || request.body.branchResponse.length < 1
    );
}

function validateDeleteBranchRequest(request) {
    return !(
        request === null
        || request.body === null
        || request.body.branchToDeleteKey === null
    );
}

app.post('/post-branch', async (request, response) => {
    if(!validatePostBranchRequest(request)) {
        response.redirect('/');
        return;
    }

    //Branch parent
    const normalizedBranchKey = normalizeBranchKey(request.body.branchKey);
    await storyTree.addBranch(normalizedBranchKey, request.body.branchValue, request.body.branchResponse);

    //Response, that was there
    response.redirect(`/?branchKey=${normalizedBranchKey}&responseToShow=${lastShownResponse}`);
});

app.post('/delete-branch', async (request, response) => {
    if(!validateDeleteBranchRequest(request)) {
        response.redirect('/');
        return;
    }

    const normalizedDeleteBranchKey = normalizeBranchKey(request.body.branchToDeleteKey);
    await storyTree.deleteBranch(normalizedDeleteBranchKey);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Available on: http://localhost:'+port);
});

