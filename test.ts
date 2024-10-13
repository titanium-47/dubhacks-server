import { getRecipe } from './recipeFinder';

async function main() {
    // const recipe = await getRecipe('Simple Instant Ramen');
    const recipe = await getRecipe('Boiled Egg');
    console.log(recipe);
}
main();