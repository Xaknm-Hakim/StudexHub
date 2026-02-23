function readAndRedirect() {
    // 1. Get the select element by its ID
    var selectElement = document.getElementById("mySection");
    
    // 2. Read the value (the URL)
    var selectedUrl = selectElement.value;
    
    // 3. Read the visible text (the Name)
    var selectedText = selectElement.options[selectElement.selectedIndex].text;

    // 4. Perform an action before redirecting
    if (selectedUrl) {

        window.location.href = selectedUrl; // Perform the redirect
    } else {
        alert("Please select a valid destination first!");
    }
}

