let hide = document.getElementById('hide-search');
let show = document.getElementById('show-search');

let searchDiv = document.getElementsByClassName('search-bar-div');

hide.addEventListener('click', function () {
    let searchDiv = document.querySelector('.search-bar-div');
    searchDiv.style.width = '0px';
})
show.addEventListener('click', function () {
    let searchDiv = document.querySelector('.search-bar-div');
    searchDiv.style.width = '18rem';
})


document.getElementById('pdfBtn').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Grab the HTML table content and prepare an array of rows
    const table = document.querySelector('table');
    
    // Check if the table has rows
    const tableRows = table.querySelectorAll('tbody tr');
    if (tableRows.length === 0) {
        alert('No data available for PDF generation');
        return;
    }

    // Prepare rows array for autoTable
    const rows = [];
    
    // Get the table headers
    const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.innerText);
    rows.push(headers);  // Add the headers to the rows array

    // Get the table data (excluding headers)
    tableRows.forEach(row => {
        const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
        rows.push(rowData);  // Add each row of data
    });

    // Log the extracted data (for debugging purposes)
    // console.log('Table headers:', headers);
    // console.log('Table rows:', rows);

    // Create the table in the PDF
    doc.autoTable({
        head: [headers],  // Table headers
        body: rows.slice(1),  // All rows excluding the header row
        startY: 20,  // Start the table below the title
        margin: { top: 10, left: 10, right: 10, bottom: 10 },
        theme: 'grid'  // Optional: Adds a grid style to the table
    });

    // Save the PDF
    doc.save('test_profiles.pdf');
});


async function fetchAssignedTests() {
    try {
        // Make API calls for all three resources concurrently
        const [testResponse, panelResponse, packageResponse] = await Promise.all([
            fetch(`${BASE_URL}/api/v1/user/get-test?userId=${userId}`, { method: "POST" }),
            fetch(`${BASE_URL}/api/v1/user/get-all-pannels?userId=${userId}`, { method: "POST" }),
            fetch(`${BASE_URL}/api/v1/user/get-all-packages?userId=${userId}`, { method: "POST" })
        ]);

        // Check if all responses are successful
        if (!testResponse.ok || !panelResponse.ok || !packageResponse.ok) {
            throw new Error("One or more API requests failed");
        }

        // Parse the JSON data from each API response
        const testData = await testResponse.json();
        const panelData = await panelResponse.json();
        const packageData = await packageResponse.json();

        // Combine the data into a single array
        const combinedData = [
            ...testData,
            ...panelData,
            ...packageData
        ];

        // Clear the table body before adding new rows
        tableBody.innerHTML = "";

        // Populate the table with combined data
        combinedData.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.testName || item.packageName || item.panelName}</td>
                <td>Rs. ${item.mrpPrice || "N/A"}</td>
                <td>Rs. ${item.myPrice || "N/A"}</td>
                <td>${item.tat || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching assigned tests:", error);
        alert("Unable to load data. Please try again later.");
    }
}

document.getElementById('fullscreen-button').addEventListener('click', function () {
    let icon = document.getElementById('logo1')
    if (document.fullscreenElement) {
        // Exit fullscreen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
            // icon.classList.remove('fa-expand');
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
            // icon.classList.remove('fa-expand');
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
            // icon.classList.remove('fa-expand');
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
            // icon.classList.remove('fa-expand');
        }
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
    } else {
        // Enter fullscreen mode
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            // icon.classList.add('fa-expand');
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
            // icon.classList.add('fa-expand');
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
            // icon.classList.add('fa-expand');
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
            // icon.classList.add('fa-expand');
        }
        icon.classList.add('fa-compress');
        icon.classList.remove('fa-expand');
    }
});


function tp() {
    var toggle = document.getElementById("toggle");
    let right_con = document.getElementById("right-container");

    // Toggle the 'hide' class
    let isset = toggle.classList.toggle('hidden');


    if (isset) {
        right_con.classList.add("full-width"); // Apply full width class
    } else {
        right_con.classList.remove("full-width"); // Remove full width class
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('toggle');
    const mainContent = document.getElementById('right-container');
    const menuItems = document.querySelectorAll('#toggle a'); // Left navbar के सभी anchor टैग

    // जब कोई menu item क्लिक हो, तो sidebar को hide कर दो
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            sidebar.classList.add('hidden'); // Sidebar को छुपाएं
            mainContent.classList.add('full-width'); // Main content को adjust करें
        });
    });
});


function toggleSubItems(id) {
    var subItems = document.getElementById(id);
    var toggleItem = subItems.previousElementSibling;

    // Toggle the visibility of the sub-items
    if (subItems.style.display === "block") {
        subItems.style.display = "none";
    } else {
        subItems.style.display = "block";
    }
    // Toggle the class for the rotation of the toggle symbol
    toggleItem.classList.toggle('expanded');
}

let userId; // Set this to the current user's ID
let username;
let userRole
let Name;
let role;

// Target the first <p> tag inside the .name div
const firstParagraph = document.querySelector('.name .name_text');

async function lik() {
    console.log("i am inside the lik function")
    // Update its inner HTML
    if (firstParagraph) {
        console.log("i am inside the lik function if condition")
        firstParagraph.innerHTML = `<h3>${Name} ${username}</h3>`;
    }
}
setTimeout(() => {
    lik();
}, 900); // Call the function to set the initial value
// Delay the execution of the function by 1 second (1000 ms)
// setTimeout(() => {
//     lik();
// }, 500);

// Function to verify access token
async function verifyAccessToken() {
    // alert("i am inside th verify AccessToken")
    const response = await fetch('/api/verify-token', { // Adjust the endpoint as needed
        method: 'GET',
        credentials: 'include' // Include cookies with the request
    });

    if (!response.ok) {
        throw new Error('Unauthorized access');
    }

    const data = await response.json();
    userId = data.user._id;
    userRole = data.user._id;
    username = data.user.username;
    email = data.user.email;
    Name = data.user.fullName;
    role = data.user.role;
    return data.isAuthorized; // Assume your server returns an object with isAuthorized property
}
// dynamic page load without bug
const navItems = document.querySelectorAll('.nav-item');
const container = document.querySelector('.right-container');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        loadPage(page);
        window.history.pushState({ page }, '', `?page=${page}`);
    });
});

const urlParams = new URLSearchParams(window.location.search);
const currentPage = urlParams.get('page') || 'dashboard_copy';

if (currentPage) {
    loadPage(currentPage);
}
else {
    loadPage('dashboard_copy');
}

const BASE_URL = window.location.origin; // Automatically adapts to localhost or production domain

async function loadPage(page, Name, _id, BASE_URL, name) {

    const isAuthorized = await verifyAccessToken(); // Verify access token before loading the page

    if (!isAuthorized) {
        alert('You are not authorized to access this page.');
        // Redirect or load a default page if necessary
        return;
    }


    // Step 1: Clear the old page content and scripts
    clearOldPage();

    fetch(`pages/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;
            // sabhi page ki js file ko load karta hai or exicute bhi
            const script = document.createElement('script');
            script.src = `pages/pages/${page}.js`;

            script.onload = function () {
                BASE_URL;
            }
            script.onerror = function () {

                console.error(`Failed to load script: ${script.src}`);
            }
            container.appendChild(script);

            // finish

            // Update the URL without refreshing the page
            // Update the URL without refreshing the page
            //   if (testName) {
            //     window.history.pushState({ page }, '', `?page=${page}&testName=${encodeURIComponent(testName)}`);
            // } else {
            //     window.history.pushState({ page }, '', `?page=${page}`);
            // }

            // Preserve existing query parameters
            const urlParams = new URLSearchParams(window.location.search);

            // Update or add new query parameters
            urlParams.set('page', page);
            if (Name) urlParams.set('Name', encodeURIComponent(Name));
            if (_id) urlParams.set('_id', encodeURIComponent(_id));
            if (name) urlParams.set('name', encodeURIComponent(name));

            // Push the updated URL with all parameters
            window.history.pushState({ page }, '', `?${urlParams.toString()}`);
            document.querySelectorAll('.container a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const nextPage = link.getAttribute('data-page');
                    const nextname = link.getAttribute('data-pannel-name');
                    const nextName = link.getAttribute('data-test-name'); // Assuming you have this attribute for short name
                    const nextId = link.getAttribute('data-id'); // Assuming you have this attribute for id
                    loadPage(nextPage, nextName, nextId, nextname);
                });
            });
        })
        .catch(error => console.error(error));
}
// Clear old page content and script
function clearOldPage() {
    // Clear the HTML content of the container
    container.innerHTML = '';

    // Remove old scripts from the container
    const oldScripts = container.querySelectorAll('script');
    oldScripts.forEach(script => {
        script.remove();
    });

    // Optionally, remove any event listeners from the container (if any)
    // This is just a simple example. If you have specific event listeners, you can manually clean them up.
    // Example: container.removeEventListener('click', oldEventListener);
}


// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    if (event.state) {
        loadPage(event.state.page);
    }
});


// fetch amount  of data from server

async function fetchWalletAmount() {
    try {

        const response = await fetch(`${BASE_URL}/api/v1/user/wallet-amount/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch wallet amount');
        const data = await response.json();
        document.getElementById('walletAmount').innerText = Math.round(data.wallet);
    } catch (error) {
        console.error(error);
    }
}

// // Fetch wallet amount every 5 seconds (5000 ms)
setInterval(fetchWalletAmount, 5000);


function logout() {
    fetch(`${BASE_URL}/api/v1/user/logout`, {
        method: 'POST',
        credentials: 'include' // Include cookies for session management
    })
        .then(response => {
            if (response.ok) {
                // Successfully logged out
                console.log('Logout successful');
                // Redirect to the login page
                window.location.href = `${BASE_URL}/index.html`; // Change to your actual login route
            } else {
                throw new Error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Add event listener to the logout button
document.getElementById('logoutButton').addEventListener('click', logout);
document.getElementById('poweroff-icon').addEventListener('click',logout);
// Get elements
const userIcon = document.getElementById('user');
const supportIcon = document.getElementById('headphone');
const userModal = document.getElementById('userModal');
const supportModal = document.getElementById('supportModal');

document.getElementById('user').addEventListener('click', function () {

    if (userModal.style.display === 'none') {
        const namePara = document.querySelector('.modal-content_one .Name');
        const emailPara = document.querySelector('.modal-content_one .email');
        const rolePara = document.querySelector('.modal-content_one .role'); 

        if (namePara) namePara.innerHTML = `<strong>Name:</strong> ${Name}`;
        if (emailPara) emailPara.innerHTML = `<strong>Email:</strong> ${email}`;
        if (rolePara) rolePara.innerHTML = `<strong>Role:</strong> ${role}`;
        userModal.style.display = 'block';
    }
    else {
        userModal.style.display = 'none';
    }
});

document.getElementById('headphone').addEventListener('click', function () {
    if (supportModal.style.display === 'none') {

        supportModal.style.display = 'block';
    }
    else {
        supportModal.style.display = 'none';
    }
});