const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const userdata = require('./src/models/form');
const path = require("path");
const hbs = require("hbs");
const Register = require('./src/models/form');
const bcrypt = require('bcrypt');

// const uri = "mongodb+srv://tisha1858be21:tisha123@cluster0.gh5v3n8.mongodb.net/?retryWrites=true&w=majority";
const uri ="mongodb+srv://tisha1858be21:tisha123@cluster0.gh5v3n8.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true // Uncomment if needed
}).then(() => console.log(`Database connected`))
  .catch(() => console.log(`Error connecting to the database`));

const static_path = path.join(__dirname, "./src/models");
const template_path = path.join(__dirname, "./templates/views");
const partials_path = path.join(__dirname, "./templates/partials");

app.use(express.static(static_path));
console.log(path.join(__dirname, "./templates/views"));

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstName,
                lastname: req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                confirmpassword: req.body.confirmPassword,
                phone: req.body.phoneNumber,
                gender: req.body.gender
            });

            const registered = await registerEmployee.save();
            res.status(201).render("login");
        } else {
            res.send("Password does not match");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/views/login.hbs", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const check = await Register.findOne({ email: req.body.username });
        if (!check) {
            res.send("User not found");
        }

        const isPass = await bcrypt.compare(req.body.password, check.password);
        if (isPass) {
            res.render("index");
        } else {
            res.send("Wrong password");
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});
