// Helper: format with up to 6 decimals but trim trailing zeros
function fmt(n, decimals=6){
  if (!isFinite(n)) return '—';
  let s = Number(n).toFixed(decimals);
  s = s.replace(/\.0+$/,'');
  s = s.replace(/(\.\d*?)0+$/,'$1');
  return s;
}

// Pip value approximations (USD quote pairs) — returns pip value for 1 lot (100,000 units)
const pipValuesPerLot = {
  // Major Pairs (USD)
  'EURUSD': 10,
  'GBPUSD': 10,
  'AUDUSD': 10,
  'NZDUSD': 10,
  'USDCHF': 10,
  'USDCAD': 10,
  'USDJPY': 9.1,

  // Euro Crosses
  'EURGBP': 13.5,
  'EURJPY': 11.2,
  'EURCHF': 11.2,
  'EURAUD': 11.2,
  'EURCAD': 11.2,
  'EURNZD': 11.2,

  // GBP Crosses
  'GBPJPY': 12.5,
  'GBPCHF': 12.5,
  'GBPAUD': 12.5,
  'GBPCAD': 12.5,
  'GBPNZD': 12.5,

  // Other Crosses
  'AUDCHF': 10,
  'AUDCAD': 10,
  'AUDJPY': 9.1,
  'AUDNZD': 10,
  'CADJPY': 9.1,
  'CADCHF': 10,
  'CHFJPY': 9.1,
  'NZDJPY': 9.1,
  'NZDCHF': 10,
  'NZDCAD': 10,

  // Commodities & Indices
  'XAUUSD': 10,    // Gold: $1 per 0.01 movement per mini lot (0.1)
  'US30': 5,       // Dow Jones: $5 per point per mini lot (0.1)
  'USTECH': 5      // NASDAQ: $5 per point per mini lot (0.1)
};

// Determine pip size for a pair (0.0001 for most, 0.01 for JPY pairs)
function pipSize(pair){
  // Special cases for different instruments
  if (pair === 'XAUUSD') return 1.0;     // Gold uses 1.0 as point size
  if (pair === 'US30') return 1.0;       // Dow Jones uses 1.0 point
  if (pair === 'USTECH') return 1.0;     // NASDAQ uses 1.0 point
  
  // Standard forex pairs
  return pair.endsWith('JPY') ? 0.01 : 0.0001;
}

// Main compute function
function compute(){
  const pair = document.getElementById('pair').value;
  const entry = parseFloat(document.getElementById('entry').value);
  const stop = parseFloat(document.getElementById('stop').value);
  const balance = parseFloat(document.getElementById('balance').value);
  const riskPct = parseFloat(document.getElementById('riskPct').value);
  const tp = parseFloat(document.getElementById('tp').value);
  
  // Determine if this is a special instrument
  const isSpecialInstrument = ['XAUUSD', 'US30', 'USTECH'].includes(pair);

  // validation
  if (!isFinite(entry) || !isFinite(stop) || !isFinite(balance) || !isFinite(riskPct)){
    alert('Please fill Entry, Stop, Balance and Risk %');
    return;
  }
  if (balance <= 0 || riskPct <= 0){ alert('Balance and Risk % must be positive'); return; }
  if (entry === stop){ alert('Entry and Stop cannot be equal'); return; }

  const isBuy = entry < stop ? false : true;
  const pipSz = pipSize(pair);
  // Calculate distance differently for special instruments vs forex
  let pipDistance;
  if (isSpecialInstrument) {
    const pointDistance = Math.abs(entry - stop);
    if (pair === 'XAUUSD') {
      // For gold, multiply by 10 to show correct pip count (e.g., $5 movement = 50 pips)
      pipDistance = pointDistance * 10;
    } else if (pair === 'US30' || pair === 'USTECH') {
      // For indices, multiply by 10 to show correct pip count (e.g., 5 points = 50 pips)
      pipDistance = pointDistance * 10;
    }
  } else {
    // Standard forex pairs
    pipDistance = Math.abs((entry - stop) / pipSz);
  }

  // risk capital in account currency
  const riskCapital = balance * (riskPct / 100);

  // pip value per 1 lot (standard lot) — fallback to 10 if unknown
  const pipValue1Lot = pipValuesPerLot[pair] || 10;

  // Calculate lot size differently for special instruments
  let lot;
  if (isSpecialInstrument) {
    // For special instruments (Gold, Indices), adjust the calculation
    if (pair === 'XAUUSD') {
      lot = (riskCapital) / ((pipDistance / 10) * 100); // Gold: $100 per point for 1.0 lot, adjust for pip display
    } else if (pair === 'US30' || pair === 'USTECH') {
      lot = (riskCapital) / ((pipDistance / 10) * 50); // Indices: $50 per point for 1.0 lot, adjust for pip display
    }
  } else {
    // Standard forex pairs calculation
    lot = riskCapital / (pipDistance * pipValue1Lot);
  }

  // potential loss = pipDistance * pipValue1Lot * lot
  const potentialLoss = pipDistance * pipValue1Lot * lot;

  // Calculate take profit based on pip distance multiplier
  let potentialProfit = null;
  let takeProfitPrice = null;
  if (isFinite(tp) && tp >= 1 && tp <= 10) {
    const multipliedPipDistance = pipDistance * tp;
    // If stop loss > entry (selling), subtract from entry
    // If stop loss < entry (buying), add to entry
    takeProfitPrice = entry < stop ? 
      entry - (multipliedPipDistance * pipSz) : 
      entry + (multipliedPipDistance * pipSz);
    
    potentialProfit = multipliedPipDistance * pipValue1Lot * lot;
  }

  // update UI
  document.getElementById('lot').textContent = Number(lot).toFixed(2) + ' lots';
  document.getElementById('riskAmt').textContent = fmt(riskCapital,2) + ' $';
  document.getElementById('pipDist').textContent = fmt(pipDistance,2) + ' pips';
  document.getElementById('potLoss').textContent = '$ ' + fmt(potentialLoss,2);
  document.getElementById('potProfit').textContent = potentialProfit === null ? '—' : 
    `${fmt(potentialProfit,2)} (TP price: ${fmt(takeProfitPrice,5)})`;
}

document.getElementById('calcBtn').addEventListener('click', compute);
document.getElementById('resetBtn').addEventListener('click', ()=>{
  document.getElementById('calcForm').reset();
  ['lot','riskAmt','pipDist','potLoss','potProfit'].forEach(id=>document.getElementById(id).textContent='—');
});

document.getElementById('copyBtn').addEventListener('click', ()=>{
  const text = `Lot: ${document.getElementById('lot').textContent}\nRisked: ${document.getElementById('riskAmt').textContent}\nPips: ${document.getElementById('pipDist').textContent}`;
  navigator.clipboard && navigator.clipboard.writeText(text).then(()=>{
    alert('Result copied to clipboard');
  }, ()=>{ alert('Copy failed — please copy manually'); });
});

function setRisk(x){ document.getElementById('riskPct').value = x; }
