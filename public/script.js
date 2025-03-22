let chartInstance = null;

// Switch between SIP and Lumpsum mode
function switchMode(mode) {
  const sipPill = document.getElementById('sipPill');
  const lumpsumPill = document.getElementById('lumpsumPill');
  const investmentLabel = document.getElementById('investmentLabel');
  const modeHint = document.getElementById('modeHint');

  if (mode === 'sip') {
    sipPill.classList.add('active');
    lumpsumPill.classList.remove('active');
    investmentLabel.textContent = 'Monthly Investment';
    modeHint.textContent = '(Monthly investment for SIP)';
  } else {
    lumpsumPill.classList.add('active');
    sipPill.classList.remove('active');
    investmentLabel.textContent = 'Lumpsum Amount';
    modeHint.textContent = '(Lumpsum amount)';
  }
  calculate(); // Recalculate when switching modes
}

// Sync slider with number input
function syncSlider(field) {
  const numInput = document.getElementById(field);
  const slider = document.getElementById(field + 'Range');
  slider.value = numInput.value;
  calculate();
}

// Range slider updates numeric input
function updateAmount(val) {
  document.getElementById('amount').value = val;
  calculate();
}
function updateReturn(val) {
  document.getElementById('return').value = val;
  calculate();
}
function updateYears(val) {
  document.getElementById('years').value = val;
  calculate();
}

// Main Calculation
function calculate() {
  // Determine mode
  const sipActive = document.getElementById('sipPill').classList.contains('active');
  const P = parseFloat(document.getElementById('amount').value);
  const annualRate = parseFloat(document.getElementById('return').value);
  const years = parseFloat(document.getElementById('years').value);

  if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || annualRate <= 0 || years <= 0) {
    updateResults(0, 0, 0);
    return;
  }

  let futureValue = 0;
  let invested = 0;

  if (sipActive) {
    // SIP Calculation
    // Effective monthly rate
    const monthlyRate = Math.pow(1 + annualRate / 100, 1/12) - 1;
    const n = years * 12;

    // Beginning-of-month deposit formula
    // FV = P * [((1 + r)^n - 1)/r] * (1 + r)
    futureValue = P * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);

    invested = P * n; // total amount deposited
  } else {
    // Lumpsum Calculation
    // FV = P * (1 + annualRate/100)^years
    futureValue = P * Math.pow(1 + annualRate / 100, years);

    invested = P; // lumpsum is just one deposit
  }

  const totalValue = futureValue;
  const estReturns = totalValue - invested;

  updateResults(invested, estReturns, totalValue);
  updateChart(invested, estReturns);
}

// Update results in the UI
function updateResults(invested, returns, total) {
  document.getElementById('investedAmount').textContent = `₹${formatNumber(invested)}`;
  document.getElementById('estimatedReturns').textContent = `₹${formatNumber(returns)}`;
  document.getElementById('totalValue').textContent = `₹${formatNumber(total)}`;
}

// Initialize / Update Donut Chart
function updateChart(invested, returns) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Invested amount', 'Est. returns'],
      datasets: [{
        data: [invested, returns],
        backgroundColor: ['#4caf50', '#03a9f4']
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Utility: format large numbers with commas
function formatNumber(num) {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// On page load, default to SIP mode
window.onload = () => {
  switchMode('sip');
};
