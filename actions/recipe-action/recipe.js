class Recipe {
    constructor(recipe_category = 'assorted',
                name = '',
                description = '',
                author = '',
                prep_time = 0,
                cook_time = 0,
                recipe_yield = 1,
                image = '') {

        this.uid = undefined;

        this.recipeCategory = recipe_category;
        this.name = name;
        this.description = description;
        this.author = author;
        this.image = image;

        this.guidelines = [];
        this.ingredients = [];
        this.instructions = [];

        this.total_time = prep_time + cook_time;
    }

    addGuideline(guideline) {
        this.guidelines.push(guideline);
    }

    addIngredient(name, quantity, quality, supplied) {
        let ingredient = new Ingredient(name, quantity, quality, supplied);
        this.ingredients.push(ingredient.ingredientString);
    }

    addInstruction(description, image) {
        let instruction = new Instruction(this.instructions.length + 1, description, image);
        this.instructions.push(instruction);
    }

    setUid(uid) {
        this.uid = uid;
    }

    getUid() {
        return this.uid;
    }
}

class Ingredient {
    constructor(name = '',
                quantity = '',
                quality = '',
                supplied = true) {

        this.name = name;
        this.quantity = quantity;
        this.quality = quality;
        this.supplied = supplied;

        if (!supplied)
            this.name = `${this.name} (from your pantry)`;

        if (!quantity && !quality)
            this.ingredientString = `${this.name}`;
        else if (/^\d+$/.test(quantity))
            this.ingredientString = `${this.quantity} ${this.quality} ${this.name}`;
        else
            this.ingredientString = `${this.quantity} of ${this.quality} ${this.name}`
    }
}

class Instruction {
    constructor(step = 1, description = '', image = '') {
        this.step = step;
        this.description = description;
        this.image = image;
    }
}

module.exports = Recipe;