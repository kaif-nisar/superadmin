function j() {
   // Select the form and submit button
document.getElementById("submit").addEventListener("click", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Collect form data
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const staffType = document.getElementById("stafftype").value;
    const submissionDate = document.getElementById("submission-date").value;

    // Validate required fields (basic validation)
    if (!firstname || !lastname || !email || !username || !password) {
        alert("Please fill all the required fields!");
        return;
    }

    // Prepare data to send to the server
    const staffData = {
        firstname,
        lastname,
        email,
        phone,
        username,
        password,
        staffType,
        submissionDate,
        userId
    };
    console.log(staffData)
    // Send data to the server using Fetch API
    fetch(`${BASE_URL}/api/v1/user/add-staff`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Staff added successfully!");
                // Optionally reset the form
                document.querySelector("form").reset();
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Failed to add staff. Please try again.");
        });
});

}
j();