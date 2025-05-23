"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = process.env.PORT;
const URL_AllRecipes = process.env.URL_AllRecipes;
const URL_filteredRecipes = process.env.URL_filteredRecipes;
const URL_ListOfRecipes = process.env.URL_ListOfRecipes;
const URL_RecipesById = process.env.URL_RecipesById;
app.get("/getAllRecipes", async (req, res) => {
    try {
        const allRecipes = await axios_1.default.get(`${URL_AllRecipes}`);
        res.send(allRecipes.data);
    }
    catch (error) {
        console.log("error getAllRecipes " + error);
        res.status(500).send({ error: "Failed to fetch recipes" });
    }
});
app.get("/getFilteredRecipes", async (req, res) => {
    const { ingredient, country, category } = req.query;
    if (!ingredient && !country && !category) {
        return res.status(400).send({ error: "Missing query" });
    }
    try {
        const ingredientList = Array.isArray(ingredient)
            ? ingredient
            : ingredient
                ? [ingredient]
                : [];
        const countryList = Array.isArray(country)
            ? country
            : country
                ? [country]
                : [];
        const categoryList = Array.isArray(category)
            ? category
            : category
                ? [category]
                : [];
        const results = [];
        for (const ing of ingredientList) {
            const ingRes = await axios_1.default.get(`${URL_filteredRecipes}i=${ing}`);
            results.push(...(ingRes.data.meals || []));
        }
        for (const area of countryList) {
            const areaRes = await axios_1.default.get(`${URL_filteredRecipes}a=${area}`);
            results.push(...(areaRes.data.meals || []));
        }
        for (const cat of categoryList) {
            const catRes = await axios_1.default.get(`${URL_filteredRecipes}c=${cat}`);
            results.push(...(catRes.data.meals || []));
        }
        // Удалим дубликаты по idMeal
        const uniqueMeals = Object.values(results.reduce((acc, meal) => {
            acc[meal.idMeal] = meal;
            return acc;
        }, {}));
        res.send({ meals: uniqueMeals });
    }
    catch (error) {
        console.error("Query error", error);
        res.status(500).send({ error: "Error with query" });
    }
});
app.get("/getRecipeById", async (req, res) => {
    const { id } = req.query;
    if (!id)
        return res.status(400).send({ error: "Missing id" });
    try {
        const result = await axios_1.default.get(`${URL_RecipesById}i=${id}`);
        res.send(result.data);
    }
    catch (err) {
        console.error("Error fetching by ID:", err);
        res.status(500).send({ error: "Failed to fetch recipe" });
    }
});
app.get("/getListOfRecipes", async (req, res) => {
    const { type } = req.query;
    try {
        if (!type) {
            return res.status(400).send({ error: "miss query" });
        }
        if (type === "ingredient") {
            const ingredientData = await axios_1.default.get(`${URL_ListOfRecipes}i=list`);
            res.send(ingredientData.data);
        }
        else if (type === "country") {
            const countryData = await axios_1.default.get(`${URL_ListOfRecipes}a=list`);
            res.send(countryData.data);
        }
        else if (type === "category") {
            console.log(URL_ListOfRecipes);
            const categoryData = await axios_1.default.get(`${URL_ListOfRecipes}c=list`);
            res.send(categoryData.data);
        }
    }
    catch (error) {
        console.log("query error " + error);
        res.status(500).send({ error: "Error with query" });
    }
});
app.listen(PORT);
