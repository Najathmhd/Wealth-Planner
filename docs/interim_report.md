# AI-Powered Wealth Planning System: Technical Specifications

This document provides a detailed breakdown of the technologies, libraries, file structures, and logic used in the **AI-Powered Wealth Planning System**.

---

## 1. Frontend Architecture
The frontend is built using a modern, high-performance stack centered around React and Next.js.

### Core Stack
- **Framework**: [Next.js (v14.2)](https://nextjs.org/) - Utilizing the App Router for optimized routing and layout persistence.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Ensuring type safety and better developer experience.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid and consistent UI development.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Used for smooth transitions and interactive UI elements.
- **Icons**: [Lucide React](https://lucide.dev/) - A clean and consistent icon library.

### Key Libraries (Package.json)
- **UI Components**: `@radix-ui/react-avatar`, `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-tabs`, etc.
- **Data Visualization**: `recharts` - High-performance charting for financial trends and projections.
- **HTTP Client**: `axios` - For handling API requests to the backend.
- **Utilities**: `class-variance-authority`, `clsx`, `tailwind-merge` for dynamic styling.

### Page-by-Page Breakdown
| Page Name | File Path | Functionality/Logic |
| :--- | :--- | :--- |
| **Landing Page** | `frontend/app/page.tsx` | Introduction, feature highlights, and navigation to login/register. |
| **Login** | `frontend/app/login/page.tsx` | Secure login with Axios-based auth calls and token storage. |
| **Register** | `frontend/app/register/page.tsx` | New account creation with field validation. |
| **Main Dashboard** | `frontend/app/dashboard/page.tsx` | Central hub displaying net worth, savings rate, and financial health summaries. |
| **Financial Planner** | `frontend/app/dashboard/finance/page.tsx` | Form-driven interface for logging income, expenses, and savings goals. |
| **AI Recommendations**| `frontend/app/dashboard/recommendations/page.tsx` | AI-driven insights including asset allocation and retirement roadmap. |
| **Market Analysis** | `frontend/app/dashboard/analytics/page.tsx` | Stock market tracker with ML-based price forecasting. |
| **Risk Assessment** | `frontend/app/risk-profile/page.tsx` | Interactive quiz to calculate user risk appetite (1-10). |

---

## 2. Backend Architecture
The backend is a robust API built with Python, focusing on performance and mathematical calculation accuracy.

### Core Stack
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Asynchronous high-performance API framework.
- **Server**: [Uvicorn](https://www.uvicorn.org/) - ASGI server implementation.
- **Security**: `python-jose` (JWT) and `passlib[bcrypt]` for secure authentication and data protection.

### Key Libraries (Requirements.txt)
- **Data Engineering**: `pandas`, `numpy` for financial modeling.
- **Machine Learning**: `scikit-learn` (Linear Regression), `tensorflow` (Deep Learning capabilities).
- **Financial APIs**: `yfinance` - Fetches real-time stock and market data.
- **Integration**: `motor` (Async MongoDB driver).

---

## 3. Explaining the Logic (Presentation Ready)

If you are explaining this system to an audience, here is how each "Brain" module works in plain English:

### A. The "Risk Calculator" (Risk Assessment Logic)
- **How it works**: The system takes your age, your goal (e.g., "Retirement"), and your comfort with risk (1-10).
- **The Secret Sauce**: If your "time horizon" is short (less than 3 years), the AI automatically lowers your risk score by 2 points. Why? Because short-term investing is risky, so the system protects you by suggesting safer assets like Bonds and Cash.

### B. The "Wealth Roadmap" (Compound Interest Logic)
- **The Math**: It uses the **Compound Interest Formula**: $A = P(1 + r/n)^{nt}$.
- **The Application**: Based on whether you are "Aggressive" (10% return) or "Conservative" (3% return), the system projects your wealth 1, 5, and 10 years into the future. It tells you exactly how much your current savings will grow if you keep your current habits.

### C. The "FIRE" Engine (Financial Independence Logic)
- **The 25x Rule**: The system calculates your "FIRE Number" by multiplying your annual expenses by 25. This is the amount you need to never work again.
- **The Goal**: It runs a simulation (month-by-month) to see how many years it will take for your savings to hit that number. It gives you a "Years to Freedom" countdown.

### D. The "Stock Oracle" (Machine Learning Logic)
- **Model**: It uses **Linear Regression**.
- **Process**: The system looks at the last 6 months of a stock's closing prices. It maps these dates to numbers (ordinal dates) and finds the "line of best fit."
- **Prediction**: It extends that line 7 days into the future to give a baseline forecast of where the price is heading.

---

## 4. Future Advancements (Making it "Pro")

To take this project to the next level, here are the proposed advanced features:

### 1. Advanced ML Models (LSTMs)
- **Current**: Linear Regression (shows basic trends).
- **Advance**: Implement **Long Short-Term Memory (LSTM)** neural networks. Unlike simple lines, LSTMs can remember patterns in data (like market cycles) for much more accurate stock predictions.

### 2. Auto-Syncing (Plaid/Open Banking)
- **Current**: Users manually type in their expenses.
- **Advance**: Integrate the **Plaid API** to automatically pull real-time transaction data from the user's actual bank accounts. No more manual entry.

### 3. Natural Language Financial Advice (LLM Integration)
- **Advance**: Add an **AI Chatbot (using GPT-4 or Gemini)**. Instead of just looking at charts, users could ask: *"Can I afford a $2,000 vacation next month?"* and the AI would analyze their budget and answer instantly.

### 4. Sentiment Analysis (News Mining)
- **Advance**: Use **Natural Language Processing (NLP)** to scan news headlines and Twitter. If there is "panic" in the news about a stock, the system should automatically alert the user to adjust their portfolio.

### 5. Multi-Currency & Global Markets
- **Advance**: Expand support for international stocks and automatic currency conversion (e.g., LKR, USD, EUR) to make the tool useful for global investors.

---

## 5. Directory Structure
```text
/AI-Powered Wealth Planning System
├── /frontend
│   ├── /app                # Next.js App Router (Pages & Layouts)
│   ├── /components         # Reusable UI components
│   └── package.json        # Frontend dependencies
├── /backend
│   ├── /app
│   │   ├── /api            # API Endpoints (Auth, Finance, Stocks)
│   │   ├── /models         # Database schemas
│   │   └── main.py         # Entry point
│   └── requirements.txt    # Backend dependencies
└── interim_report_details.md # This Report
```
