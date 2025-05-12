function hg() {
    // Get the form and button elements
        const categoryNameInput = document.getElementById('name');
        const submitButton = document.getElementById('submitBtn');
    
        submitButton.addEventListener('click', function(event) {
            // Prevent the default button behavior (since it's outside the form, it won't submit by default)
            event.preventDefault();
        
            // Get the value of the input field
            const categoryName = categoryNameInput.value.trim();
        
            if (categoryName) {
                // Send data to the backend using fetch (AJAX)
                fetch(`${BASE_URL}/api/v1/user/category-add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        catName: categoryName,  // Send the category name in the request body
                    })
                })
                .then(response => response.json())  // Parse the response as JSON
                .then(data => {
                    if (data.success) {
                        // Handle success (e.g., show a success message or redirect)
                        alert('Category added successfully');
                        categoryNameInput.value = '';  // Clear the input field after success
                        // Optionally, you can redirect to another page or update the UI here.
                    } else {
                        // Handle failure (e.g., show an error message)
                        alert('Failed to add category. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while saving the category.');
                });
            } else {
                // Handle empty input
                alert('Please enter a category name');
            }
        });
}
hg();