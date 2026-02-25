/**
 * 财富自由计算器核心计算逻辑
 * 基于FIRE（Financial Independence, Retire Early）理论
 * 采用4%法则（4% Withdrawal Rule）作为基准
 */

/**
 * 验证输入数据
 * @param {number} principal - 初始资产
 * @param {number} annualInterestRate - 年化收益率(%)
 * @param {number} stableIncome - 稳定年收入
 * @param {number} annualExpenses - 年消费
 * @param {number} inflationRate - 通胀率(%)
 * @returns {array} 错误列表
 */
function validateInput(principal, annualInterestRate, stableIncome, annualExpenses, inflationRate) {
  let errors = [];

  if (isNaN(principal) || principal < 0 || principal > 999999999) {
    errors.push("❌ 初始资产必须在 0 ~ 999,999,999 之间");
  }

  if (isNaN(annualInterestRate) || annualInterestRate < 0 || annualInterestRate > 100) {
    errors.push("❌ 年化收益率必须在 0 ~ 100% 之间");
  }

  if (isNaN(stableIncome) || stableIncome < 0 || stableIncome > 999999999) {
    errors.push("❌ 稳定年收入必须在 0 ~ 999,999,999 之间");
  }

  if (isNaN(annualExpenses) || annualExpenses <= 0 || annualExpenses > 999999999) {
    errors.push("❌ 年消费必须在 1 ~ 999,999,999 之间");
  }

  if (isNaN(inflationRate) || inflationRate < 0 || inflationRate > 100) {
    errors.push("❌ 通胀率必须在 0 ~ 100% 之间");
  }

  // 检查是否能实现财富自由（年支出 < 年收入+年利息）
  const fireNumber = annualExpenses / 0.04; // 4%法则
  if (principal < fireNumber && stableIncome === 0) {
    console.warn(`⚠️ 提示：当前本金(${formatNumber(principal)})小于FIRE数字(${formatNumber(fireNumber)})，可能无法保证永久退休`);
  }

  return errors;
}

/**
 * 计算财富自由数字 - 使用4%法则
 * FIRE数字 = 年消费 / 4%
 * @param {number} annualExpenses - 年消费
 * @returns {number} 所需本金
 */
function calculateFireNumber(annualExpenses) {
  return annualExpenses / 0.04; // 4% Withdrawal Rate based on Trinity Study
}

/**
 * 计算需要多少年才能达到财富自由
 * 使用复利公式计算
 * @param {number} annualSavings - 年储蓄
 * @param {number} currentAssets - 当前资产
 * @param {number} targetNumber - 目标本金（FIRE数字）
 * @param {number} annualReturn - 年收益率(小数，如0.07表示7%)
 * @returns {number} 需要年数
 */
function calculateYearsToFI(annualSavings, currentAssets, targetNumber, annualReturn) {
  if (annualReturn <= 0) {
    // 无收益情况，直接按年储蓄计算
    if (annualSavings === 0) return Infinity;
    return (targetNumber - currentAssets) / annualSavings;
  }

  // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
  // 使用迭代方法求解
  let years = 0;
  let assets = currentAssets;
  const maxIterations = 200;

  while (assets < targetNumber && years < maxIterations) {
    assets = assets * (1 + annualReturn) + annualSavings;
    years++;
  }

  return years === maxIterations ? Infinity : years;
}

/**
 * 主计算函数 - 生成年度详细数据
 * @param {number} principal - 初始资产
 * @param {number} annualInterestRate - 年化收益率(%)
 * @param {number} stableIncome - 稳定年收入
 * @param {number} annualExpenses - 年消费
 * @param {number} inflationRate - 通胀率(%)
 * @param {number} startYear - 起始年龄
 * @returns {object} {years: array, liveYear: number, fireNumber: number}
 */
function calculateProjection(principal, annualInterestRate, stableIncome, annualExpenses, inflationRate, startYear) {
  const validateErrors = validateInput(principal, annualInterestRate, stableIncome, annualExpenses, inflationRate);
  if (validateErrors.length > 0) {
    throw new Error(validateErrors.join("\n"));
  }

  const yearData = [];
  let currentPrincipal = principal;
  let currentExpenses = annualExpenses;
  let currentIncome = stableIncome;
  let currentAge = startYear;
  const rateDecimal = annualInterestRate / 100;
  const inflationDecimal = inflationRate / 100;
  let liveYear = 0;
  const maxYears = 101; // 计算101年

  for (let year = 0; year < maxYears; year++) {
    // 1. 计算该年利息（基于上年末本金）
    let annualInterest = currentPrincipal * rateDecimal;

    // 2. 处理年消费和利息的小数点精度
    annualInterest = Math.max(annualInterest, 0);

    // 3. 计算年末本金（复利过程）
    // 新本金 = 旧本金 + 利息 + 稳定收入 - 消费
    let endingPrincipal = currentPrincipal + annualInterest + currentIncome - currentExpenses;
    endingPrincipal = Math.max(endingPrincipal, 0); // 防止负数

    // 4. 保存该年数据
    yearData.push({
      year: year,
      age: currentAge + year,
      annualExpenses: Math.round(currentExpenses),
      annualInterest: Math.round(annualInterest),
      endingPrincipal: Math.round(endingPrincipal),
      monthlyExpense: Math.round(currentExpenses / 12)
    });

    // 5. 检查是否破产（本金 <= 0）
    if (endingPrincipal <= 0 && year > 0) {
      liveYear = year;
      break;
    }

    // 6. 下一年的消费考虑通胀
    currentExpenses = currentExpenses * (1 + inflationDecimal);
    currentPrincipal = endingPrincipal;
    liveYear = year; // 更新最后一年
  }

  return {
    years: yearData,
    liveYear: liveYear,
    fireNumber: calculateFireNumber(annualExpenses)
  };
}

/**
 * 数字格式化 - 显示为中文万元单位
 * @param {number} num - 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(num) {
  if (isNaN(num)) return "0";
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + "万";
  }
  return num.toLocaleString("zh-CN");
}

/**
 * 格式化为货币显示
 * @param {number} num - 要格式化的数字
 * @returns {string} 货币格式字符串
 */
function formatCurrency(num) {
  return "¥" + (Math.round(num)).toLocaleString("zh-CN");
}

/**
 * 计算FIRE指数 - 当前资产 / 所需资产
 * @param {number} principal - 当前资产
 * @param {number} fireNumber - FIRE所需资产
 * @returns {number} 百分比 (0-100)
 */
function calculateFireIndex(principal, fireNumber) {
  if (fireNumber === 0) return 0;
  return Math.min(100, Math.round((principal / fireNumber) * 100));
}

/**
 * 本地存储 - 保存表单数据
 */
function saveToLocalStorage(data) {
  localStorage.setItem("fireCalculator", JSON.stringify(data));
}

/**
 * 从本地存储读取表单数据
 */
function loadFromLocalStorage() {
  const data = localStorage.getItem("fireCalculator");
  return data ? JSON.parse(data) : null;
}

/**
 * 清除本地存储
 */
function clearLocalStorage() {
  localStorage.removeItem("fireCalculator");
}
