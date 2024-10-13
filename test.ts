import { getRecipe } from './recipeFinder';

async function main() {
    const recipe = await getRecipe('chicken');
    console.log(recipe['choices'][0]['message']['content']);
}
main();
