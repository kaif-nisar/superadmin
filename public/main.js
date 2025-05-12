/**
 * Dynamic Page Loader
 * Handles navigation between pages without full page reload
 */

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    // Track loaded resources to prevent duplicates
    window.appState = {
        loadedScripts: new Set(),
        loadedStyles: new Set(),
        currentPage: null,
        pageParams: {}
    };
    
    // Initialize navigation
    initNavigation();
    
});

/**
 * Initialize navigation system
 */
function initNavigation() {
    // Update active menu item
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Get the page to load
            const pageToLoad = this.getAttribute("data-page");
            
            
            // Toggle sidebar on mobile (if open)
            const sidebar = document.getElementById("sidebar");
            if (sidebar && sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
            }
        });
    });
    
    // Toggle sidebar for mobile
    const toggleSidebar = document.getElementById("toggle-sidebar");
    const sidebar = document.getElementById("sidebar");
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener("click", function() {
            sidebar.classList.toggle("active");
        });
    }
}

// This script handles the dynamic loading of pages and their respective scripts based on user interaction with the navigation menu.
// It also manages the browser's history state to ensure a smooth user experience when navigating back and forth.
const navItems = document.querySelectorAll('.menu-item');
const container = document.querySelector('.content');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        loadPage(page);
        window.history.pushState({ page }, '', `?page=${page}`);
    });
});

const urlParams = new URLSearchParams(window.location.search);
const currentPage = urlParams.get('page') || 'dashboard';

if (currentPage) {
    loadPage(currentPage);
}
else {
    loadPage('dashboard');
}


const BASE_URL = window.location.origin; // Automatically adapts to localhost or production domain
// Track loaded scripts to prevent duplicate execution
window.loadedScripts = new Set();

async function loadPage(page, Name, _id, BASE_URL, name) {

    if (window.currentPageLoaded === page) {
        console.log(`Page ${page} is already loaded. Skipping.`);
        return;
    }
    window.currentPageLoaded = page;
    
    // Step 1: Clear the old page content and scripts
    cleanPreviousPage()

    fetch(`pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            container.innerHTML = html;

            // Load the associated JavaScript file only if it hasn't been loaded before
            const scriptPath = `pages/${page}.js`;
            if (!window.loadedScripts.has(scriptPath)) {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.setAttribute('data-dynamic', scriptPath);  // ← mark it
                
                script.onload = function () {
                    console.log(`Script loaded: ${scriptPath}`);
                    window.loadedScripts.add(scriptPath); // Mark script as loaded
                };

                script.onerror = function () {
                    console.error(`Failed to load script: ${script.src}`);
                };

                document.body.appendChild(script);
            } else {
                console.log(`Script already loaded: ${scriptPath}`);
            }

            // Preserve existing query parameters
            const urlParams = new URLSearchParams(window.location.search);

            // Update or add new query parameters
            urlParams.set('page', page);
            if (Name) urlParams.set('Name', encodeURIComponent(Name));
            if (_id) urlParams.set('_id', encodeURIComponent(_id));
            if (name) urlParams.set('name', encodeURIComponent(name));

            // Push the updated URL with all parameters
            window.history.pushState({ page }, '', `?${urlParams.toString()}`);

            // Add event listeners for dynamically loaded links
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
// Clear old page content and script
function clearOldPage() {
    // Clear the HTML content of the container
    container.innerHTML = '';
    alert('Page clean successfully!');
    // Remove dynamically added scripts
    const dynamicScripts = document.querySelectorAll('script[data-dynamic]');
    dynamicScripts.forEach(script => script.remove());
}

// ✅ Update cleanPreviousPage() to this:
function cleanPreviousPage() {
    if (typeof window.cleanupCurrentPage === 'function') {
        window.cleanupCurrentPage();
        console.log("cleanupCurrentPage() called.");
    }

    const oldScript = document.querySelector(`script[data-dynamic]`);
    if (oldScript) {
        console.log("Removing old script:", oldScript.src);
        window.loadedScripts.delete(oldScript.getAttribute("data-dynamic")); // ✅ Remove from set
        oldScript.remove();
    }
}


// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    if (event.state) {
        loadPage(event.state.page);
    }
});
/**
 * Initialize charts on the page
 */
function initCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded, skipping chart initialization');
        return;
    }
    
    // Revenue chart
    initRevenueChart();
    
    // Model usage chart
    initModelUsageChart();
    
    // Any other charts...
}

/**
 * Initialize revenue chart
 */
function initRevenueChart() {
    const revenueChartEl = document.getElementById("revenueChart");
    if (!revenueChartEl) return;
    
    // Check if chart instance already exists and destroy it
    if (revenueChartEl._chart) {
        revenueChartEl._chart.destroy();
    }
    
    const revenueChart = new Chart(revenueChartEl, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue',
                data: [18000, 19500, 17000, 21000, 24000, 22500, 28000, 26000, 29000, 32000, 30000, 34000],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [3]
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Store chart instance for later reference
    revenueChartEl._chart = revenueChart;
}

/**
 * Initialize model usage chart
 */
function initModelUsageChart() {
    const modelUsageChartEl = document.getElementById("modelUsageChart");
    if (!modelUsageChartEl) return;
    
    // Check if chart instance already exists and destroy it
    if (modelUsageChartEl._chart) {
        modelUsageChartEl._chart.destroy();
    }
    
    const modelUsageChart = new Chart(modelUsageChartEl, {
        type: 'doughnut',
        data: {
            labels: ['1-Layer', '2-Layer', '3-Layer', '4-Layer'],
            datasets: [{
                data: [25, 35, 20, 20],
                backgroundColor: ['#4895ef', '#4361ee', '#3f37c9', '#4cc9f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    });
    
    // Store chart instance for later reference
    modelUsageChartEl._chart = modelUsageChart;
}