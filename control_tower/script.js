
var pageHeader = document.querySelector('h1.page-header');
var pageLinks = document.querySelectorAll('a');

function addTotalToHeader(){
    pageHeader.textContent += ` - ${pageLinks.length}`;
}
addTotalToHeader(); 