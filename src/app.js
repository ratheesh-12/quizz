const express = require("express");
const adminRoutes = require("./routes/adminRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const quizRoutes = require("./routes/quizRoutes.js");
const questionRoutes = require("./routes/questionRoutes.js");
const userAnswerRoutes = require("./routes/userAnswerRoutes.js");
const userResultRoutes = require("./routes/userResultRoutes.js");

const app = express();

app.use(express.json());
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/user-answers", userAnswerRoutes);
app.use("/api/results", userResultRoutes);

module.exports = app;
