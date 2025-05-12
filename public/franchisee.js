let userId; // Set this to the current user's ID
let username;
let userRole
let Name;
let role;
let email;
let hide = document.getElementById('hide-search');
let show = document.getElementById('show-search');
const urlParams = new URLSearchParams(window.location.search);
const currentPage = urlParams.get('page') || 'dashboard_copy';
const BASE_URL = window.location.origin; // Automatically adapts to localhost or production domain

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

// fetch the assigned tests and populate the table
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

// Call the function to full screen app
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

// Function to toggle the sidebar visibility
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
    // Verify token and initialize user data
 verifyAccessToken();

  const sidebar = document.getElementById('toggle');
  const mainContent = document.getElementById('right-container');
  const menuItems = document.querySelectorAll('#toggle a'); // Left navbar के सभी anchor टैग
  // Add event listener to the logout button
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
  // Handle browser back/forward navigation
  window.addEventListener("popstate", (event) => {
    if (event.state) {
      loadPage(event.state.page);
    }
  });

  debugAdminLayer();

    // जब कोई menu item क्लिक हो, तो sidebar को hide कर दो
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            sidebar.classList.add('hidden'); // Sidebar को छुपाएं
            mainContent.classList.add('full-width'); // Main content को adjust करें
        });
    });
});

// Function to toggle sub-items in the sidebar
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

// Target the first <p> tag inside the .name div
const firstParagraph = document.querySelector('.name .name_text');
async function lik() {
    // Update its inner HTML
    if (firstParagraph) {
        console.log('Name:', Name);
        firstParagraph.innerHTML = `<h4>${Name} ${username}</h4>`;
    }
}
// Delay the execution of the function by 1 second (1000 ms)
setTimeout(() => {
    lik();
}, 500);

// Menu configuration based on user roles and tenant layers
const menuConfig = {
    // First layer admin - hide franchisee sections
    franchisee1layer: {
      hidden: [],
    },
    // Second layer admin - show all franchisee sections
    franchisee2layer: {
        hidden: [],
    },
    // Third layer admin - show all franchisee sections
    franchisee3layer: {
        hidden: [
            "commission","my_commission","my_franchisee","franchisee_price","franchisee_credit"
            ],
    },
    // Fourth layer admin - show all franchisee sections
    franchisee4layer: {
      hidden: [],
    },
    franchisee: {
      // All sections visible for franchisee
      hidden: [],
    },
    staff: {
      // Hide management sections for staff
      hidden: [
        "Add_staff", "List_staff", "Add_lab", 
        "List_lab", "Add_doctor", "List_doctor",
      ],
    },
  };

  async function verifyAccessToken() {
    try {
      const response = await fetch(`${BASE_URL}/api/verify-token`, {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        console.error("Authentication failed");
        localStorage.clear();
        sessionStorage.clear();
        return false;
      }
  
      const data = await response.json();
      userId = data.user._id;
      username = data.user.username;
      role = data.user.role;
      userRole = data.user.role;
      // Check if the user is an admin and extract the layer if available
      // If adminLayer is not provided in the API response, we can check localStorage
      // Or you can modify your backend to include this information
      if (role === "franchisee") {
  
        // Try to get adminLayer from localStorage or API response
        const superLayer = data.user.tenantId.modelType;
        console.log("Admin layer:", superLayer);
        role = `franchisee${superLayer}`;
      }
      
      console.log("User role with layer:", role);
      
      // Initialize menu based on the role
      initializeMenu(role);  
      return data.isAuthorized;
    } catch (error) {
      console.error("Error verifying token:", error);
      return false;
    }
  }

  // Function to initialize menu based on user role and tenant layer
function initializeMenu(userRole) {
    console.log("Initializing menu for role:", userRole);
    
    // Parse the role to determine if it's admin with layer
    let role = userRole; // Default to admin1 if undefined
    
    // Check if role is in the menuConfig, otherwise default to admin1
    if (!menuConfig[role]) {
      role = "franchisee2layer"; // Default to admin2 if role not found
    }
    
    // Extract the layer number from the role (if it's an admin role)
    let layerNumber = 2;
    if (role.startsWith("franchisee") && role.length > 10) {
      layerNumber = parseInt(role.substring(10)) || 3;
    }
    
    // Get the hidden items for this role
    const hiddenItems = menuConfig[role]?.hidden || [];
    console.log("Items to hide:", hiddenItems);
  
    // Hide menu items based on role
    hiddenItems.forEach((itemId) => {
      const menuItems = document.querySelectorAll(`[data-page="${itemId}"]`);
      console.log(`Looking for items with data-page="${itemId}"`, menuItems.length);
      
      menuItems.forEach((item) => {
        // Find the parent li element
        const parentLi = item.closest("li");
        if (parentLi) {
          parentLi.style.display = "none";
          console.log(`Hidden: ${itemId}`);
        }
      });
    });
  
    // Only hide franchisee sections for franchisee2layer
    if (role === "franchisee3layer") {
      // Franchisee sections to hide
      const franchiseeSections = [
        "subItems8", "subItems-c", "subItems-d","subItems-b",
      ];
      
      // Hide the sections and their headers
      franchiseeSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.style.display = "none";
          // Also hide the parent menu item that toggles this section
          const parentItem = section.previousElementSibling;
          if (parentItem && parentItem.tagName === "LI") {
            parentItem.style.display = "none";
          }
        }
      });
      
      // Also hide the FRANCHISEE heading
      const franchiseeHeadings = document.querySelectorAll('.head_franchisee span.book_po');
      franchiseeHeadings.forEach(heading => {
        if (heading.textContent.includes("MY FRANCHISEE")) {
          const bookingSection = heading.closest('.booking');
          if (bookingSection) {
            bookingSection.style.display = "none";
          }
        }
      });
    } else {
      // For admin2, admin3, admin4, ensure franchisee sections are visible
      const franchiseeSections = [
        "subItems-b", "subItems-c", "subItems-d","subItems8",
      ];
      
      franchiseeSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.style.display = "none"; // Initially hide, will be toggled when needed
          // Make sure the parent menu item is visible
          const parentItem = section.previousElementSibling;
          if (parentItem && parentItem.tagName === "LI") {
            parentItem.style.display = "block";
            parentItem.style.display = "flex"
          }
        }
      });
      
      // Make sure the FRANCHISEE heading is visible
      const franchiseeHeadings = document.querySelectorAll('.booking-inner span.book_po');
      franchiseeHeadings.forEach(heading => {
        if (heading.textContent.includes("MY FRANCHISEE")) {
          const bookingSection = heading.closest('.booking');
          if (bookingSection) {
            bookingSection.style.display = "block";
            bookingSection.style.display = "flex";
          }
        }
      });
    }
  
    // Display username and role with layer information
    const nameElement = document.querySelector(".name_text");
    const roleElement = document.querySelector(".nt1");
    
    if (nameElement) {
      nameElement.textContent = username || "User";
    }
    
    if (roleElement) {
      // For admin roles, include the layer number in the display
      if (role.startsWith("franchisee")) {
        roleElement.textContent = `(franchisee - LAYER ${layerNumber})`;
      } else {
        // For other roles, just display the role in uppercase
        roleElement.textContent = `(${role.toUpperCase()})`;
      }
    }
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

if (currentPage) {
    loadPage(currentPage);
}
else {
    loadPage('dashboard_copy');
}

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
}

function debugAdminLayer() {
    // Only run in development or when specifically enabled
    const isDebugMode = localStorage.getItem("debugMode") === "true" || 
                        window.location.search.includes("debug=true");
    
    if (!isDebugMode) return;
    
    console.log("🔍 DEBUG MODE ACTIVE");
    
    // Create a debug panel
    const debugPanel = document.createElement("div");
    debugPanel.style.position = "fixed";
    debugPanel.style.bottom = "10px";
    debugPanel.style.right = "10px";
    debugPanel.style.backgroundColor = "rgba(0,0,0,0.8)";
    debugPanel.style.color = "white";
    debugPanel.style.padding = "10px";
    debugPanel.style.borderRadius = "5px";
    debugPanel.style.zIndex = "9999";
    debugPanel.style.fontSize = "12px";
    debugPanel.style.maxWidth = "300px";
    
    // Add layer selector
    const layerSelector = document.createElement("select");
    layerSelector.innerHTML = `
      <option value="1">Layer 1</option>
      <option value="2">Layer 2</option>
      <option value="3">Layer 3</option>
      <option value="4">Layer 4</option>
    `;
    
    // Set the current layer
    const currentLayer = localStorage.getItem("franchisee") || "2layer";
    layerSelector.value = currentLayer;
    
    // Add event listener to change layer
    layerSelector.addEventListener("change", (e) => {
      const newLayer = e.target.value;
      localStorage.setItem("franchisee", newLayer);
      
      // Update the UI immediately
      const roleWithLayer = `franchisee${newLayer}`;
      initializeMenu(roleWithLayer);
      
      // Update the debug info
      document.getElementById("current-role").textContent = roleWithLayer;
    });
    
    // Add debug info and controls
    debugPanel.innerHTML = `
      <div style="margin-bottom:10px;"><strong>Admin Layer Debug</strong></div>
      <div style="margin-bottom:5px;">Current Role: <span id="current-role">${role || "unknown"}</span></div>
      <div style="margin-bottom:5px;">Override Layer: </div>
    `;
    
    // Append the layer selector
    debugPanel.appendChild(layerSelector);
    
    // Add a button to reload the page
    const reloadButton = document.createElement("button");
    reloadButton.textContent = "Apply & Reload";
    reloadButton.style.marginTop = "10px";
    reloadButton.style.padding = "5px";
    reloadButton.style.width = "100%";
    reloadButton.addEventListener("click", () => {
      window.location.reload();
    });
    
    debugPanel.appendChild(reloadButton);
    
    // Add to page
    document.body.appendChild(debugPanel);
  }
  

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
