// Global variables
let userId;
let role;
let username;
let userRole;
let BASE_URL = window.location.origin;

// Toggle sidebar functionality
function toggleSidebar() {
  let sidebar = document.getElementById("left-navbar");
  let mainContent = document.getElementById("content-box");
  sidebar.classList.toggle("hidden");
  mainContent.classList.toggle("collapsed");
}

// Toggle submenu items
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
  toggleItem.classList.toggle("expanded");
}

// Logout functionality
function logout() {
  fetch(`${BASE_URL}/api/v1/user/logout`, {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        console.log("Logout successful");
        window.location.href = `${BASE_URL}/index.html`;
      } else {
        throw new Error("Logout failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Menu configuration based on user roles and tenant layers
const menuConfig = {
  // First layer admin - hide franchisee sections
  admin1layer: {
    hidden: [
      "Add_franchisse", "List_franchisse", "Accounts",
      "Assign_price", "Bulk_pricing", "Transfer_pricing",
      "Assign_credit", "Credit_history"
    ],
  },
  // Second layer admin - show all franchisee sections
  admin2layer: {
    hidden: [],
  },
  // Third layer admin - show all franchisee sections
  admin3layer: {
    hidden: [],
  },
  // Fourth layer admin - show all franchisee sections
  admin4layer: {
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

// Verify token and extract user role with admin layer
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
    if (role === "admin") {

      // Try to get adminLayer from localStorage or API response
      const adminLayer = data.user.tenantId.modelType;
      console.log("Admin layer:", adminLayer);
      role = `admin${adminLayer}`;
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
    role = "admin1layer";
  }
  
  // Extract the layer number from the role (if it's an admin role)
  let layerNumber = 1;
  if (role.startsWith("admin") && role.length > 5) {
    layerNumber = parseInt(role.substring(5)) || 1;
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

  // Only hide franchisee sections for admin1
  if (role === "admin1layer") {
    // Franchisee sections to hide
    const franchiseeSections = [
      "subItems-b", "subItems-c", "subItems-d"
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
    const franchiseeHeadings = document.querySelectorAll('.booking-inner span.book_po');
    franchiseeHeadings.forEach(heading => {
      if (heading.textContent.includes("FRANCHISEE")) {
        const bookingSection = heading.closest('.booking');
        if (bookingSection) {
          bookingSection.style.display = "none";
        }
      }
    });
  } else {
    // For admin2, admin3, admin4, ensure franchisee sections are visible
    const franchiseeSections = [
      "subItems-b", "subItems-c", "subItems-d"
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
    if (role.startsWith("admin")) {
      roleElement.textContent = `(ADMIN - LAYER ${layerNumber})`;
    } else {
      // For other roles, just display the role in uppercase
      roleElement.textContent = `(${role.toUpperCase()})`;
    }
  }
}

// Function to check authorization
async function checkAuthorization() {
  const isAuthorized = await verifyAccessToken();

  if (!isAuthorized) {
    window.location.href = `${BASE_URL}/index.html`;
    return false;
  }

  return true;
}

// Load page function
async function loadPage(page, Name, _id, BASE_URL, name) {
  // Verify authorization on each page load if needed
  // const isAuthorized = await checkAuthorization();
  // if (!isAuthorized) return;

  clearOldPage();

  fetch(`pages/pages/${page}.html`)
    .then((response) => response.text())
    .then((html) => {
      const container = document.querySelector(".content-box");
      container.innerHTML = html;
      loadScript(`pages/pages/${page}.js`)
        .then(() => {
          // Script loaded successfully
        })
        .catch((error) => console.error(error));

      // Handle query parameters
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", page);
      if (Name) urlParams.set("Name", encodeURIComponent(Name));
      if (_id) urlParams.set("_id", encodeURIComponent(_id));
      if (name) urlParams.set("name", encodeURIComponent(name));
      window.history.pushState({ page }, "", `?${urlParams.toString()}`);
      
      // Highlight active menu item
      highlightActiveMenuItem(page);
    })
    .catch((error) => console.error(error));
}

// Helper functions
function clearOldPage() {
  const container = document.querySelector(".content-box");
  container.innerHTML = "";
  const oldScripts = container.querySelectorAll("script");
  oldScripts.forEach((script) => script.remove());
}

function highlightActiveMenuItem(page) {
  // Remove active class from all menu items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class to current menu item
  const activeItems = document.querySelectorAll(
    `.nav-item[data-page="${page}"]`
  );
  activeItems.forEach((item) => {
    item.classList.add("active");
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = (err) =>
      reject(new Error(`Failed to load script: ${url}`));
    document.body.appendChild(script);
  });
}

// Function to attach event listeners to menu items
function attachMenuEventListeners() {
  const navItems = document.querySelectorAll(".nav-item");
  let debounceTimeout;

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Debounce clicks
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const page = item.getAttribute("data-page");
        if (page) {
          loadPage(page);
        }
      }, 300); // 300ms debounce delay
    });
  });
}

// Debug function to help troubleshoot admin layers
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
  const currentLayer = localStorage.getItem("superFranchisee") || "2layer";
  layerSelector.value = currentLayer;
  
  // Add event listener to change layer
  layerSelector.addEventListener("change", (e) => {
    const newLayer = e.target.value;
    localStorage.setItem("superFranchisee", newLayer);
    
    // Update the UI immediately
    const roleWithLayer = `superFranchisee${newLayer}`;
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

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", async function () {
  // Verify token and initialize user data
  await verifyAccessToken();

  // Add event listener to the logout button
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  // Set up event listeners for navbar items
  attachMenuEventListeners();

  // Load page from URL or default to dashboard
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = urlParams.get("page") || "dashboard";
  loadPage(currentPage);

  // Handle browser back/forward navigation
  window.addEventListener("popstate", (event) => {
    if (event.state) {
      loadPage(event.state.page);
    }
  });
  
  // Set up sidebar toggle if needed
  const toggleBtn = document.getElementById("toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleSidebar);
  }
  
  // Initialize debug tools if needed
  debugAdminLayer();
});

// fetch amount  of data from server

// async function fetchWalletAmount() {
//     try {
//         const response = await fetch(`${ BASE_URL }/api/v1/user/wallet-amount/${userId}`);
//         if (!response.ok) throw new Error('Failed to fetch wallet amount');
//         const data = await response.json();
//         document.getElementById('walletAmount').innerText = data.wallet;
//     } catch (error) {
//         console.error(error);
//     }
// }

// // Fetch wallet amount every 5 seconds (5000 ms)
// setInterval(fetchWalletAmount, 10000);

