const Recipe = require('./recipe');

class Recipes {

    constructor() {
        this.recipeCategories = ['seafood', 'pasta', 'salad', 'pork'];
        this.recipes = [saladRecipe, porkRecipe, lambRecipe];
    }

    getRecipeByCategory(chosenRecipeCategory) {
        if (!chosenRecipeCategory in this.recipeCategories) {
            return undefined;
        }

        for (let index in this.recipes) {
            let recipe = this.recipes[index];
            recipe.setUid(index);
            if (recipe.recipeCategory === chosenRecipeCategory) {
                return recipe;
            }
        }
        return undefined;
    }

    getRecipeByUid(uid) {
        return this.recipes[uid];
    }
}

let saladRecipe = new Recipe(
    'salad',
    'Courgette & Chickpea Salad',
    'Warm courgette & chickpea salad with goats cheese & almond',
    'Chante van der Walt',
    10,
    10,
    2,
    'https://cdn.24.co.za/files/Cms/General/d/2953/83e6306aa66242119eea03554e7ff202.jpg');

saladRecipe.guidelines = [
    `Estimated prep & cooking time: ${saladRecipe.total_time} minutes`,
    `Rinse all herbs and leaves before eating`,
    `Quantities of fresh ingredients may vary, depending on natural size`,
    `Choice of fresh ingredients may vary, depending on the season`
];

saladRecipe.addIngredient('Chickpeas', '240 grams', 'drained');
saladRecipe.addIngredient('Courgettes', '2', 'finely sliced');
saladRecipe.addIngredient('Rocket', '40 grams');
saladRecipe.addIngredient('Baby spinach', '160 grams');
saladRecipe.addIngredient('Garlic clove', '1', 'crushed');
saladRecipe.addIngredient('Ginger', '8 grams');
saladRecipe.addIngredient('Goats Cheese', '90 grams');
saladRecipe.addIngredient('Lemon', '1');
saladRecipe.addIngredient('Almond', '30 grams', 'flaked');
saladRecipe.addIngredient('Oregano', '8 grams', 'chopped');
saladRecipe.addIngredient('Olive oil', '', '', false);
saladRecipe.addIngredient('Salt and black pepper', '', '', false);

saladRecipe.addInstruction('In a dry frying pan on medium heat, toast your almonds until golden and set aside.');
saladRecipe.addInstruction('Place saucepan over low-medium heat. Add a splash of olive oil, your garlic, ginger, '
    + 'lemon zest and your courgette slices. Saute for 3 minutes until the courgettes are cooked to your preference.');
saladRecipe.addInstruction('Add the chickpeas, baby spinach, and oregano to the saucepan for the last minute. ' +
    'Toss through. Remove, season with '
    + 'salt, pepper and lemon juice. Toss through your rocket and a drizzle of olive oil.');
saladRecipe.addInstruction('Crumble your goats cheese over the salad, and sprinkle your flaked almonds.');
saladRecipe.addInstruction('Serve with lemon wedges for squeezing over.');

let porkRecipe = new Recipe(
    'pork',
    'Sticky Asian-Style Pork Patties',
    'Served with a crisp carrot & sesame salad',
    'Chante van der Walt',
    15,
    15,
    2,
    'http://www.picknpay.co.za/picknpay/action/media/downloadFile?media_fileid=25072&a=597&s=450x260');

porkRecipe.guidelines = [
    `Estimated prep & cooking time: ${porkRecipe.total_time} minutes`,
    `Rinse all herbs and leaves before eating`,
    `Quantities of fresh ingredients may vary, depending on natural size`,
    `Choice of fresh ingredients may vary, depending on the season`
];

porkRecipe.addIngredient('Garlic cloves', '2');
porkRecipe.addIngredient('Sesame seeds', '10 ml');
porkRecipe.addIngredient('Julienned carrots', '200 grams');
porkRecipe.addIngredient('Chili', '1');
porkRecipe.addIngredient('Coriander', '5 grams');
porkRecipe.addIngredient('Tapioca flour', '5 ml');
porkRecipe.addIngredient('Spring onion', '2');
porkRecipe.addIngredient('Pak choi', '250 grams');
porkRecipe.addIngredient('Pork mince', '300 grams');

porkRecipe.addIngredient('Soy sauce', '25 ml');
porkRecipe.addIngredient('Hoisin sauce', '10 ml');
porkRecipe.addIngredient('Mirin', '15 ml');

porkRecipe.addIngredient('White wine vinegar', '25 ml');
porkRecipe.addIngredient('Sesame oil', '15 ml');
porkRecipe.addIngredient('Honey', '15 ml');

porkRecipe.addIngredient('Salt, pepper, cooking oil, and water', '', '', false);

porkRecipe.addInstruction('Place a pan (that has a lid which will be used later) over a medium heat. '
    + 'When hot, add your sesame seeds and dry toast them for 3-4 minutes, shifting them as they colour. Remove from the pan on completion');
porkRecipe.addInstruction('Finely slice your spring onion on the diagonal. Rinse and roughly chop your coriander. '
    + 'Peel and grate your garlic.');
porkRecipe.addInstruction('De-seed and finely slice your chili and lastly, rinse the pak choi leaves and slice the fatter end bits off. '
    + 'Slice each leaf in half lengthways, cutting down the center of the stem.');
porkRecipe.addInstruction('Return your pan over low-medium heat. Add a drizzle of cooking oil and the garlic. Saute until fragrant, about 2-3 minutes.');
porkRecipe.addInstruction('Then add the pak choi and some seasoning to the pan. Add a drizzle of water and pop the lid on. Let the pak choi wilt for about 5-7 minutes, '
    + 'checking on it every so often. Remove the pak choi from the pan when softened and place it into a bowl, '
    + 'being sure to catch all the bits of garlic from the pan in the process.');
porkRecipe.addInstruction('While your pak choi is wilting, prepare your pork patties. Ready a bowl of water to dip your hands into prior to '
    + 'rolling out the patties. In another mixing bowl, add the pork mince, half the spring onion, the tapioca flour, and chili (to your heat '
    + 'preference, reserving some for garnish). Mix these ingredients until well combined. Then dip your hands into the water and shape the pork '
    + 'mince mixture into golf ball sized patties, about 3 per person. Squish them a little so they are slightly flattened and pop in the fridge to firm up.');
porkRecipe.addInstruction('In a bowl, mix together the julienned carrot, chopped coriander, remaining spring onion, the salad dressing, and some salt. '
    + 'Season further to taste, sprinkle over your toasted sesame seeds, toss to combine and set aside until serving.');
porkRecipe.addInstruction('Return your pan over a medium heat. Add a further drizzle of cooking oil. When hot, add the pork patties ' +
    'and cook for about 3-4 minutes on one side to get some nice colour. Season with salt and turn, cook the other side for about ' +
    '2-3 minutes until cooked through - slice one open to check. Once cooked, pour over your Asian Glaze and allow it to bubble on the heat ' +
    'for about 10 seconds before removing the pan from the heat.');
porkRecipe.addInstruction('Plate up your crispy carrot and sesame salad alongside your wilted pak choi. Top with glazed pork patties, ' +
    'being sure to incorporate any delicious glaze from the pan. Add some remaining fresh chili if you wish and VOILA. Great work, Chef!');

let lambRecipe = new Recipe(
    'lamb',
    'Barbeque Rubbed & Roasted Lamb',
    'With rustic baba ganoush & a cooling yoghurt tzatziki',
    'Klaudia Weixelbaumer',
    15,
    35,
    4,
    'http://www.picknpay.co.za/picknpay/action/media/downloadFile?media_fileid=25072&a=597&s=450x260');

lambRecipe.guidelines = [
    `Estimated prep & cooking time: ${lambRecipe.total_time} minutes`,
    `Rinse all herbs and leaves before eating`
    // `Quantities of fresh ingredients may vary, depending on natural size`,
    // `Choice of fresh ingredients may vary, depending on the season`
];

lambRecipe.addIngredient('Almonds', '40 grams', 'flaked');
lambRecipe.addIngredient('Onions', '2');
lambRecipe.addIngredient('Tzatziki', '120 grams', 'Mediterranean Delicacies');
lambRecipe.addIngredient('Aubergine', '800 grams');
lambRecipe.addIngredient('Leaves', '80 grams', 'green');
lambRecipe.addIngredient('Lamb leg', '640 grams', 'deboned');
lambRecipe.addIngredient('Rub', '30 mills', 'NOMO Barbeque');
lambRecipe.addIngredient('Salt, pepper, olive oil, cooking oil, water, and tinfoil', '', '', false);

lambRecipe.addInstruction('Preheat oven to 200 degrees celcius. Prepare a tinfoil-lined baking tray, ' +
    'the right size for your roast.');
lambRecipe.addInstruction('Slice the aubergine into big chunks and place on your baking tray. ' +
    'Wedge your onion and add to the aubergine. Add a generous drizzle of olive oil and some salt and pepper. ' +
    'Toss until well coated. When your oven has reached temperature, roast the ingredients until they have just softened ' +
    'and are turning golden, 25 to 35 minutes. Give the tray a shift at the halfway mark for even colouring.');
lambRecipe.addInstruction('In the meantime, place a non-stick pan on medium heat. Add your flaked almonds and dry roast them, ' +
    'shifting them around the pan for even colouring, about 3 to 5 minutes. Set aside for serving later and keep the pan for your lamb.');
lambRecipe.addInstruction('When your veggies have been in the oven for 15 minutes, return the pan back to a medium high heat. ' +
    'Add a drizzle of cooking oil. Remove your lamb from its packaging, season it with salt and sprinkle over the NOMU Barbeque rub ' +
    'until well coated. Use the moisture of your meat to mop up the spices.');
lambRecipe.addInstruction('When your pan is hot, add your lamb and brown it for 5 to 7 minutes total, shifting it as it colours. ' +
    'Do this in batches to prevent overcrowding the pan. Then assess if your lamb needs further cooking - depending on its shape ' +
    'and thickness. If so, remove your veggies from the oven and make some room for your lamb. If your veggies are cooked to ' +
    'your preference already, simply remove them from your tray and set them aside until serving.');
lambRecipe.addInstruction('Place your lamb in the oven alongside your veggies or by itself and let it cook for a further 5 to 8 mminutes, ' +
    'or until cooked to your preference. Let your lamb rest for 5 minutes outside of the oven before slicing it. Lightly season your ' +
    'slices with salt and pepper.');
lambRecipe.addInstruction('Rinse (be water-wise) and drain your green leaves. Toss with some olive oil and salt.');
lambRecipe.addInstruction('To serve, plate up a bed of rustic baba ganoush (roasted onion and aubergine), top with your fresh leaves ' +
    'and then with the sliced lamb. Dollop over your tzatziki, sprinkle over your flaked almonds and finally, pour over any ' +
    'remaining lamb juices from your pan for extra flavour! Nice one, Chef!');

module.exports = Recipes;