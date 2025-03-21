function deleteExpense(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    window.location.href = `/delete-expense/${id}`;
  }
}