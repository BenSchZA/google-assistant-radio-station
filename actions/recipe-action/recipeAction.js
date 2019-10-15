const Recipes = require('./recipes');
const Recipe = require('./recipe');

// Used for mapping follow-up intents to their appropriate index increments
// See: getRecipeDirection()
const DirectionEnum = Object.freeze({"NEXT": 1, "PREVIOUS": -1, "REPEAT": 0});

const CHOSEN_RECIPE_CTX_LIFETIME = 1000;
const RECIPE_PROGRESS_CTX_LIFETIME = 1000;

// All recipe stage followup contexts
const MEAL_CATEGORY_SELECTION_FOLLOWUP_CTX = 'meal-category-selection-followup';
const RECIPE_GUIDELINES_FOLLOWUP_CTX = 'recipe-guidelines-followup';
const RECIPE_INGREDIENTS_FOLLOWUP_CTX = 'recipe-ingredients-followup';
const RECIPE_STEPS_FOLLOWUP_CTX = 'recipe-steps-followup';
const FINISH_RECIPE_FOLLOWUP_CTX = 'finish-recipe-followup';

const RECIPE_CTXS = [
    RECIPE_GUIDELINES_FOLLOWUP_CTX,
    RECIPE_INGREDIENTS_FOLLOWUP_CTX,
    RECIPE_STEPS_FOLLOWUP_CTX];

// Recipe action branding
const BRAND = 'UCook';
const BRAND_LINK = 'https://ucook.co.za/';

let app;
let screenOutputAvailable;

class RecipeAction {

    constructor(inputApp) {
        app = inputApp;
        // Check if calling device has a screen
        screenOutputAvailable = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
    }

    /** Welcome the user to the recipes action,
     * this isn't currently used*/
    recipeWelcomeAction(app) {
        return new Promise(((resolve, reject) => {

            const response = `Welcome to ${BRAND} recipes. I sense the aroma of a freshly cooked meal coming! What would you like to cook today? We currently have the options of "pork", "salad", or "lamb".`;

            if (app.ask(response)) {
                resolve("DialogFlow response successful")
            } else {
                reject("DialogFlow response failed")
            }

        })).catch(error => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventFallbackIntent(app);
        });
    }

    recipeFallbackAction(app) {
        return new Promise((resolve, reject) => {

            let contextNames = [];
            app.getContexts().forEach((context) => {
                contextNames.push(context.name);
            });

            let response;

            // Determine what the best fallback response is for a given context
            if (contextNames.length <= 0) {
                // If there is no action for whatever reason, ask the user to start again
                response = 'Sorry, I didn\'t get that. What would you like to cook today? ' +
                    'We currently have the options of "pork", "salad", or "lamb".';
            } else if (contextNames.some(v => RECIPE_CTXS.includes(v))) {
                // If the user is busy with a recipe, give them some guidance
                response = 'During the recipe say "next", "previous", or "repeat" to navigate, or  say "Guidelines", ' +
                    '"Ingredients", or "Steps" to skip to that stage. Good luck, Chef!';
            } else if (contextNames.indexOf(MEAL_CATEGORY_SELECTION_FOLLOWUP_CTX) > -1) {
                // If the user has already selected a meal, give them some guidance
                response = 'During the recipe say "next", "previous", or "repeat" to navigate, or  say "Guidelines", ' +
                    '"Ingredients", or "Steps" to skip to that stage. Good luck, Chef!';
            } else if (contextNames.indexOf(FINISH_RECIPE_FOLLOWUP_CTX) > -1) {
                // If the user has finished the recipe, then end the conversation
                this.eventAbortRecipe(app);
                return;
            } else {
                response = `Sorry, I didn't get that. What would you like to cook today? We currently have the options of "pork", "salad", or "lamb".`;
            }

            if (app.ask(response)) {
                resolve("DialogFlow response successful")
            } else {
                reject("DialogFlow response failed")
            }

        }).catch(error => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventChooseMealCategory(app);
        });
    }

    /**
     * Confirm that the user would like to continue with the selected recipe,
     * for now this recipe selection isn't smart,
     * but simply selects a recipe in the matching meal category.
     * Possible categories defined as meal-category in DialogFlow: pasta, salad, seafood, for now...*/
    confirmRecipeSelection(app) {
        return new Promise(((resolve, reject) => {

            /*Get meal-category argument from DialogFlow,
            * then call getRecipeByCategory() on recipes list*/
            let mealCategory = app.getArgument('meal-category');
            let recipes = new Recipes();

            let chosenRecipe = recipes.getRecipeByCategory(mealCategory);

            // If the chosenRecipe variable is valid, continue
            if (chosenRecipe instanceof Recipe) {
                /*Set the chosen_recipe context parameter to the recipe index for later use,
                * rather than storing the recipe itself, this is a light-weight way to fetch it.*/
                app.setContext("chosen_recipe", CHOSEN_RECIPE_CTX_LIFETIME, {"uid": chosenRecipe.getUid()});

                let response = '';
                if(screenOutputAvailable) {
                    // Compile rich media response
                    response = app.buildRichResponse()
                        .addSimpleResponse(`We'll make a fine chef out of you in no time. Let's get started. `
                            + `We'll be cooking ${chosenRecipe.name} by ${chosenRecipe.author} today. `
                            + `${chosenRecipe.description}. Would you like to continue?`)
                        .addBasicCard(
                            app.buildBasicCard().setImage(chosenRecipe.image, "your recipe"))
                        .addSuggestions("Get help");
                } else {
                    response = `We'll make a fine chef out of you in no time. Let's get started. `
                        + `We'll be cooking ${chosenRecipe.name} by ${chosenRecipe.author} today. `
                        + `${chosenRecipe.description}. Would you like to continue?`;
                }

                // Send the response to the user, if this fails it'll be caught
                if (this.askAndPurgeContexts(app, response, MEAL_CATEGORY_SELECTION_FOLLOWUP_CTX)) {
                    resolve("DialogFlow response successful")
                } else {
                    reject("DialogFlow response failed")
                }
            } else {
                reject("Recipe not found")
            }

        })).catch(error => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventFallbackIntent(app);
        });
    }

    /**
     * Start the recipe guidelines section of the conversation*/
    continueWithRecipeGuidelines(app) {
        return new Promise(((resolve, reject) => {

            /*Get meal-category argument from DialogFlow,
            * then call getRecipeByCategory() on recipes list*/
            let recipes = new Recipes();
            let recipeUid = app.getContext('chosen_recipe').parameters.uid;
            let chosenRecipe = recipes.getRecipeByUid(recipeUid);

            // Get the position in recipe index increment direction from the follow-up intent
            let recipeDirection = RecipeAction.getRecipeDirection(app.getIntent());

            // If the chosenRecipe variable is valid, continue
            if (chosenRecipe instanceof Recipe) {
                // Get the recipe_progress context from the conversation
                let recipeProgressContext = app.getContext('recipe_progress');

                /*If this section of the conversation hasn't happened yet (within the lifespan of the context),
                * then the current position will be undefined and we'll handle it appropriately by introducing
                * the user to the section.*/
                let positionInRecipe = recipeProgressContext ?
                    recipeProgressContext.parameters.guidelines : undefined;

                if (positionInRecipe === undefined) {
                    // Configure the current section's progress in the context
                    app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"guidelines": -1});

                    let response = '';
                    if(screenOutputAvailable) {
                        // Compile rich media response
                        response = app.buildRichResponse()
                            .addSimpleResponse(`Before we start, please wash your hands, then listen to the following guidelines.\n`
                                + `Say "next", "repeat", and "previous" to navigate during the recipe.\n`
                                + `Simply say "Guidelines", "Ingredients", or "Steps" to skip to that stage:`)
                            .addSuggestions("Get help");
                    } else {
                        response = `Before we start, please wash your hands, then listen to the following guidelines.\n`
                            + `Say "next", "repeat", and "previous" to navigate during the recipe.\n`
                            + `Simply say "Guidelines", "Ingredients", or "Steps" to skip to that stage:`;
                    }

                    this.askAndPurgeContexts(app, response, RECIPE_GUIDELINES_FOLLOWUP_CTX);

                    resolve("DialogFlow response successful");
                } else {
                    /*If the user attempts to go backwards when on the first guideline,
                    * we have a problem! Prompt them to continue with a wooden spatula.*/
                    if (positionInRecipe <= 0 && recipeDirection === DirectionEnum.PREVIOUS) {
                        app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"guidelines": positionInRecipe});

                        let response = '';
                        if(screenOutputAvailable) {
                            // Compile rich media response
                            response = app.buildRichResponse()
                                .addSimpleResponse(`I'm afraid we can only go to the "next" guideline from here, please reconsider?\n`
                                    + `Don't make me get out the wooden spatula.`)
                                .addSuggestions("Get help");
                        } else {
                            response = `I'm afraid we can only go to the "next" guideline from here, please reconsider?\n`
                                + `Don't make me get out the wooden spatula.`;
                        }

                        this.askAndPurgeContexts(app, response, RECIPE_GUIDELINES_FOLLOWUP_CTX);

                        resolve("DialogFlow response successful");
                        return;
                    }

                    /*Increment the recipe position appropriately,
                    * according to the follow-up intent: next, previous, or repeat*/
                    positionInRecipe += recipeDirection;
                    app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"guidelines": positionInRecipe});

                    let currentGuideline = chosenRecipe.guidelines[positionInRecipe];

                    // Send the response to the user, if this fails it'll be caught
                    if (currentGuideline) {

                        this.askAndPurgeContexts(app, currentGuideline, RECIPE_GUIDELINES_FOLLOWUP_CTX);

                        resolve("DialogFlow response successful");
                    } else {
                        /*Reset the section's progress and continue to next section,
                        * if we get here it means the user has reached the last section index*/
                        app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"guidelines": -1});
                        this.eventStartIngredients(app);

                        resolve("DialogFlow response successful");
                    }
                }

            } else {
                reject("Recipe not found")
            }

        })).catch(error => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventFallbackIntent(app);
        });
    }

    /**
     * Start the recipe ingredients section of the conversation*/
    continueWithRecipeIngredients(app) {
        return new Promise(((resolve, reject) => {

            /*Get meal-category argument from DialogFlow,
            * then call getRecipeByCategory() on recipes list*/
            let recipes = new Recipes();
            let recipeUid = app.getContext('chosen_recipe').parameters.uid;
            let chosenRecipe = recipes.getRecipeByUid(recipeUid);

            // Get the position in recipe index increment direction from the follow-up intent
            let recipeDirection = RecipeAction.getRecipeDirection(app.getIntent());

            // If the chosenRecipe variable is valid, continue
            if (chosenRecipe instanceof Recipe) {
                // Get the recipe_progress context from the conversation
                let recipeProgressContext = app.getContext('recipe_progress');

                /*If this section of the conversation hasn't happened yet (within the lifespan of the context),
                * then the current position will be undefined and we'll handle it appropriately by introducing
                * the user to the section.*/
                let positionInRecipe = recipeProgressContext ?
                    recipeProgressContext.parameters.ingredients : undefined;

                if (positionInRecipe === undefined) {
                    // Configure the current section's progress in the context
                    app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"ingredients": -1});

                    let response = '';
                    if(screenOutputAvailable) {
                        // Compile rich media response
                        response = app.buildRichResponse()
                            .addSimpleResponse(`You'll need to prepare the following ingredients.\nSay "next" to continue:`)
                            .addSuggestions("Get help");
                    } else {
                        response = `You'll need to prepare the following ingredients.\nSay "next" to continue:`;
                    }

                    this.askAndPurgeContexts(app, response, RECIPE_INGREDIENTS_FOLLOWUP_CTX);

                    resolve("DialogFlow response successful");
                } else {
                    if (positionInRecipe <= 0 && recipeDirection === DirectionEnum.PREVIOUS) {
                        if (positionInRecipe === -1) {
                            this.eventStartGuidelines(app);
                            resolve("DialogFlow response successful");
                            return
                        }

                        app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"ingredients": -1});

                        let response = '';
                        if(screenOutputAvailable) {
                            // Compile rich media response
                            response = app.buildRichResponse()
                                .addSimpleResponse(`This was the first ingredient. Say "previous" again to repeat the guidelines, or say "next" to continue.`)
                                .addSuggestions("Get help");
                        } else {
                            response = `This was the first ingredient. Say "previous" again to repeat the guidelines, or say "next" to continue.`;
                        }

                        this.askAndPurgeContexts(app, response, RECIPE_INGREDIENTS_FOLLOWUP_CTX);

                        resolve("DialogFlow response successful");
                        return;
                    }

                    /*Increment the recipe position appropriately,
                    * according to the follow-up intent: next, previous, or repeat*/
                    positionInRecipe += recipeDirection;
                    app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"ingredients": positionInRecipe});

                    let currentIngredient = chosenRecipe.ingredients[positionInRecipe];

                    // Send the response to the user, if this fails it'll be caught
                    if (currentIngredient) {

                        this.askAndPurgeContexts(app, currentIngredient, RECIPE_INGREDIENTS_FOLLOWUP_CTX);

                        resolve("DialogFlow response successful");
                    } else {
                        /*Reset the section's progress and continue to next section,
                        * if we get here it means the user has reached the last section index*/
                        app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"ingredients": -1});
                        this.eventStartSteps(app);

                        resolve("DialogFlow response successful");
                    }
                }

            } else {
                reject("Recipe not found")
            }

        })).catch(error => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventFallbackIntent(app);
        });
    }

    /**
     * Start the recipe steps section of the conversation*/
    continueWithRecipeSteps() {
        return new Promise(((resolve, reject) => {

            /*Get meal-category argument from DialogFlow,
            * then call getRecipeByCategory() on recipes list*/
            let recipes = new Recipes();
            let recipeUid = app.getContext('chosen_recipe').parameters.uid;
            let chosenRecipe = recipes.getRecipeByUid(recipeUid);

            // Get the position in recipe index increment direction from the follow-up intent
            let recipeDirection = RecipeAction.getRecipeDirection(app.getIntent());

            // If the chosenRecipe variable is valid, continue
            if (chosenRecipe instanceof Recipe) {
                // Get the recipe_progress context from the conversation
                let recipeProgressContext = app.getContext('recipe_progress');

                /*If this section of the conversation hasn't happened yet (within the lifespan of the context),
                * then the current position will be undefined and we'll handle it appropriately by introducing
                * the user to the section.*/
                let positionInRecipe = recipeProgressContext ?
                    recipeProgressContext.parameters.steps : undefined;

                if (positionInRecipe === undefined) {
                    // Configure the current section's progress in the context
                    app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"steps": -1});

                    let response = '';
                    if(screenOutputAvailable) {
                        // Compile rich media response
                        response = app.buildRichResponse()
                            .addSimpleResponse(`Time to start cooking!\nSay "next" to continue:`)
                            .addSuggestions("Get help");
                    } else {
                        response = `Time to start cooking!\nSay "next" to continue:`;
                    }

                    this.askAndPurgeContexts(app, response, RECIPE_STEPS_FOLLOWUP_CTX);

                    resolve("DialogFlow response successful");
                } else {
                    if (positionInRecipe <= 0 && recipeDirection === DirectionEnum.PREVIOUS) {
                        if (positionInRecipe === -1) {
                            this.eventStartIngredients(app);
                            resolve("DialogFlow response successful");
                            return
                        }

                        app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"steps": -1});

                        let response = '';
                        if(screenOutputAvailable) {
                            // Compile rich media response
                            response = app.buildRichResponse()
                                .addSimpleResponse(`This was the first step. Say "previous" again to repeat the ingredients, or say "next" to continue.`)
                                .addSuggestions("Get help");
                        } else {
                            response = `This was the first step. Say "previous" again to repeat the ingredients, or say "next" to continue.`;
                        }

                        this.askAndPurgeContexts(app, response, RECIPE_STEPS_FOLLOWUP_CTX);

                        resolve("DialogFlow response successful");
                        return;
                    }

                    /*Increment the recipe position appropriately,
                    * according to the follow-up intent: next, previous, or repeat*/
                    positionInRecipe += recipeDirection;
                    app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"steps": positionInRecipe});

                    let currentStep = chosenRecipe.instructions[positionInRecipe];

                    if (currentStep) {

                        let stepNumber = currentStep.step;
                        let stepDescription = currentStep.description;
                        let stepImage = currentStep.image;

                        let response = '';
                        if(screenOutputAvailable) {
                            // Compile rich media response
                            response = app.buildRichResponse()
                                .addSimpleResponse(`Step ${stepNumber}: ${stepDescription}`);

                            if (stepImage) {
                                response.addBasicCard(
                                    app.buildBasicCard().setImage(stepImage, "your recipe step"));
                            }
                        } else {
                            response = `Step ${stepNumber}: ${stepDescription}`;
                        }

                        // Send the response to the user, if this fails it'll be caught
                        if (this.askAndPurgeContexts(app, response, RECIPE_STEPS_FOLLOWUP_CTX)) {
                            resolve("DialogFlow response successful")
                        } else {
                            reject("DialogFlow response failed")
                        }

                    } else {
                        /*Reset the section's progress and continue to next section,
                        * if we get here it means the user has reached the last section index*/
                        app.setContext("recipe_progress", RECIPE_PROGRESS_CTX_LIFETIME, {"steps": -1});
                        this.eventMealComplete(app);

                        resolve("DialogFlow response successful");
                    }
                }

            } else {
                reject("Recipe not found")
            }

        })).catch(error => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventFallbackIntent(app);
        });
    }

    mealComplete(app) {
        return new Promise((resolve, reject) => {

            /*Get meal-category argument from DialogFlow,
            * then call getRecipeByCategory() on recipes list*/
            let recipes = new Recipes();
            let recipeUid = app.getContext('chosen_recipe').parameters.uid;
            let chosenRecipe = recipes.getRecipeByUid(recipeUid);

            let response = '';
            if(screenOutputAvailable) {
                // Compile rich media response
                response = app.buildRichResponse()
                    .addSimpleResponse(`You should have a lovely home cooked plate of ${chosenRecipe.name} in front of you! Bravo Chef!\n`
                        + `I wish I was there to taste your creation, sadly I live in a virtual world where I can only dream of such fine meals as yours.\n`
                        + `See you next time, from your cooking companion, ${BRAND} recipes.`)
                    .addBasicCard(
                        app.buildBasicCard().setImage(chosenRecipe.image, "your recipe"))
                    .addSuggestions(Array("More recipes", "Get help"))
                    .addSuggestionLink(`${BRAND}`, `${BRAND_LINK}`);
            } else {
                response = `You should have a lovely home cooked plate of ${chosenRecipe.name} in front of you! Bravo Chef!\n`
                    + `I wish I was there to taste your creation, sadly I live in a virtual world where I can only dream of such fine meals as yours.\n`
                    + `See you next time, from your cooking companion, ${BRAND} recipes.`;
            }

            this.clearAllRecipeContexts(app);

            // Send the response to the user, if this fails it'll be caught
            if (app.tell(response)) {
                resolve("DialogFlow response successful")
            } else {
                reject("DialogFlow response failed")
            }
        }).catch((error) => {
            console.log(error);

            // If the response fails, let the user select another meal
            return this.eventFallbackIntent(app);
        });
    }

    /**
     * Events are attached to DialogFlow intents and allow manual activation of intents*/
    eventFallbackIntent(app) {
        const response = {
            followupEvent: {
                name: "fallback",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    eventChooseMealCategory(app) {
        this.clearAllRecipeContexts(app);

        const response = {
            followupEvent: {
                name: "meal-category-selection",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    eventStartGuidelines(app) {
        this.clearAllRecipeContextsExcept(app, MEAL_CATEGORY_SELECTION_FOLLOWUP_CTX);

        const response = {
            followupEvent: {
                name: "recipe-guidelines",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    eventStartIngredients(app) {
        this.clearAllRecipeContextsExcept(app, MEAL_CATEGORY_SELECTION_FOLLOWUP_CTX);

        const response = {
            followupEvent: {
                name: "recipe-ingredients",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    eventStartSteps(app) {
        this.clearAllRecipeContextsExcept(app, MEAL_CATEGORY_SELECTION_FOLLOWUP_CTX);

        const response = {
            followupEvent: {
                name: "recipe-steps",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    eventMealComplete(app) {
        this.clearAllRecipeContexts(app);

        const response = {
            followupEvent: {
                name: "meal-complete",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    eventAbortRecipe(app) {
        this.clearAllRecipeContexts(app);

        const response = {
            followupEvent: {
                name: "finish-recipe-finished",
                data: {}
            }
        };

        return app.response_.status(200).send(response);
    }

    /**
     * Manage contexts for each stage of the recipe.
     * When changing from one stage to another, for example from "ingredients" to "steps",
     * all followup contexts are cleared except for the "steps" context - this ensures
     * that when the user says "next" it is associated with the "steps" context and
     * not the previous context. */

    clearAllRecipeContexts(app) {
        RECIPE_CTXS.forEach((recipeCtx) => {
            RecipeAction.clearContext(app, recipeCtx);
        });
    }

    /**
     * Clear all the recipe stage followup contexts except for the current one. */
    clearAllRecipeContextsExcept(app, context) {
        let clearArray = RecipeAction.removeElementFromArray(RECIPE_CTXS, context);

        if(clearArray) {
            clearArray.forEach((recipeCtx) => {
                RecipeAction.clearContext(app, recipeCtx);
            });
        }
    }

    static clearContext(app, context) {
        app.setContext(context, 0);
    }

    /**
     * A method to remove an element from an array,
     * surprisingly doesn't seem to be a built in method to do this. */

    static removeElementFromArray(array, element) {
        let index = array.indexOf(element);
        let returnArray = array.slice(0);

        if(index !== -1) {
            returnArray.splice(index, 1);
            return returnArray;
        }
        return undefined;
    }

    /**
     * Dialogflow ask() and clear followup contexts except current one*/
    askAndPurgeContexts(app, response, currentContext) {
        // Clear all the recipe stage followup contexts except for the current one
        this.clearAllRecipeContextsExcept(app, currentContext);
        return app.ask(response);
    }

    /**
     * Using the follow-up intents next, previous, and repeat,
     * map these to an increment of the section's index.
     * For example when repeating, the index should not be incremented.*/
    static getRecipeDirection(intent) {
        if (intent.includes("next")) {
            return DirectionEnum.NEXT;
        } else if (intent.includes("previous")) {
            return DirectionEnum.PREVIOUS;
        } else if (intent.includes("repeat")) {
            return DirectionEnum.REPEAT;
        } else {
            return DirectionEnum.NEXT;
        }
    }
}

module.exports = RecipeAction;