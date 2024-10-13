import { getRecipe } from './recipeFinder';

import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";

const app: Application = express();

dotenv.config();

app.use(express.json());

// Default
app.get("/chat", async (req: Request, res: Response) =>{
    const meal : string = req.query.meal as string;
    const recipe = await getRecipe(meal);
    console.log(JSON.stringify(recipe));
    res.status(201).json(recipe);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (): void => console.log(`Server is running on ${PORT}`));

module.exports = app;