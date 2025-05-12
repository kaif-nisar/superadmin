(async function () {
    console.log("Dashboard script loaded!");

    async function fetchDashboardData() {
        fetchWalletAmount();
        try {
            const query = `?userId=${userId}`;
            const response = await fetch(`${BASE_URL}/api/v1/user/all-bookings${query}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            updateDashboardUI(data); // 🔹 Dashboard ko update karne ka function
            console.log(data)
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }
    
async function fetchWalletAmount() {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/user/wallet-amount/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch wallet amount');
        const data = await response.json();
        document.getElementById('Balance').innerText = Math.round(data.wallet);
    } catch (error) {
        console.error(error);
    }
}


    function updateDashboardUI(bookings) {
        // ✅ Status-wise count nikalna
        const pendingCount = bookings.filter(booking => booking.status === "pending").length;
        const onHoldCount = bookings.filter(booking => booking.status === "On Hold").length;
        const completedCount = bookings.filter(booking => booking.status === "completed").length;
    
        // ✅ UI me update karna
        document.querySelector(".Progress").innerText = pendingCount || 0;
        document.querySelector(".pending").innerText = onHoldCount || 0;
        document.querySelector(".complete").innerText = completedCount || 0;

        updateBookingsTable(bookings)
    }
    
    function updateBookingsTable(bookings) {
        const tbody = document.querySelector(".booking-table tbody");
        tbody.innerHTML = ""; // ✅ Purani rows clear karo
    
        bookings.forEach(booking => {
            const row = document.createElement("tr");
    
            // ✅ Status ke hisaab se row ka color change karna
            let statusColor = "black";
            if (booking.status === "On Hold") statusColor = "orange";
            if (booking.status === "completed") statusColor = "green";
            if (booking.status === "pending") statusColor = "blue";
    
            // ✅ createdAt ko Indian Standard Time (IST) me convert karna
            const dateObj = new Date(booking.createdAt);
            const formattedDate = dateObj.toLocaleDateString("en-IN"); // 📅 Date (DD/MM/YYYY)
            const formattedTime = dateObj.toLocaleTimeString("en-IN", { hour12: true }); // ⏰ Time (HH:MM AM/PM)
    
            row.innerHTML = `
                <td>${booking.bookingId}</td>
                <td>${booking.patientName}</td>
                <td>₹${booking.total}</td>
                <td>${formattedDate} - ${formattedTime}</td>
                <td style="color:${statusColor}; font-weight: bold;">${booking.status}</td>
            `;
    
            tbody.appendChild(row);
        });
    }
    
    fetchDashboardData(); // 🔹 API Call
})();
