// --- Finance state ---
let income = parseFloat(localStorage.getItem("income")) || 0;
let expenses = parseFloat(localStorage.getItem("expenses")) || 0;
let savings = parseFloat(localStorage.getItem("savings")) || 0;

function updateStorage() {
  localStorage.setItem("income", income);
  localStorage.setItem("expenses", expenses);
  localStorage.setItem("savings", savings);
}

// --- Dashboard updater ---
function updateDashboard() {
  const incomeEl = document.getElementById("income");
  const expensesEl = document.getElementById("expenses");
  const savingsEl = document.getElementById("savings");

  if (incomeEl) incomeEl.textContent = `$${income.toFixed(2)}`;
  if (expensesEl) expensesEl.textContent = `$${expenses.toFixed(2)}`;
  if (savingsEl) savingsEl.textContent = `$${savings.toFixed(2)}`;

  // Doughnut chart
  const chartEl = document.getElementById("financeChart");
  if (chartEl) {
    const ctx = chartEl.getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Income", "Expenses", "Savings"],
        datasets: [{
          data: [income, expenses, savings],
          backgroundColor: ["#27ae60", "#e74c3c", "#3498db"]
        }]
      }
    });
  }

  // Bar chart
  const monthlyChartEl = document.getElementById("monthlyChart");
  if (monthlyChartEl) {
    const ctx = monthlyChartEl.getContext("2d");
   new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Income", "Expenses", "Savings"], // column names
    datasets: [{
      label: "Monthly Report",
      data: [income, expenses, savings],
      backgroundColor: ["#27ae60", "#e74c3c", "#3498db"]
    }]
  },
  options: {
    plugins: {
      legend: {
        display: true, // shows "Monthly Report" in legend
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Categories" // label for X-axis
        },
        ticks: {
          display: true // ensures Income/Expenses/Savings show
        }
      },
      y: {
        title: {
          display: true,
          text: "Amount ($)" // label for Y-axis
        },
        ticks: {
          display: true
        }
      }
    }
  }
});

  }
}

// --- Transactions ---
const transactionList = document.getElementById("transaction-list");
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function renderTransactions(filterType = "all", searchText = "") {
  transactionList.innerHTML = "";

  const filtered = transactions.filter(t => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (filtered.length === 0) {
    transactionList.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">No transactions found</td></tr>`;
    return;
  }

  let runningBalance = 0;
  filtered.forEach(t => {
    runningBalance += t.type === "income" ? t.amount : -t.amount;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td class="${t.type}">${t.type}</td>
      <td class="${t.type}">$${t.amount.toFixed(2)}</td>
      <td>$${runningBalance.toFixed(2)}</td>
    `;
    transactionList.appendChild(row);
  });
}

// --- Form submission ---
document.getElementById("transaction-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (!description || isNaN(amount) || amount <= 0) return;

  const newTransaction = {
    date: new Date().toLocaleDateString(),
    description,
    amount,
    type
  };

  transactions.push(newTransaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Update totals
  if (type === "income") {
    income += amount;
    savings += amount * 0.2; // add 20% of income to savings
  } else {
    expenses += amount;
    savings -= amount * 0.1; // reduce savings by 10% of expense
  }

  updateStorage();
  updateDashboard();
  renderTransactions();
  updateBalance();

  e.target.reset();
});

// --- Filters ---
document.getElementById("filter-type")?.addEventListener("change", e => {
  renderTransactions(e.target.value, document.getElementById("search").value);
});

document.getElementById("search")?.addEventListener("input", e => {
  renderTransactions(document.getElementById("filter-type").value, e.target.value);
});

// --- Initial render ---
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  renderTransactions();
});


