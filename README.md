# Quiz Platform Backend

Backend API for the Quiz Platform built using **Node.js**, **Express**, **Sequelize**, and **MySQL**.

---

## 🚀 Features

* User authentication using **JWT**
* Password hashing using **bcrypt**
* Database ORM using **Sequelize**
* MySQL database support
* Email support using **Nodemailer**
* Database migrations and seeders
* Development server with **nodemon**

---

# 📦 Tech Stack

* Node.js
* Express
* MySQL
* Sequelize ORM
* JWT Authentication
* Nodemailer

---

# 📂 Project Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/quiz-platform-backend.git
cd quiz-platform-backend
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Create Environment File

Create a `.env` file in the root folder and add the following variables:

```
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=quiz_platform

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

USER=your_email@example.com
PASSWORD=your_email_password
```

---

# 🗄️ Database Setup

Run migrations to create database tables:

```bash
npm run migrate
```

Seed the database with default data:

```bash
npm run seed
```

Or run both together:

```bash
npm run setup
```

---

# ▶️ Run the Server

### Development Mode

```bash
npm run dev
```

### Normal Mode

```bash
npm start
```

Server will start at:

```
http://localhost:5000
```

---

# 🔁 Reset Database

Undo all migrations and re-run setup:

```bash
npm run reset
```

---

# 📜 Available Scripts

| Script          | Description             |
| --------------- | ----------------------- |
| npm start       | Run server              |
| npm run server  | Run server with nodemon |
| npm run migrate | Run database migrations |
| npm run seed    | Seed database           |
| npm run setup   | Run migrations + seed   |
| npm run dev     | Setup DB and run server |
| npm run reset   | Reset database          |

---

# 📧 Email Configuration

The project uses **Nodemailer** for sending emails.

Add your email credentials in `.env`:

```
USER=your_email@example.com
PASSWORD=your_email_password
```

---

# 👨‍💻 Author

**Vijay Pankaj**

B.Tech CSE
University College of Engineering and Technology, Bikaner

---
