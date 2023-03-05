const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);
const fallbackBranchKey = urlParams.get('branchKey') || 'root';

const branchOptionElements = document.getElementsByClassName('branch-option');
for (const branchOptionElement of branchOptionElements) {
    const trashBinElement = branchOptionElement.querySelector('.trash');
    trashBinElement.onclick = async () => {
        const clickCombo = parseInt(trashBinElement.style.getPropertyValue("--click-combo"));
        trashBinElement.style.setProperty('--click-combo', clickCombo + 1);
        if(clickCombo >= 4) {
            trashBinElement.onclick = () => {} //NOOP;
            const branchToDeleteKey = trashBinElement.getAttribute('data-delete-branch-key');

            const data = {
                branchToDeleteKey: branchToDeleteKey,
                fallbackBranchKey: fallbackBranchKey,
            };

            branchOptionElement.remove();
              
            await fetch('/delete-branch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        }
    }
}