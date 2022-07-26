const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/dietDB", { useNewUrlParser: true });

const foodItemSchema = new mongoose.Schema({
  Name: String,
  Calories: Number,
  Protein: Number,
  Carb: Number,
  Fat: Number,
  itemWeight: Number,
});

const mealSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["Breakfast", "Lunch", "Evening Snack", "Dinner"],
  },
  foodItems: [foodItemSchema],
});

const userSchema = new mongoose.Schema({
  name: String,
  calorieRequirement: Number,
  mealPlan: [mealSchema],
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
const Meal = mongoose.model("Meal", mealSchema);
const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
  const foodItem = new FoodItem({
    Name: req.body.name,
    Calories: req.body.calories,
    Protein: req.body.protein,
    Carb: req.body.carb,
    Fat: req.body.fat,
    itemWeight: req.body.weight,
  });

  foodItem.save();

  FoodItem.countDocuments(function (err, count) {
    if (err) {
      console.log(err);
    } else if (count < 20) {
      res.redirect("/");
    } else {
      res.sendFile(__dirname + "/user.html");
    }
  });
});

app.post("/user", (req, res) => {
  FoodItem.find((err, fooditems) => {
    if (err) {
      console.log(err);
    } else {
      var mealTime = ["Breakfast", "Lunch", "Evening Snack", "Dinner"];
      for (var i = 0; i < 5; i++) {
        const meal = new Meal({
          category: mealTime[i % 4],
          foodItems: [
            fooditems[4 * i + 0],
            fooditems[4 * i + 1],
            fooditems[4 * i + 2],
            fooditems[4 * i + 3],
          ],
        });
        meal.save();
      }
    }
  });

  Meal.find((err, meals) => {
    if (err) {
      console.log(err);
    } else {
      const user = new User({
        name: req.body.name,
        calorieRequirement: req.body.calorie,
        mealPlan: [
          meals[0],
          meals[1],
          meals[2],
          meals[3],
          meals[4],
          meals[1],
          meals[2],
          meals[3],
        ],
      });
      user.save();
    }
  });
  User.find((err, users) => {
    if (err) {
      console.log(err);
    } else {
      console.log("DAY 1");
      for (var j = 0; j < 4; j++) {
        console.log(users[0].mealPlan[j]);
      }
      console.log("DAY 2");
      console.log(users[0].mealPlan[4]);
      for (var j = 1; j < 4; j++) {
        console.log(users[0].mealPlan[j]);
      }
    }
  });
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
