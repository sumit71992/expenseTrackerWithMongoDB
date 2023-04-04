const Razorpay = import("razorpay");
const pagination = document.getElementById('pagination');
let amount = document.querySelector("#expense_input");
let desc = document.getElementById("description_input");
let cat = document.getElementById("category_input");
let btn = document.getElementById("add");
const token = localStorage.getItem("token");
let tbody = document.querySelector(".tbody");
//Add Expense
btn.addEventListener("click", async (e) => {
  try {
    e.preventDefault();
    let obj = {
      amount: amount.value,
      description: desc.value,
      category: cat.value,
    };
    if (!desc.title) {
      const expense = await axios.post(
        "http://localhost:3000/expense/addexpense",
        obj,
        {
          headers: { Authorization: token },
        }
      );
      await location.reload();
    }
  } catch (err) {
    console.log(err);
  }
});
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const page = 1;
    const token = localStorage.getItem("token");
    const ltd = localStorage.getItem("row") || 10;
    if (token) {
      const response = await axios.get(
        `http://localhost:3000/expense/expenses?page=${page}=${ltd}`,
        {
          headers: { Authorization: token },
        }
      );
      console.log(response);
      fetchExpenses(response);
      showPagination(response);
    } else {
      location.replace("./signin.html");
    }
  } catch (err) {
    console.log(err);
  }
});
//pagination

const showPagination = async (response) => {
  pagination.innerHTML = "";
  if (response.data.hasPreviousPage) {
    const btn = document.createElement("button");
    btn.className = "m-1"
    btn.innerHTML = response.data.previousPage;
    await btn.addEventListener("click", () => {
      getExpense(response.data.previousPage)
    });
    pagination.appendChild(btn);
  }
  const btn1 = document.createElement("button");
  btn1.className = "m-1"
  btn1.innerHTML = `<h3>${response.data.currentPage}</h3>`;
  await btn1.addEventListener("click", () => {
    getExpense(response.data.currentPage)
  });
  pagination.appendChild(btn1);
  if (response.data.hasNextPage) {
    const btn2 = document.createElement("button");
    btn2.className = "m-1"
    btn2.innerHTML = response.data.nextPage;
    btn2.addEventListener("click", async () => {
      await getExpense(response.data.nextPage);
    });
    pagination.appendChild(btn2);
  }
};
const getExpense = async (page) => {
  const ltd = localStorage.getItem("row");
  const expense = await axios.get(`http://localhost:3000/expense?page=${page}=${ltd}`, { headers: { Authorization: token }, });
  await showPagination(expense);
  await fetchExpenses(expense);
};
const fetchExpenses = (response) => {
  let expense = response.data.expenses;
  let premium = document.querySelector(".premium");
  let logout = document.createElement("button");
  logout.className = "btn leaderboard text-white logout";
  logout.appendChild(document.createTextNode("Logout"));

  if (response.data.isPremium === true) {
    let span = document.createElement("span");
    let report = document.createElement("a");
    report.setAttribute("href", "./report.html");
    report.className = "btn report text-white";
    report.appendChild(document.createTextNode("Report"));
    premium.appendChild(report);
    let btn = document.createElement("button");
    btn.className = "btn leaderboard text-white";
    btn.appendChild(document.createTextNode("Leaderboard"));
    premium.appendChild(btn);
    span.appendChild(document.createTextNode("You are a Premium Member"));
    premium.appendChild(span);
  } else {
    let btn = document.createElement("button");
    btn.className = "btn p-1 buy_premium";
    btn.appendChild(document.createTextNode("Buy Premium"));
    premium.appendChild(btn);
  }
  premium.appendChild(logout);
  for (let i = 0; i < expense.length; i++) {
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    let td = document.createElement("td");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");
    let btn = document.createElement("button");
    th.setAttribute("scope", "row");
    th.appendChild(document.createTextNode(i + 1));
    tr.appendChild(th);
    td.appendChild(document.createTextNode(expense[i].amount));
    tr.appendChild(td);
    td1.appendChild(document.createTextNode(expense[i].description));
    tr.appendChild(td1);
    td2.appendChild(document.createTextNode(expense[i].category));
    tr.appendChild(td2);
    btn.appendChild(document.createTextNode("Delete"));
    btn.className = "btn btn-secondary p-0 del";
    btn.setAttribute("id", expense[i].id);
    td3.classList = "del";
    td3.appendChild(btn);
    tr.appendChild(td3);
    tbody.appendChild(tr);
  }
};

//Delete Expense
tbody.addEventListener("click", async (e) => {
  try {
    if (e.target.classList.contains("del")) {
      const deletedExpense = await axios.delete(
        "http://localhost:3000/expense/" + e.target.id,
        {
          headers: { Authorization: token },
        }
      );
      await e.target.parentElement.parentElement.remove();
      await location.reload();
    }
  } catch (err) {
    console.log(err);
  }
});

//buy premium
const premium = document.querySelector(".nav");
premium.addEventListener("click", async (e) => {
  if (e.target.classList.contains("buy_premium")) {
    const response = await axios.get("http://localhost:3000/order/buypremium", {
      headers: { Authorization: token },
    });
    console.log("response", response);
    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        await axios.post(
          "http://localhost:3000/order/updatestatus",
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          { headers: { Authorization: token } }
        );
        alert("You are a Premium member now");
        location.reload();
      },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on("payment.failed", function (response) {
      console.log(response.error.reason, response.error.metadata.order_id);
      axios.post(
        "http://localhost:3000/order/updatestatus",
        {
          order_id: response.error.metadata.order_id,
          payment_id: response.error.metadata.payment_id,
          reason: response.error.reason,
        },
        { headers: { Authorization: token } }
      );
      alert("Something went Wrong");
    });
  }
});

//leaderboard
const leaderboard = document.querySelector(".nav");
leaderboard.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("leaderboard")) {
    axios
      .get("http://localhost:3000/expense/leaderboard", {
        headers: { Authorization: token },
      })
      .then((res) => {
        console.log(res);
        let data = res.data.userLeaderboard;
        const ldata = document.querySelector(".ldata");
        ldata.className = "mt-5 p-3 border-top border-secondary";
        const table = document.querySelector(".leaderboard-table");
        const h3 = document.createElement("h3");
        h3.className = "text-center text-secondary";
        h3.appendChild(document.createTextNode("Expense Leaderboard"));
        ldata.appendChild(h3);
        const thead = document.createElement("thead");
        const headtr = document.createElement("tr");
        const sn = document.createElement("th");
        sn.setAttribute("scope", "col");
        sn.appendChild(document.createTextNode("S/N."));
        headtr.appendChild(sn);
        const name = document.createElement("th");
        name.setAttribute("scope", "col");
        name.appendChild(document.createTextNode("Name"));
        headtr.appendChild(name);
        const expense = document.createElement("th");
        expense.setAttribute("scope", "col");
        expense.appendChild(document.createTextNode("Expenses"));
        headtr.appendChild(expense);
        thead.appendChild(headtr);
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        for (let i = 0; i < data.length; i++) {
          let tr = document.createElement("tr");
          let th = document.createElement("th");
          let td = document.createElement("td");
          let td1 = document.createElement("td");
          th.setAttribute("scope", "row");
          th.appendChild(document.createTextNode(i + 1));
          tr.appendChild(th);
          td.appendChild(document.createTextNode(data[i].name));
          tr.appendChild(td);
          td1.appendChild(document.createTextNode(data[i].totalExpenses || 0));
          tr.appendChild(td1);
          tbody.appendChild(tr);
        }
      })
      .catch((err) => console.log(err));
  }
});
//report
const expenseTable = document.querySelector(".tableExpense");
leaderboard.addEventListener("click", async (e) => {
  try {
    if (e.target.classList.contains("report")) {
      document.querySelector("#pagination").style.display = "none";
      document.querySelector(".rowSelection").style.display = "none";
      document.querySelector("#download").style.display = "block";


      expenseTable.style.display = "none";
      const div = document.querySelector(".report-table");
      //Daily table
      const dayTable = document.createElement("table");
      dayTable.className = "table table-hover text-secondary";
      const theadDay = document.createElement("thead");
      const trDay = document.createElement("tr");
      trDay.className = "bg-success text-white";
      const tbodyDay = document.createElement("tbody");

      const dat = document.createElement("th");
      dat.setAttribute("scope", "col");
      dat.appendChild(document.createTextNode("Date"));
      trDay.appendChild(dat);

      const description = document.createElement("th");
      description.setAttribute("scope", "col");
      description.appendChild(document.createTextNode("Description"));
      trDay.appendChild(description);

      const category = document.createElement("th");
      category.setAttribute("scope", "col");
      category.appendChild(document.createTextNode("Category"));
      trDay.appendChild(category);

      const expense = document.createElement("th");
      expense.setAttribute("scope", "col");
      expense.appendChild(document.createTextNode("expense"));
      trDay.appendChild(expense);

      const income = document.createElement("th");
      income.setAttribute("scope", "col");
      income.appendChild(document.createTextNode("Income"));
      trDay.appendChild(income);
      theadDay.appendChild(trDay);
      dayTable.appendChild(theadDay);

      dayTable.appendChild(tbodyDay);
      div.appendChild(dayTable);
      //Yearly Table
      const yearlyTable = document.createElement("table");
      yearlyTable.className = "table table-hover text-secondary";
      const theadYearly = document.createElement("thead");
      const trYearly = document.createElement("tr");
      trYearly.className = "bg-success text-white";
      const tbodyYearly = document.createElement("tbody");

      const month = document.createElement("th");
      month.setAttribute("scope", "col");
      month.appendChild(document.createTextNode("Month"));
      trYearly.appendChild(month);

      const inc = document.createElement("th");
      inc.setAttribute("scope", "col");
      inc.appendChild(document.createTextNode("Expense"));
      trYearly.appendChild(inc);

      const exp = document.createElement("th");
      exp.setAttribute("scope", "col");
      exp.appendChild(document.createTextNode("Income"));
      trYearly.appendChild(exp);

      const savings = document.createElement("th");
      savings.setAttribute("scope", "col");
      savings.appendChild(document.createTextNode("Savings"));
      trYearly.appendChild(savings);
      theadYearly.appendChild(trYearly);

      yearlyTable.appendChild(theadYearly);
      yearlyTable.appendChild(tbodyYearly);
      div.appendChild(yearlyTable);
      //Notes Table
      const notesTable = document.createElement("table");
      notesTable.className = "table table-hover text-secondary";
      const theadNotes = document.createElement("thead");
      theadNotes.className = "table table-hover text-secondary";
      const trNotes = document.createElement("tr");
      trNotes.className = "bg-success text-white";
      const tbodyNotes = document.createElement("tbody");

      const dateNotes = document.createElement("th");
      dateNotes.className = "w-25";
      dateNotes.setAttribute("scope", "col");
      dateNotes.appendChild(document.createTextNode("Date"));
      trNotes.appendChild(dateNotes);

      const notes = document.createElement("th");
      notes.setAttribute("scope", "col");
      notes.appendChild(document.createTextNode("Notes"));
      trNotes.appendChild(notes);
      theadNotes.appendChild(trNotes);

      let tr2 = document.createElement("tr");
      let th2 = document.createElement("th");
      let td7 = document.createElement("td");
      th2.setAttribute("scope", "row");
      th2.appendChild(document.createTextNode("Total"));
      tr2.appendChild(th2);
      td7.appendChild(document.createTextNode(60));
      td7.className = "text-success";
      tr2.appendChild(td7);
      tbodyNotes.appendChild(tr2);
      div.appendChild(notesTable);

      const token = localStorage.getItem("token");
      const data = await axios.get("http://3.109.42.131:3000/user/reports", {
        headers: { Authorization: token },
      });
      const report = data.data.report;
      let date = new Date();
      let currDay = date.getDate();
      let currMonth = date.getMonth() + 1;
      let currYear = date.getFullYear();
      let amount = [
        { jan: 0 },
        { feb: 0 },
        { mar: 0 },
        { apr: 0 },
        { may: 0 },
        { jun: 0 },
        { jul: 0 },
        { aug: 0 },
        { sep: 0 },
        { oct: 0 },
        { nov: 0 },
        { dec: 0 },
      ];
      for (let i = 0; i < report.length; i++) {
        let str = report[i].updatedAt.split("T");
        let time = str[0].split("-");
        let year = time[0];
        let month = time[1];
        let day = time[2];
        let nextstr = report[i + 1] ? report[i + 1].updatedAt.split("T") : null;
        let nexttime = nextstr ? nextstr[0].split("-") : null;
        let nextyear = nexttime ? nexttime[0] : null;
        let nextmonth = nexttime ? nexttime[1] : null;
        let nextday = nexttime ? nexttime[2] : null;

        //day expense
        if (year == currYear && month == currMonth) {
          let tr = document.createElement("tr");
          let th = document.createElement("th");
          let td = document.createElement("td");
          let td1 = document.createElement("td");
          let td2 = document.createElement("td");
          let td3 = document.createElement("td");
          th.setAttribute("scope", "row");
          th.appendChild(
            document.createTextNode(day + "-" + month + "-" + year)
          );
          tr.appendChild(th);
          td.appendChild(document.createTextNode(report[i].description));
          tr.appendChild(td);
          td1.appendChild(document.createTextNode(report[i].category));
          tr.appendChild(td1);
          td2.appendChild(document.createTextNode(report[i].amount));
          tr.appendChild(td2);
          td3.appendChild(document.createTextNode(0));
          tr.appendChild(td3);
          tbodyDay.appendChild(tr);
          if (nextday) {
            if (day !== nextday) {
              let trs = document.createElement("tr");
              trs.classList = "bg-success opacity-25";
              let ths = document.createElement("th");
              let tds = document.createElement("td");
              let td1s = document.createElement("td");
              let td2s = document.createElement("td");
              let td3s = document.createElement("td");
              ths.setAttribute("scope", "row");
              ths.appendChild(document.createTextNode(" "));
              trs.appendChild(ths);
              tds.appendChild(document.createTextNode(""));
              trs.appendChild(tds);
              td1s.appendChild(document.createTextNode(""));
              trs.appendChild(td1s);
              td2s.appendChild(document.createTextNode(""));
              trs.appendChild(td2s);
              td3s.appendChild(document.createTextNode("0"));
              trs.appendChild(td3s);
              tbodyDay.appendChild(trs);
            }
          }
        }
        //yearly
        if (currYear == year && month == 01) {
          amount[0].jan += report[i].amount;
        }
        if (currYear == year && month == 02) {
          amount[1].feb += report[i].amount;
        }
        if (currYear == year && month == 03) {
          amount[2].mar += report[i].amount;
        }

        if (currYear == year && month == 04) {
          amount[3].apr += report[i].amount;
        }
        if (currYear == year && month == 05) {
          amount[4].may += report[i].amount;
        }
        if (currYear == year && month == 06) {
          amount[5].jun += report[i].amount;
        }
        if (currYear == year && month == 07) {
          amount[6].jul += report[i].amount;
        }
        if (currYear == year && month == 08) {
          amount[7].aug += report[i].amount;
        }
        if (currYear == year && month == 09) {
          amount[8].sep += report[i].amount;
        }
        if (currYear == year && month == 10) {
          amount[9].oct += report[i].amount;
        }
        if (currYear == year && month == 11) {
          amount[10].nov += report[i].amount;
        }
        if (currYear == year && month == 12) {
          amount[11].dec += report[i].amount;
        }
      }
      if (amount[0].jan != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("January"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[0].jan));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[0].jan));
        if (totalIncome - amount[0].jan < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }

        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[1].feb != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("February"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[1].feb));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[1].feb));
        if (totalIncome - amount[1].feb < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[2].mar != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("March"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[2].mar));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[2].mar));
        if (totalIncome - amount[2].mar < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[3].apr != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("April"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[3].apr));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[3].apr));
        if (totalIncome - amount[3].apr < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[4].may != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("May"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[4].may));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[4].may));
        if (totalIncome - amount[4].may < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[5].jun != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("June"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[5].jun));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[5].jun));
        if (totalIncome - amount[5].jun < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[6].jul != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("July"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[6].jul));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[6].jul));
        if (totalIncome - amount[6].jul < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[7].aug != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("August"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[7].aug));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[7].aug));
        if (totalIncome - amount[7].aug < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[8].sep != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("September"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[8].sep));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[8].sep));
        if (totalIncome - amount[8].sep < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[9].oct != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("October"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[9].oct));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[9].oct));
        if (totalIncome - amount[9].oct < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[10].nov != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("November"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[10].nov));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[10].nov));
        if (totalIncome - amount[10].nov < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      if (amount[11].dec != 0) {
        let totalIncome = 0;
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        th1.setAttribute("scope", "row");
        th1.appendChild(document.createTextNode("December"));
        tr1.appendChild(th1);
        td4.appendChild(document.createTextNode(amount[11].dec));
        td4.className = "text-danger";
        tr1.appendChild(td4);
        td5.appendChild(document.createTextNode(totalIncome));
        td5.className = "text-success";
        tr1.appendChild(td5);
        td6.appendChild(document.createTextNode(totalIncome - amount[11].dec));
        if (totalIncome - amount[11].dec < 0) {
          td6.className = "text-danger";
        } else {
          td6.className = "text-success";
        }
        tr1.appendChild(td6);
        tbodyYearly.appendChild(tr1);
      }
      let tr1 = document.createElement("tr");
      let th1 = document.createElement("th");
      let td4 = document.createElement("td");
      let td5 = document.createElement("td");
      let td6 = document.createElement("td");
      let totalExpense = 0;
      let totalIncome = 0;
      for (let a of amount) {
        totalExpense += Number(Object.values(a));
      }
      th1.setAttribute("scope", "row");
      th1.appendChild(document.createTextNode("Total"));
      tr1.appendChild(th1);
      td4.appendChild(document.createTextNode(totalExpense));
      td4.className = "text-danger";
      tr1.appendChild(td4);
      td5.appendChild(document.createTextNode(totalIncome));
      td5.className = "text-success";
      tr1.appendChild(td5);
      td6.appendChild(document.createTextNode(totalIncome - totalExpense));
      if (totalIncome - totalExpense >= 0) {
        td6.className = "text-success";
      } else {
        td6.className = "text-danger";
      }

      tr1.appendChild(td6);
      tbodyYearly.appendChild(tr1);
    }
  } catch (err) {
    console.log(err);
  }
});
//Logout
const signout = document.querySelector(".nav");
signout.addEventListener("click", async (e) => {
  e.preventDefault();
  if (e.target.classList.contains("logout")) {
    await localStorage.removeItem("token");
    await location.replace("./signin.html");
  }
});
//row
const setRow = () => {
  let row = document.getElementById('rowOptions').value;
  localStorage.setItem("row", row);
}
//download
document.querySelector(".download").addEventListener("click", async (e) => {
  try {
    e.preventDefault();
    const downloadData = await axios.get("http://localhost:3000/user/download", { headers: { 'Authorization': token } });
    var a = document.createElement("a");
    a.href = downloadData.data.fileURL;
    a.download = 'myexpenses.csv';
    a.click();
  } catch (err) {
    console.log(err);
  }
})