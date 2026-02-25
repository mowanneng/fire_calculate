/**
 * 财富自由计算器 - UI交互和事件处理
 * 处理表单输入、计算触发、结果展示
 */

let chart = null; // 全局图表引用

// ============ 初始化 ============

/**
 * 页面加载时初始化
 */
document.addEventListener("DOMContentLoaded", function () {
  loadStoredValues();
  updateDisplay();
});

/**
 * 从本地存储恢复保存的值
 */
function loadStoredValues() {
  const saved = loadFromLocalStorage();
  if (saved) {
    document.getElementById("principal").value = saved.principal || 1000000;
    document.getElementById("annualInterestRate").value = saved.annualInterestRate || 7;
    document.getElementById("stableIncome").value = saved.stableIncome || 0;
    document.getElementById("annualExpenses").value = saved.annualExpenses || 500000;
    document.getElementById("inflationRate").value = saved.inflationRate || 2.5;
    document.getElementById("startYear").value = saved.startYear || 30;
  }
}

/**
 * 更新UI中的显示值
 */
function updateDisplay() {
  const principal = parseFloat(document.getElementById("principal").value) || 0;
  const annualExpenses = parseFloat(document.getElementById("annualExpenses").value) || 1;

  // 更新本金显示
  document.getElementById("principalDisplay").textContent =
    "💰 " + formatNumber(principal);

  // 更新月均消费显示
  const monthlyExpense = annualExpenses / 12;
  document.getElementById("monthlyExpensesDisplay").textContent =
    "月均约 " + formatCurrency(monthlyExpense);
}

// ============ 输入事件处理 ============

/**
 * 通用输入处理函数
 */
function handleInput() {
  updateDisplay();
  saveFormData();
}

/**
 * 保存表单数据到本地存储
 */
function saveFormData() {
  const data = {
    principal: parseFloat(document.getElementById("principal").value) || 0,
    annualInterestRate: parseFloat(document.getElementById("annualInterestRate").value) || 7,
    stableIncome: parseFloat(document.getElementById("stableIncome").value) || 0,
    annualExpenses: parseFloat(document.getElementById("annualExpenses").value) || 500000,
    inflationRate: parseFloat(document.getElementById("inflationRate").value) || 2.5,
    startYear: parseFloat(document.getElementById("startYear").value) || 30
  };
  saveToLocalStorage(data);
}

// ============ 增量/减量按钮 ============

function incrementPrincipal() {
  const ele = document.getElementById("principal");
  ele.value = (parseFloat(ele.value) || 0) + 100000;
  handleInput();
}

function decrementPrincipal() {
  const ele = document.getElementById("principal");
  let newVal = (parseFloat(ele.value) || 0) - 100000;
  ele.value = Math.max(0, newVal);
  handleInput();
}

function incrementRate() {
  const ele = document.getElementById("annualInterestRate");
  ele.value = (parseFloat(ele.value) || 0) + 0.5;
  handleInput();
}

function decrementRate() {
  const ele = document.getElementById("annualInterestRate");
  let newVal = (parseFloat(ele.value) || 0) - 0.5;
  ele.value = Math.max(0, newVal);
  handleInput();
}

function incrementIncome() {
  const ele = document.getElementById("stableIncome");
  ele.value = (parseFloat(ele.value) || 0) + 50000;
  handleInput();
}

function decrementIncome() {
  const ele = document.getElementById("stableIncome");
  let newVal = (parseFloat(ele.value) || 0) - 50000;
  ele.value = Math.max(0, newVal);
  handleInput();
}

function incrementExpense() {
  const ele = document.getElementById("annualExpenses");
  ele.value = (parseFloat(ele.value) || 0) + 50000;
  handleInput();
}

function decrementExpense() {
  const ele = document.getElementById("annualExpenses");
  let newVal = (parseFloat(ele.value) || 0) - 50000;
  ele.value = Math.max(1, newVal);
  handleInput();
}

function incrementInflation() {
  const ele = document.getElementById("inflationRate");
  ele.value = (parseFloat(ele.value) || 0) + 0.1;
  handleInput();
}

function decrementInflation() {
  const ele = document.getElementById("inflationRate");
  let newVal = (parseFloat(ele.value) || 0) - 0.1;
  ele.value = Math.max(0, newVal);
  handleInput();
}

// ============ 计算和显示结果 ============

/**
 * 执行计算并显示结果
 */
function calculate() {
  // 获取输入值
  const principal = parseFloat(document.getElementById("principal").value) || 0;
  const annualInterestRate = parseFloat(document.getElementById("annualInterestRate").value) || 7;
  const stableIncome = parseFloat(document.getElementById("stableIncome").value) || 0;
  const annualExpenses = parseFloat(document.getElementById("annualExpenses").value) || 500000;
  const inflationRate = parseFloat(document.getElementById("inflationRate").value) || 2.5;
  const startYear = parseFloat(document.getElementById("startYear").value) || 30;

  // 清除错误消息
  const errorEle = document.getElementById("errorMessage");
  errorEle.style.display = "none";
  errorEle.innerHTML = "";

  try {
    // 执行计算
    const result = calculateProjection(
      principal,
      annualInterestRate,
      stableIncome,
      annualExpenses,
      inflationRate,
      startYear
    );

    // 显示结果
    displayResults(result, startYear);

    // 保存数据
    saveFormData();
  } catch (error) {
    // 显示错误
    errorEle.innerHTML = error.message;
    errorEle.style.display = "block";
    document.getElementById("resultSection").style.display = "none";
    document.getElementById("chartSection").style.display = "none";
  }
}

/**
 * 显示计算结果
 */
function displayResults(result, startYear) {
  const fireNumber = result.fireNumber;
  const liveYear = result.liveYear;
  const years = result.years;

  // 更新页面标题
  const endAge = startYear + liveYear;
  const fireMessage =
    liveYear >= 100
      ? `恭喜！按照当前配置，资金永不枯竭 🎉`
      : `按照当前配置，资金可维持到 ${endAge} 岁（还能活 ${liveYear} 年）`;

  document.getElementById("pageSubtitle").textContent = fireMessage;

  // 计算FIRE指数
  const principal = parseFloat(document.getElementById("principal").value);
  const fireIndex = calculateFireIndex(principal, fireNumber);

  // 填充结果表格
  const tableBody = document.getElementById("resultTable");
  tableBody.innerHTML = "";

  // 只显示前20年或到破产为止
  const displayYears = Math.min(20, years.length);

  for (let i = 0; i < displayYears; i++) {
    const data = years[i];
    const row = document.createElement("tr");

    // 判断是否是最后一年
    const isLastYear = i === liveYear;
    if (isLastYear && data.endingPrincipal <= 0) {
      row.classList.add("table-danger", "fw-bold");
    } else if (i % 2 === 0) {
      row.classList.add("table-light");
    }

    row.innerHTML = `
      <td>${data.age}岁</td>
      <td>${formatCurrency(data.annualExpenses)}</td>
      <td>${formatCurrency(data.annualInterest)}</td>
      <td>${formatCurrency(data.endingPrincipal)}</td>
      <td><button class="btn btn-sm btn-outline-primary" onclick="showDetail(${i})">详情</button></td>
    `;

    row.style.cursor = "pointer";
    tableBody.appendChild(row);
  }

  // 添加"查看更多"按钮
  if (years.length > displayYears) {
    const moreRow = document.createElement("tr");
    moreRow.innerHTML = `
      <td colspan="5" class="text-center">
        <button class="btn btn-outline-secondary btn-sm" onclick="expandTable()">查看更多（共${years.length}年）</button>
      </td>
    `;
    tableBody.appendChild(moreRow);
  }

  // 显示结束信息
  const endMessage = document.getElementById("endMessage");
  const expensesAmount = formatCurrency(years[0].annualExpenses);
  const fireNumberAmount = formatCurrency(fireNumber);

  endMessage.innerHTML = `
    <strong>📊 财务分析结果：</strong><br/>
    • 初始年消费：${expensesAmount}<br/>
    • FIRE数字（4%法则）：${fireNumberAmount}<br/>
    • 财富自由程度：<span class="badge bg-info">${fireIndex}%</span><br/>
    • 计算周期：${years.length}年
  `;

  // 显示表格和图表区域
  document.getElementById("resultSection").style.display = "block";
  document.getElementById("chartSection").style.display = "block";

  // 绘制图表
  drawChart(years);
}

/**
 * 显示详细信息
 */
function showDetail(yearIndex) {
  const result = years[yearIndex];
  if (!result) return;

  const detail = `
    <h6>第 ${yearIndex + 1} 年（年龄 ${result.age} 岁）详细计算：</h6>
    <div class="row">
      <div class="col-md-6">
        <p><strong>收入方面：</strong></p>
        <ul>
          <li>投资利息：${formatCurrency(result.annualInterest)}</li>
          <li>稳定收入：${formatCurrency(stableIncome || 0)}</li>
        </ul>
      </div>
      <div class="col-md-6">
        <p><strong>支出方面：</strong></p>
        <ul>
          <li>年度消费：${formatCurrency(result.annualExpenses)}</li>
          <li>月均消费：${formatCurrency(result.monthlyExpense)}</li>
        </ul>
      </div>
    </div>
    <p><strong>本金变化：</strong> ${formatCurrency(result.endingPrincipal)}</p>
  `;

  document.getElementById("detailContent").innerHTML = detail;
  document.getElementById("detailPanel").style.display = "block";
}

/**
 * 扩展表格显示所有年份
 */
function expandTable() {
  const tableBody = document.getElementById("resultTable");
  const startIndex = 20;

  // 这里可以实现分页或虚拟滚动
  // 目前简单实现：追加更多行
  console.log("展开表格功能");
}

/**
 * 绘制图表
 */
function drawChart(yearData) {
  const ctx = document.getElementById("fireChart");
  if (!ctx) return;

  // 准备数据
  const ages = yearData.map(d => d.age);
  const expenses = yearData.map(d => d.annualExpenses);
  const interests = yearData.map(d => d.annualInterest);
  const principals = yearData.map(d => d.endingPrincipal);

  // 销毁旧图表
  if (chart) {
    chart.destroy();
  }

  // 创建新图表
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ages,
      datasets: [
        {
          label: "年消费支出",
          data: expenses,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.05)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: "年投资利息",
          data: interests,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.05)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: "年末本金",
          data: principals,
          borderColor: "#198754",
          backgroundColor: "rgba(25, 135, 84, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += formatCurrency(context.parsed.y);
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "年龄"
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "金额（元）"
          },
          ticks: {
            callback: function (value) {
              return formatNumber(value);
            }
          }
        }
      }
    }
  });
}

// ============ 表单操作 ============

/**
 * 重置表单到默认值
 */
function resetForm() {
  document.getElementById("principal").value = 1000000;
  document.getElementById("annualInterestRate").value = 7;
  document.getElementById("stableIncome").value = 0;
  document.getElementById("annualExpenses").value = 500000;
  document.getElementById("inflationRate").value = 2.5;
  document.getElementById("startYear").value = 30;

  document.getElementById("resultSection").style.display = "none";
  document.getElementById("chartSection").style.display = "none";
  document.getElementById("detailPanel").style.display = "none";

  updateDisplay();
  clearLocalStorage();
}

/**
 * 加载示例数据
 */
function loadExample() {
  // 示例1：普通上班族 - 中等收入、中等支出
  document.getElementById("principal").value = 500000; // 50万
  document.getElementById("annualInterestRate").value = 7; // 7%
  document.getElementById("stableIncome").value = 0;
  document.getElementById("annualExpenses").value = 400000; // 年支出40万
  document.getElementById("inflationRate").value = 2.5;
  document.getElementById("startYear").value = 28;

  updateDisplay();
  saveFormData();

  // 自动执行计算
  setTimeout(calculate, 100);
}
