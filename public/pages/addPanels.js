(function addpannelfun() {
    // Function to initialize TinyMCE
    // async function tinymcefunction() {
    //     return tinymce.init({
    //         selector: '#editorContent',
    //         height: 300,
    //         menubar: false,
    //         plugins: 'table lists link',
    //         toolbar: 'undo redo | formatselect | bold italic backcolor | table | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link',
    //         content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
    //     });
    // }

    // tinymcefunction();

    // async function del() {
    //     // Remove the old TinyMCE instance first
    //     tinymce.remove('#editorContent');

    //     // Now initialize the editor again
    //     await tinymcefunction();
    // }
    // del();
    let testInputtype = document.getElementById("tests");
    const tagsdivaddpannel = document.getElementById("middle-tag-div");
    const testList = document.getElementById('search-hint');

    let selectedTests = new Map();
    let uniqueSampleTypes = new Set();
    let currentSampleType = null; // To track the currently selected sample type

    async function fetchAndPopulateCategories() {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/user/fetchCategories`, {
                method: "POST"
            });

            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await response.json();
            if (data.categories) {
                populateCategories(data.categories);
            } else {
                console.error("No categories found");
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            alert("Error fetching categories. Please try again.");
        }
    }

    function populateCategories(categories) {
        const selectElement = document.getElementById("category"); // Target the <select> element
        selectElement.innerHTML = ""; // Clear existing options

        // Populate categories as options
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.textContent = category.category; // Use category name from the fetched data
            option.value = category.category; // Set value (use id if available, otherwise name)
            selectElement.appendChild(option);
        });
    }

    fetchAndPopulateCategories();

    async function loadTests() {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/user/test-database`, { method: "POST" });
            const tests = await response.json();

            testList.innerHTML = '';
            tests.forEach(test => {
                const testElement = document.createElement('div');
                testElement.id = "tests-name-div";
                testElement.setAttribute('sampletype', test.sampleType);
                testElement.innerHTML = `${test.Name}`;
                testList.appendChild(testElement);

                testElement.addEventListener("click", function (e) {
                    const testName = e.target.innerText;
                    const sampleType = e.target.getAttribute('sampletype');

                    if (!currentSampleType) {
                        // Set the current sample type on first selection
                        currentSampleType = sampleType;
                    }

                    if (sampleType !== currentSampleType && currentSampleType) {
                        // Check if a warning message already exists
                        let existingWarning = document.getElementById('warning-message');
                        if (!existingWarning) {
                            const warningMessage = document.createElement('div');
                            warningMessage.id = 'warning-message';
                            warningMessage.style.position = 'fixed';
                            warningMessage.style.top = '100px';
                            warningMessage.style.left = '60%';
                            warningMessage.style.transform = 'translateX(-50%)';
                            warningMessage.style.backgroundColor = '#f8d7da';
                            warningMessage.style.color = '#721c24';
                            warningMessage.style.padding = '10px 20px';
                            warningMessage.style.borderRadius = '5px';
                            warningMessage.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                            warningMessage.style.zIndex = '1000';
                            warningMessage.innerText = "You can only select tests with the same sample type!";

                            document.body.appendChild(warningMessage);

                            setTimeout(() => {
                                warningMessage.remove();
                            }, 3000);
                        }
                        return; // Prevent further execution
                    }


                    if (!selectedTests.has(testName)) {
                        selectedTests.set(testName, sampleType);
                        uniqueSampleTypes.add(sampleType);

                        const selectedTestName = document.createElement('div');
                        selectedTestName.classList.add('selected-div');
                        selectedTestName.innerHTML = `<span>${testName}</span> <i class="fa-regular fa-circle-xmark delete-btn"></i>`;
                        selectedTestName.setAttribute('sample-type', sampleType);

                        testElement.style.display = "none";
                        tagsdivaddpannel.appendChild(selectedTestName);
                    } else {
                        selectedTests.delete(testName);
                        updateSampleTypes();
                        testElement.style.display = "block";

                        // Reset currentSampleType if no tests are selected
                        if (selectedTests.size === 0) {
                            currentSampleType = null;
                        }
                    }
                });
            });

            testInputtype.addEventListener("click", function () {
                testList.style.display = "block";
            });

            document.addEventListener("click", function (e) {
                if (!testInputtype.contains(e.target) && !testList.contains(e.target)) {
                    testList.style.display = "none";
                }
            });
        } catch (error) {
            console.log("something went wrong", error);
        }
    }

    tagsdivaddpannel.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
            const tag = e.target.closest(".selected-div");
            if (tag) {
                const testName = tag.innerText.trim();
                selectedTests.delete(testName);
                updateSampleTypes();

                const testElement = Array.from(testList.children).find(test => test.innerText === testName);
                if (testElement) {
                    testElement.style.display = "";
                }

                tag.remove();

                // Reset currentSampleType if no tests are selected
                if (selectedTests.size === 0) {
                    currentSampleType = null;
                }
            }
        }
    });

    function updateSampleTypes() {
        uniqueSampleTypes.clear();
        selectedTests.forEach((sampleType) => {
            uniqueSampleTypes.add(sampleType);
        });
    }

    async function initialize() {
        await loadTests();
        searchingTest();
    }

    function searchingTest() {
        testInputtype.addEventListener("input", function () {
            const inputValue = this.value.toLowerCase();
            const selectedDivs = document.querySelectorAll('#tests-name-div');
            let found = false;

            selectedDivs.forEach(antest => {
                const testName = antest.innerText.toLowerCase();
                if (testName.includes(inputValue)) {
                    antest.style.display = 'block';
                    found = true;
                } else {
                    antest.style.display = 'none';
                }
            });

            document.getElementById("noTestMessage").style.display = found ? "none" : "";
        });
    }

    initialize();
    addPanneltodatabase();

    function addPanneltodatabase() {
        document.querySelector('.save').addEventListener('click', async function () {
            try {
                const pannelname = document.getElementById("name").value;
                const price = document.getElementById("price").value;
                // const interpretion = tinymce.get('editorContent').getContent();
                const final_price = document.getElementById('final-price').value;
                const category = document.getElementById("category").value;
                const hideInterpretation = document.getElementById('hide-interpretation').checked;
                const hideMethodInstrument = document.getElementById('hide-method-instrument').checked;

                const uniqueInputArray = Array.from(selectedTests.keys());
                const uniqueSampleTypesArray = Array.from(uniqueSampleTypes);

                const response = await fetch(`${BASE_URL}/api/v1/user/add-panels`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ pannelname,final_price, category, price, inputarray: uniqueInputArray, sample_types: uniqueSampleTypesArray, hideInterpretation, hideMethodInstrument })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw data.message;
                }

                alert("test pannel created successfully");

                selectedTests.clear();
                uniqueSampleTypes.clear();
                currentSampleType = null;
                tagsdivaddpannel.innerHTML = '';
                // Reload the page after successful creation
                location.reload();
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }, { once: true });
    }
    document.querySelector('.cancel').addEventListener('click', function () {
        // Navigate back to the previous page
        window.location.href = `${BASE_URL}/superAdmin.html?page=testPanels`;
    });
})();
