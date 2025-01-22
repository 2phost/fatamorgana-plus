// Initialize functionalities based on domain
if (window.location.href.includes('myhordes.eu')) {
    createToggleButton();

    // Apply saved visibility state
    const isExpanded = localStorage.getItem('isExpanded') === 'true';
    const inputContainer = document.querySelector('div[style*="position: fixed"]');
    if (inputContainer) {
        inputContainer.style.display = isExpanded ? 'block' : 'none';
    }
}

if (window.location.href.includes('fatamorgana.md26.eu')) {
    waitForExpeditions(createDropdown);
}
