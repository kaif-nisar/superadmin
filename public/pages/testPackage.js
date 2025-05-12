function showRatelist(list) {
    document.getElementById('in-ratelist').classList.add('hidden');
    document.getElementById('not-in-ratelist').classList.add('hidden');
    document.getElementById('in-ratelist-tab').classList.remove('active');
    document.getElementById('not-in-ratelist-tab').classList.remove('active');
    
    if (list === 'in-ratelist') {
        document.getElementById('in-ratelist').classList.remove('hidden');
        document.getElementById('in-ratelist-tab').classList.add('active');
    } else {
        document.getElementById('not-in-ratelist').classList.remove('hidden');
        document.getElementById('not-in-ratelist-tab').classList.add('active');
    }
}


async function fetchingpackagesfromDatabase() {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/user/all-packages`,{method:"POST"})

        if(!response.ok) {
            throw new Error("something went wrong while fetching details")
        }

        const allpackages = await response.json();

        printpackagesInTable(allpackages);

    } catch (error) {
        console.log(error);
    }
}

function printpackagesInTable(allpackages) {
    const pannelTableBody = document.querySelector('#in-ratelist tbody');
    pannelTableBody.innerHTML = '';
    let orderId = 0;

    allpackages.forEach(package => {
        const row = document.createElement('tr');
        orderId++;
        
        row.innerHTML = `
        <td>${orderId}</td>
        <td>${package.packageName}</td>
        <td>${package.packageFee}</td>
        <td>${package.pannelname},${package.testname}</td>
        <td>${package.testSample},${package.pannelSample}</td>
         <td class="actions">
                <a href="#" onclick="loadPage('editPackage', '${package._id}')">Edit</a>
            </td>`

        pannelTableBody.appendChild(row);
    })
};

fetchingpackagesfromDatabase();