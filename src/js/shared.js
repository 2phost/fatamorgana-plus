// src/js/shared.js

/*
    Global
 */

// Utility to wait for an element
function waitForElement(selector, callback) {
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback(element);
        }
    }, 100); // Check every 100ms
}

// Determine the environment and adapt the `data` access method
function getDataAccessMethod() {
    if (typeof window.wrappedJSObject !== 'undefined') {
        // Firefox extension environment
        return async function () {
            return Promise.resolve(window.wrappedJSObject.data);
        };
    } else if (typeof GM !== 'undefined' || typeof GM_info !== 'undefined') {
        // Userscript environment (e.g., Tampermonkey, Greasemonkey)
        return async function () {
            return Promise.resolve(unsafeWindow.data);
        };
    } else {
        // Chrome extension or default fallback
        return async function () {
            return new Promise((resolve, reject) => {
                // Send a message to the background script to fetch the global data
                chrome.runtime.sendMessage({action: "GET_GLOBAL_DATA"}, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    } else if (response && response.error) {
                        reject(response.error);
                    } else {
                        console.log(response.data);
                        resolve(response.data);
                    }
                });
            });
        };
    }
}

// Storage, depending on the environment
function setStorage(keyValuePairs) {
    if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
        // Firefox extensions
        return browser.storage.local.set(keyValuePairs);
    } else if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        // Chrome extensions
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(keyValuePairs, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve();
                }
            });
        });
    } else if (typeof GM !== "undefined" && typeof GM.setValue === "function") {
        // Userscripts (e.g., Tampermonkey, Greasemonkey)
        const promises = [];
        for (const [key, value] of Object.entries(keyValuePairs)) {
            promises.push(GM.setValue(key, value));
        }
        return Promise.all(promises); // Return a promise that resolves when all keys are set
    } else {
        console.error("Storage method not supported in this environment.");
        return Promise.reject("Storage method not supported.");
    }
}

function getStorage(keys) {
    if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
        // Firefox extensions
        return browser.storage.local.get(keys);
    } else if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        // Chrome extensions
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve(result);
                }
            });
        });
    } else if (typeof GM !== "undefined" && typeof GM.getValue === "function") {
        // Userscripts (e.g., Tampermonkey, Greasemonkey)
        const promises = [];
        if (Array.isArray(keys)) {
            for (const key of keys) {
                promises.push(GM.getValue(key));
            }
        } else {
            promises.push(GM.getValue(keys));
        }
        return Promise.all(promises).then((values) => {
            // Convert array of values to an object (for consistency with browser.storage.local.get)
            const result = {};
            (Array.isArray(keys) ? keys : [keys]).forEach((key, index) => {
                result[key] = values[index];
            });
            return result;
        });
    } else {
        console.error("Storage method not supported in this environment.");
        return Promise.reject("Storage method not supported.");
    }
}

/*
    Expedition Selector Module
 */

// Function to wait for `data.expeditions` to be available
function waitForExpeditions(callback) {
    const getData = getDataAccessMethod();
    const interval = setInterval(() => {
        try {
            getData().then((data) => {
                if (data && data.expeditions && data.tx !== undefined && data.ty !== undefined) {
                    clearInterval(interval);
                    callback(data.expeditions);
                }
            })
                .catch((error) => {
                    console.error("Failed to retrieve data:", error);
                });
        } catch (e) {
            // Handle any errors gracefully
            console.warn('Error accessing data:', e);
        }
    }, 1000);
}

// Function to parse the movement string
function parseMovementString(movementString) {
    const rawCoords = movementString.split('_').filter(coord => coord).map(pair => {
        const [x, y] = pair.split('-').map(Number);
        return {x, y};
    });

    const fullPath = [];
    for (let i = 0; i < rawCoords.length - 1; i++) {
        const start = rawCoords[i];
        const end = rawCoords[i + 1];

        if (fullPath.length === 0 || (fullPath[fullPath.length - 1].x !== start.x || fullPath[fullPath.length - 1].y !== start.y)) {
            fullPath.push({x: start.x, y: start.y});
        }

        let currentX = start.x;
        let currentY = start.y;

        while (currentX !== end.x || currentY !== end.y) {
            if (currentX < end.x) currentX++; else if (currentX > end.x) currentX--;

            if (currentY < end.y) currentY++; else if (currentY > end.y) currentY--;

            if (fullPath.length === 0 || (fullPath[fullPath.length - 1].x !== currentX || fullPath[fullPath.length - 1].y !== currentY)) {
                fullPath.push({x: currentX, y: currentY});
            }
        }
    }

    return fullPath;
}

// Highlight the next move
function highlightNextMove(movementString, townX, townY) {
    const movementCoords = parseMovementString(movementString);

    waitForElement('.current-location', (currentLocationDiv) => {
        let currentLocationMatch = currentLocationDiv.textContent.match(/Position: (-?\d+) \/ (-?\d+)/);
        if (!currentLocationMatch) {
            console.error("Failed to extract current coordinates.");
            return;
        }

        let currentX = townX + parseInt(currentLocationMatch[1], 10);
        let currentY = townY - parseInt(currentLocationMatch[2], 10);

        let currentIndex = movementCoords.findIndex(coord => coord.x === currentX && coord.y === currentY);

        const applyHighlight = () => {
            if (currentIndex === -1 || currentIndex === movementCoords.length - 1) {
                console.log("No next movement found.");
                return;
            }

            const nextDestination = movementCoords[currentIndex + 1];

            let direction = '';
            if (nextDestination.x > currentX) direction = 'east'; else if (nextDestination.x < currentX) direction = 'west'; else if (nextDestination.y > currentY) direction = 'south'; else if (nextDestination.y < currentY) direction = 'north';

            const moveElement = document.querySelector(`.action-move-${direction}`);
            if (moveElement) {
                moveElement.style.backgroundColor = '#afcf9dd9'; // Highlight color
                console.log(`Highlighting the move: ${direction}`);
            } else {
                console.error(`No move element found for direction: ${direction}`);
            }
        };

        applyHighlight();

        const moveButtonsContainer = document.querySelector('.zone-plane-controls');
        if (moveButtonsContainer) {
            const observer = new MutationObserver(() => {
                waitForElement('.current-location', (currentLocationDiv) => {
                    currentLocationMatch = currentLocationDiv.textContent.match(/Position: (-?\d+) \/ (-?\d+)/);
                    if (!currentLocationMatch) {
                        console.error("Failed to extract current coordinates.");
                        return;
                    }
                    currentX = townX + parseInt(currentLocationMatch[1], 10);
                    currentY = townY - parseInt(currentLocationMatch[2], 10);
                    currentIndex = movementCoords.findIndex(coord => coord.x === currentX && coord.y === currentY);

                    applyHighlight();
                });
            });

            observer.observe(moveButtonsContainer, {childList: true, subtree: true});
        } else {
            console.error("Move buttons container not found for observation.");
        }
    });
}

// Create the toggle button (for MyHordes site)
function createToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Import expedition';
    toggleButton.style.position = 'relative';
    toggleButton.style.width = '140px';
    // toggleButton.style.top = '14%';
    toggleButton.style.top = '0px';
    toggleButton.style.left = '0%';
    toggleButton.style.zIndex = '998';

    toggleButton.addEventListener('click', () => {
        getStorage(['fm_route', 'fm_townx', 'fm_towny'])
            .then((data) => {
                const {fm_route, fm_townx, fm_towny} = data;
                highlightNextMove(fm_route, fm_townx, fm_towny);

                // Create a popup element
                const popup = document.createElement('div');
                popup.textContent = "Expedition imported";
                popup.style.position = "fixed";
                popup.style.top = "23%";
                popup.style.left = "50%";
                popup.style.transform = "translate(-50%, -50%)";
                popup.style.padding = "15px 30px";
                popup.style.backgroundColor = "rgba(175,167,76,0.94)";
                popup.style.color = "white";
                popup.style.fontSize = "18px";
                popup.style.borderRadius = "8px";
                popup.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
                popup.style.zIndex = "1000";
                popup.style.textAlign = "center";
                popup.style.transition = "opacity 0.5s ease";

                // Append the popup to the body
                document.body.appendChild(popup);

                // Set a timeout to fade out and remove the popup
                setTimeout(() => {
                    popup.style.opacity = "0"; // Fade out
                    setTimeout(() => {
                        popup.remove(); // Remove the element after fade out
                    }, 500); // Matches the fade-out duration
                }, 2000); // Show the popup for 2 seconds
            })
            .catch((error) => {
                console.error("Error retrieving data:", error);
            });
    });

    waitForElement('.cell.background.map-box.rw-12', (contentDiv) => {
        contentDiv.appendChild(toggleButton);
    });
}

// Create dropdown for expeditions (for Fatamorgana site)
function createDropdown(expeditions) {
    const getData = getDataAccessMethod();
    const dropdownContainer = document.createElement('div');
    dropdownContainer.style.position = 'fixed';
    dropdownContainer.style.top = '90px';
    dropdownContainer.style.left = '40px';
    dropdownContainer.style.zIndex = '10000';
    dropdownContainer.style.backgroundColor = '#fff';
    dropdownContainer.style.border = '1px solid #ccc';
    dropdownContainer.style.padding = '10px';
    dropdownContainer.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    dropdownContainer.style.display = 'none';
    dropdownContainer.id = 'dropdownContainer';

    const select = document.createElement('select');
    select.style.marginRight = '10px';

    for (const [key, expedition] of Object.entries(expeditions).reverse()) {
        const option = document.createElement('option');
        option.value = expedition.route;
        option.textContent = `${expedition.day} - ${expedition.name}`;
        select.appendChild(option);
    }
    dropdownContainer.appendChild(select);

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Select';
    dropdownContainer.appendChild(copyButton);

    copyButton.addEventListener('click', () => {
        const selectedRoute = select.value;

        getData().then((data) => {
            const dataToStore = {
                fm_route: selectedRoute, fm_townx: data.tx, fm_towny: data.ty,
            };
            setStorage(dataToStore)
                .then(() => {
                    console.log("Data saved successfully!");
                })
                .catch((error) => {
                    console.error("Error saving data:", error);
                });
        })
            .catch((error) => {
                console.error("Failed to retrieve data:", error);
            });

        const isHidden = dropdownContainer.style.display === 'none';
        dropdownContainer.style.display = isHidden ? 'block' : 'none';
        toggleButton.textContent = isHidden ? 'Hide Routes' : 'Show Routes';

        // Confirmation
        var responseItem = document.createElement("p");
        responseItem.innerHTML = "Expedition selected.";
        responseItem.style.height = "0";
        responseItem.classList.add("ajaxInfo");
        document.getElementById("userInfoBox").appendChild(responseItem);
        responseItem.style.height = (responseItem.scrollHeight - 5) + "px";
        responseItem.style.transition = "all 250ms";
        setTimeout(() => {
            responseItem.style.transition = "all 500ms";
            responseItem.style.height = "0";
            setTimeout(() => {
                responseItem.remove();
            }, 500);
        }, 2500);
    });

    document.body.appendChild(dropdownContainer);

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Select Route';
    toggleButton.style.position = 'relative';

    toggleButton.addEventListener('click', () => {
        const isHidden = dropdownContainer.style.display === 'none';
        dropdownContainer.style.display = isHidden ? 'block' : 'none';
        toggleButton.textContent = isHidden ? 'Hide Routes' : 'Show Routes';
    });

    waitForElement('#townInfo', (barDiv) => {
        barDiv.appendChild(toggleButton);
    });
}
