loadTest();

async function loadTest() {
    try {
        // Retrieve the access token from cookies

        const response = await fetch(`${BASE_URL}/api/v1/user/test-database`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                // 'Cookie': cookiesY // Include cookies in headers
            },
            // body: JSON.stringify({ cookiesY }), // Include necessary body data
            credentials: 'include'
        });

        // Check if the response is ok
        if (!response.ok) {
            throw new Error("something went wrong"); // Throw a proper error message
        }

        const test = await response.json();
        console.log(test); // Log the test data for debugging
        await populateLoadTest(test); // Call the function to handle the test data
    }
    catch (error) {
        console.error("Error in loadTest:", error); // Log the error message
    }
}

async function loadcategory(id) {
    try {
            const response = await fetch(`${BASE_URL}/api/v1/user/categoryById`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }), // Include necessary body data
            });
           const catdoc = await response.json();
           console.log(catdoc)
            return catdoc.category;
        } catch (error) {
            console.log(error)
        }
}

async function populateLoadTest(test) {
    const tbody = document.querySelector("#tbodyid");
    tbody.innerHTML = "";

    // Sort the tests by the order field
    test.sort((a, b) => a.order - b.order);

    for (const t of test) {
        const row = document.createElement('tr');
        row.setAttribute('draggable', true); // Make the row draggable
        row.setAttribute('data-id', t.order); // Store the order ID for reference
        
        let catdoc = await loadcategory(t.category);

        row.innerHTML = `
            <td class="order"><i class="fa-solid fa-up-down"></i>${t.order}</td>
            <td>${t.Name}</td>
            <td>${t.Price}</td>
            <td>${t.sampleType}</td>
            <td>${t.Short_name}</td>
            <td>${catdoc}</td>
            <td class="actions">
                <a href="#" onclick="loadPage('editTest', '${t._id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</a>
            </td>`;

        tbody.appendChild(row);
    }

    // Add drag-and-drop functionality
    addDragAndDropListeners();

    // Add event listeners for edit buttons
    addEditButtonListeners();
}



function addDragAndDropListeners() {
    const rows = document.querySelectorAll("#tbodyid tr");
    let draggedRow = null;

    rows.forEach(row => {
        // Drag Start
        row.addEventListener('dragstart', (e) => {
            draggedRow = row;
            row.classList.add('dragging'); // Highlight the row being dragged

            // Disable default drag image
            e.dataTransfer.setDragImage(new Image(), 0, 0);
        });

        // Drag Over
        row.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow dropping

            const targetRow = e.target.closest('tr');
            if (targetRow && targetRow !== draggedRow) {
                targetRow.classList.add('drop-target'); // Highlight the target row
            }
        });

        // Drag Leave
        row.addEventListener('dragleave', (e) => {
            const targetRow = e.target.closest('tr');
            if (targetRow) {
                targetRow.classList.remove('drop-target'); // Remove highlight from target row
            }
        });

        // Drop
        row.addEventListener('drop', (e) => {
            e.preventDefault();

            const targetRow = e.target.closest('tr');
            if (targetRow && targetRow !== draggedRow) {
                const tbody = targetRow.parentElement;
                const draggedIndex = [...tbody.children].indexOf(draggedRow);
                const targetIndex = [...tbody.children].indexOf(targetRow);

                // Reorder rows visually
                if (draggedIndex < targetIndex) {
                    tbody.insertBefore(draggedRow, targetRow.nextSibling);
                } else {
                    tbody.insertBefore(draggedRow, targetRow);
                }

                targetRow.classList.remove('drop-target'); // Remove highlight
            }
        });

        // Drag End
        row.addEventListener('dragend', () => {
            if (draggedRow) {
                draggedRow.classList.remove('dragging'); // Remove highlight
            }
            updateOrder(); // Update order after dragging
        });
    });
}


function updateOrder() {
    const rows = document.querySelectorAll("#tbodyid tr");
    const updatedOrder = [];

    rows.forEach((row, index) => {
        const orderId = row.getAttribute('data-id');
        const orderCell = row.querySelector('td:first-child');
        orderCell.textContent = index + 1; // Update the order number visually
        updatedOrder.push({ id: orderId, order: index + 1 });
    });

    // Send the updated order to the server
    saveOrderToServer(updatedOrder);
}

async function saveOrderToServer(updatedOrder) {
    // Select table and container elements
    const tableContainer = document.getElementById("tableContainer"); // Assume this is the container holding the table
    const table = document.getElementById("categoriesTable");

    // Create and show loading animation
    const loader = document.createElement("div");
    loader.id = "loading";
    loader.className = "loader"; // Add a class to apply CSS animation
    loader.innerHTML = `
        <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;"></div>
        <p>Saving changes...</p>
    `;
    document.body.appendChild(loader);

    // Hide the table container
    tableContainer.style.display = "none";

    try {
        const response = await fetch(`${BASE_URL}/api/v1/user/editTestOrder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ updatedOrder }),
        });

        if (!response.ok) {
            throw new Error("Failed to update order on server");
        }

        const result = await response.json();
        console.log("Order updated successfully:", result);
        location.reload();
    } catch (error) {
        console.error("Error updating order on server:", error);
        alert("Failed to save the order. Please try again.");
    } finally {
        // Show the table container and hide the loading animation
        tableContainer.style.display = "block";
        const loader = document.getElementById("loading");
        if (loader) loader.remove();
    }
}

function addEditButtonListeners() {
    const editButtons = document.querySelectorAll('.actions a[data-page="editTest"]');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const row = e.target.closest('tr');
            if (row && row.cells.length >= 3) {
                const cellvalue1 = row.cells[1].textContent.trim();
                const cellvalue2 = row.cells[2].textContent.trim();

                const url = `${BASE_URL}/superAdmin.html?page=editTest&value1=${encodeURIComponent(cellvalue1)}&value2=${encodeURIComponent(cellvalue2)}`;
                window.location.href = url;
            } else {
                console.error("Row or cells not found!");
            }
        });
    });
}

function filterTable() {
    const searchInput = document.querySelector("#searchInput").value.toLowerCase(); // Get the search query
    const rows = document.querySelectorAll("#tbodyid tr");

    rows.forEach(row => {
        const rowData = Array.from(row.cells)
            .map(cell => cell.textContent.toLowerCase())
            .join(" "); // Concatenate all cell text in a row

        // Show the row if it includes the search query, otherwise hide it
        if (rowData.includes(searchInput)) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    });
}

