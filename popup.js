const url = 'https://docs.google.com/spreadsheets/d/16ghwGjgxzzZsBYPm2bn_Y6jB31ECMYckB36exce7TEI/export?format=csv',
    pasteInput = document.querySelector('[data-copy-area]'),
    contentWrapper = document.querySelector('[data-cheatsheet-wrapper]'),
    searchInput = document.querySelector('.search'),
    contentHeader = document.querySelector('.content-header'),
    googleSheetLink = document.querySelector('[data-sheet-link]'),
    searchInputPlaceholderArr = ['All the wonders of the world awaits you...', 'Need cheats? I got cheats...'],
    // Regex variables
    labelRegex = /liquid|feed|selector|template|crawl|javascript/i,
    // Matches a line break if it is not surrounded by quotes
    splitLineBreak = /\n(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,
    // Matches a comma if it is not surrounded by quotes
    splitComma = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;

var cheats = [],
    results = [],
    filteredCheats = [];

// Adding random placeholder to the input
searchInput.placeholder = searchInputPlaceholderArr[Math.floor(Math.random() * 2)];

// linking to the Google Sheet using the link href
googleSheetLink.addEventListener('click', (e) => {
    if(e.target.href != undefined){
        chrome.tabs.create({url:e.target.href})
    }
});

// Grabbing data from the google spreadsheet as a string and converting it to JS objects
fetch(url)
    .then(result => result.text())
    .then(function(csvString){
        // Splitting on line break to get an array with the data from the individual row
        var rowArr = csvString.split(splitLineBreak);
        // Getting property names which is going to be the first item in the list, since it's the first row in the google spreadsheet
        var objPropertyNameArr = rowArr[0].split(splitComma);
        for(var x = 1; x < rowArr.length; x++){
            var obj = {};
            var objPropertyValueArr = rowArr[x].split(splitComma);
            for(var y = 0; y < objPropertyNameArr.length; y++){
                // Creating the object looping through the list setting one list as property name and the other as property value
                obj[objPropertyNameArr[y].toLowerCase().replace(/^"|"$/g, '').trim()] = objPropertyValueArr[y].replace(/^"|"$/g, '').trim();
            }
            cheats.push(obj);
        }
        // Refine object data
        cheats.forEach((cheat) => {
            cheat.snippet = cheat.snippet.replace(/([^"])""([^"])/g, '$1"$2').replace('""""', '""')
            cheat.labels = cheat.labels.split(/\.|,|\s/g);
            cheat.labels = cheat.labels.filter(function (label) {
                return label.match(labelRegex) ? label : null;
            });
        });
        // Rendering all results
        initialLoad();
    });
// Called when initially loaded extension and when there is nothing in the search input. Will get all results and set focus on the input when ready
function initialLoad(){
    sortResultsAlphabetically(cheats).forEach((cheat) => {
        createItem(cheat);
    });
    searchInput.focus();
    searchInput.addEventListener('input', searching);
}

function searchLoad(filteredCheats){
    filteredCheats.forEach((cheat) => {
        createItem(cheat);
    });
}
// Clearing results array and removing all results
function clearResults(){
    results.forEach((result) => {
        result.remove();
    });
    results = [];
}
// Sorting results alphabetically. Happens everytime results are being loaded
function sortResultsAlphabetically(sortedResults){
    sortedResults.sort((a, b) => {
        var fa = a.title.toLowerCase(),
            fb = b.title.toLowerCase();
        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });
    return sortedResults;
}
// This function will be called on 'input', so everytime someone is typing in the input
function searching(){
    clearResults();
    filteredCheats = [];
    var searchValue = searchInput.value;
    var searchWordArr = searchValue.toLowerCase().split(' ').filter(word => word);
    if(searchValue == ''){
        return initialLoad();
    }
    cheats.forEach((cheat) => {
        searchWordArr.forEach((searchWord) => {
            if(cheat.title.toLowerCase().match(searchWord) || cheat.keywords.toLowerCase().match(searchWord) || cheat.creator.toLowerCase().match(searchWord)){
                if (!filteredCheats.includes(cheat)){
                    filteredCheats.push(cheat);
                }
            }
        });
    });
    searchLoad(sortResultsAlphabetically(filteredCheats));
}
// This function will create a result with the data in the object. Then appending it to the results
function createItem(cheat){
    var cheatItem = document.createElement('div');
    cheatItem.classList.add('item');
    cheatItem.dataset.cheatItem = '';
    contentWrapper.append(cheatItem);

    var cheatTitle = document.createElement('p');
    cheatTitle.classList.add('cheat-title')
    cheatTitle.dataset.cheatTitle = '';
    cheatTitle.textContent = cheat.title;
    cheatItem.append(cheatTitle);

    if(cheat.creator != ''){
        var cheatCreator = document.createElement('p');
        cheatCreator.classList.add('cheat-creator')
        cheatCreator.dataset.cheatCreator = '';
        cheatCreator.textContent = cheat.creator;
        cheatItem.append(cheatCreator);
    }   

    var cheatDescription = document.createElement('p');
    cheatDescription.classList.add('cheat-description')
    cheatDescription.dataset.cheatDescription = '';
    cheatDescription.textContent = cheat.description;
    cheatItem.append(cheatDescription);

    var cheatSnippet = document.createElement('span');
    cheatSnippet.classList.add('cheat-snippet')
    cheatSnippet.dataset.cheatSnippet = '';
    cheatSnippet.textContent = cheat.snippet;
    cheatSnippet.style.display = 'none';
    cheatItem.append(cheatSnippet);

    // Creating a max of 2 labels to a result. Only the labels listed below is allowed and will be styled differently
    if(cheat.labels != []){
        var labelContainer = document.createElement('div');
        labelContainer.classList.add('label-container');
        cheatItem.append(labelContainer);
        cheat.labels.forEach((label, i) => {
            if(i < 2){
                var labelEl = document.createElement('div');
                labelEl.classList.add('label');
                switch(label.toLowerCase()) {
                    case 'liquid':
                        labelEl.dataset.labelLiquid = '';
                    break;
                    case 'feed':
                        labelEl.dataset.labelFeed = '';
                    break;
                    case 'selector':
                        labelEl.dataset.labelSelector = '';
                    break;
                    case 'template':
                        labelEl.dataset.labelTemplate = '';
                    break;
                    case 'crawl':
                        labelEl.dataset.labelCrawl = '';
                    break;
                    case 'javascript':
                        labelEl.dataset.labelJavascript = '';
                    break;
                }
                labelEl.textContent = label;
                labelContainer.append(labelEl);
            }
        });
    }
    // Adding the click event that copies the snippet and creating the 'Copied' overlay animation
    cheatItem.addEventListener('click', (e) => {
        pasteInput.value = e.target.querySelector('[data-cheat-snippet]').textContent;
        pasteInput.select();
        navigator.clipboard.writeText(pasteInput.value);

        var copyOverlay = document.createElement('div');
        copyOverlay.classList.add('copy-overlay');
        copyOverlay.textContent = 'Copied!';
        e.target.append(copyOverlay);
        copyOverlay.addEventListener('animationend', () => {
            copyOverlay.remove();
        });
    });
    results.push(cheatItem);
}
