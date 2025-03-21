document.addEventListener("DOMContentLoaded", function() {
  const saveExpenseBtn = document.getElementById("saveExpenseBtn");
  const expenseForm = document.getElementById("expenseForm");
  const categorySelect = document.getElementById("category");
  const customCategoryDiv = document.getElementById("customCategoryDiv");
  const customCategoryInput = document.getElementById("customCategory");
  let expenseId = null; // To hold the ID for editing

  // When the category is changed
  categorySelect.addEventListener("change", () => {
    const isOther = categorySelect.value === "Other";
    customCategoryDiv.style.display = isOther ? "block" : "none";
    customCategoryInput.required = isOther;
  });
  
  // Save the expense when the save button is clicked
  saveExpenseBtn.addEventListener("click", () => {
    console.log('Editing expense with ID:', expenseId); // Log the ID of the expense being edited
    expenseForm.submit();
  });
  
  // Handle modal data for Edit and Add
  const modalForm = document.getElementById('modalForm');
  modalForm.addEventListener('show.bs.modal', function (event) {
    // Extract info from data-* attributes
    const button = event.relatedTarget;
    const title = button.getAttribute('data-bs-whatever');
    const recipient = button.getAttribute('data-recipient');
    const description = button.getAttribute('data-description');
    const amount = button.getAttribute('data-amount');
    const category = button.getAttribute('data-category');
    const customCategory = button.getAttribute('data-custom_category');
    const date = button.getAttribute('data-date');
    const id = button.getAttribute('data-id');

    // Set modal title
    const modalTitle = modalForm.querySelector('.modal-title');
    modalTitle.textContent = title; // Dynamically set title (Add Expense or Edit Expense)

    // Populate the form fields if editing
    const form = document.getElementById('expenseForm');
    form.querySelector('#recipient').value = recipient;
    form.querySelector('#description').value = description;
    form.querySelector('#amount').value = amount;
    form.querySelector('#category').value = category;
    form.querySelector('#customCategory').value = customCategory || ''; // For custom category
    form.querySelector('#date').value = date;

    // Store the ID in the hidden field for later use
    form.querySelector('#expenseId').value = id;

    // Set form action for Add or Edit
    const formAction = id ? '/edit-expense' : '/add-expense'; // If ID exists, it's an edit
    expenseForm.setAttribute('action', formAction);

    // If 'Other' category, show the custom category input and populate it with the custom category value
    if (category === 'Other') {
      categorySelect.value = 'Other'; // Set category to 'Other'
      customCategoryDiv.style.display = 'block'; // Show custom category input
      customCategoryInput.value = customCategory || '';  // Show the custom category value
    } else {
      categorySelect.value = category;
      customCategoryDiv.style.display = 'none'; // Hide custom category input
      customCategoryInput.value = '';  // Clear custom category input if not "Other"
    }


  });
});
