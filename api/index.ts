import { getRecipe } from './recipeFinder';

const express = require("express");
const app = express();

app.get("/", async(req, res) => {
    const meal : string = req.query.meal as string;
    const recipe = await getRecipe(meal);
    console.log(JSON.stringify(recipe));
    res.status(201).json(recipe);
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;