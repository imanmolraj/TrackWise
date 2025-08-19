# TrackWise


# 📊 TrackWise — Personal Finance Dashboard

TrackWise is a **full-stack finance tracking application** built with **React + Vite (frontend)** and **Flask + SQLite (backend)**.  
It helps users **track expenses, manage budgets, visualize spending trends, and stay in control of their finances.**

---

## 🚀 Features

✅ **User Authentication**  
- Register / Login securely with hashed passwords (JWT-based authentication).  

✅ **Expense Tracking**  
- Add daily expenses with category, description, and amount.  
- View recent transactions.  

✅ **Budget Management**  
- Set monthly budgets by category.  
- Visual warnings when spending exceeds budget.  

✅ **Data Visualization**  
- **Pie Chart** for spending by category.  
- **6-Month Trend Line Chart** with gradient fill.  
- Budget vs Actual progress bars.  

✅ **Dashboard Overview**  
- Monthly total spending.  
- Top spending category.  
- Active budgets and recent activity.  

✅ **Responsive Design**  
- Modern UI built with TailwindCSS.  
- Works on desktop and mobile.  

---

## 🛠️ Tech Stack

**Frontend:**  
- React (Vite)  
- TailwindCSS  
- Chart.js + react-chartjs-2  

**Backend:**  
- Flask  
- SQLite (via SQLAlchemy)  
- JWT (Flask-JWT-Extended)  
- Passlib (for password hashing)  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/trackwise.git
cd trackwise
