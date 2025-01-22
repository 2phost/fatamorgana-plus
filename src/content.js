// Initialize functionalities based on domain
if (window.location.href.includes('myhordes.eu')) {
    createToggleButton();
}

if (window.location.href.includes('fatamorgana.md26.eu')) {
    waitForExpeditions(createDropdown);
}