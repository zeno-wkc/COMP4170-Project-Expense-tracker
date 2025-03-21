import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.static("public")); // For static assets (CSS, JS)
app.use(express.urlencoded({ extended: true })); // To parse the form data

// Connect to the Supabase PostgreSQL database server
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false,},
});

// ✅ Function to Create Table If Not Exists
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        recipient TEXT NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        category TEXT NOT NULL,
        custom_category TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table 'expenses' is ready!");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
};

// Test Database Connection
pool.connect()
  .then(() => {
    console.log("✅ Connected to Supabase PostgreSQL");
    createTable(); // Call to create the table after successful connection
  })
  .catch(err => console.error("❌ Database Connection Error:", err));

// ✅ Route to Get All Expenses and Render Data in EJS
app.get("/", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY id ASC');
    const expenses = result.rows.map(expense => ({
      ...expense,
      amount: Number(expense.amount), // Ensure amount is a number
      date: new Date(expense.date).toISOString().split('T')[0] // Format date as YYYY-MM-DD
    }));

    // Render the data in the index.ejs view
    res.render("index", { expenses: expenses, title: "My Expense Tracker" }); // Passing the expenses data to the EJS template
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to Add Expense (Add)
app.post("/add-expense", async (req, res) => {
  try {
    const { recipient, description, amount, category, custom_category, date } = req.body;

    // Handle category logic
    const finalCategory = category === "Other" ? "Other" : category;
    const finalCustomCategory = category === "Other" ? custom_category : null;

    // Insert the new expense
    await pool.query(
      `INSERT INTO expenses (recipient, description, amount, category, custom_category, date) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [recipient, description, amount, finalCategory, finalCustomCategory, date]
    );

    // Redirect to the main page after success
    res.redirect("/"); 
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).send("Server error");
  }
});

// Route for editing an expense
app.post('/edit-expense', async (req, res) => {
  const { id, recipient, description, amount, category, custom_category, date } = req.body;

  try {
    // Ensure the ID is not empty
    if (!id) {
      return res.status(400).send("Expense ID is required");
    }
    console.log('Editing expense with ID:', id);
    // SQL query to update the record
    const result = await pool.query(
      `UPDATE expenses 
      SET recipient = $1, description = $2, amount = $3, category = $4, custom_category = $5, date = $6
      WHERE id = $7`, 
      [recipient, description, amount, category, custom_category, date, id]
    );

    // Check if the update was successful
    if (result.rowCount === 0) {
      return res.status(404).send("Expense not found");
    }

    // Redirect to the main page (or respond with a success message)
    res.redirect('/');  // Or send a success message back to the client
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to delete an expense by its ID
app.get("/delete-expense/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Query to delete the expense from the database
    await pool.query("DELETE FROM expenses WHERE id = $1", [id]);
    
    // Redirect back to the main page after deletion
    res.redirect("/");
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});