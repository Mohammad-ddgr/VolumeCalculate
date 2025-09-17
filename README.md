# Forex Risk Management Calculator

A web-based calculator for forex traders to calculate position sizes based on risk management principles.

## Features

- Calculate lot size based on:
  - Account balance
  - Risk percentage
  - Entry price
  - Stop loss price
- Support for multiple instruments:
  - 28 major forex pairs
  - Gold (XAUUSD)
  - Dow Jones (US30)
  - NASDAQ (USTECH)
- Automatic pip value calculations
- Take profit multiplier (1-10x)
- Mobile-friendly interface
- No account required

## How to Use

1. Select your trading instrument (currency pair, gold, or index)
2. Enter your:
   - Entry price
   - Stop loss price
   - Account balance
   - Risk percentage (how much you're willing to risk)
3. Optionally set a take profit multiplier (1-10x)
4. Click "Calculate" to see:
   - Recommended lot size
   - Amount risked
   - Pip distance
   - Potential loss
   - Potential profit (if take profit is set)

## Example

- Entry: 1.0820
- Stop Loss: 1.0770
- Account Balance: 5000
- Risk: 1%
- Result: Calculator will show appropriate lot size to risk exactly 1% ($50) of your account

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Mobile-first responsive design

## Live Demo

Try it here: [Forex Risk Calculator](https://mohammad-ddgr.github.io/VolumeCalculate/)

## Notes

- This is a client-side calculator for educational/demo purposes
- Always validate calculations with your broker
- Pip values are approximations and may vary slightly depending on your broker