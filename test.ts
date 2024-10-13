import { getRecipe } from './recipeFinder';

async function main() {
    // const recipe = await getRecipe('Simple Instant Ramen');
    const recipe = await getRecipe('Chicken Tikka Masala');
    console.log(JSON.stringify(recipe));
}
main();