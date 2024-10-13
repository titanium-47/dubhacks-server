import { getRecipe } from './recipeFinder';

async function main() {
    const recipe = await getRecipe('Chicken Tikka Masala');
    console.log(recipe['choices'][0]['message']['content']);
}
main();
