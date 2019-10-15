'use strict';

const {DialogflowApp} = require('actions-on-google');

const NewsAction = require('./actions/news-action/newsAction');
const RecipeAction = require('./actions/recipe-action/recipeAction');
const Conversation = require('./conversation');

class Fulfillment {

    constructor() {
        this.WELCOME_ACTION = 'input.welcome';
        this.FALLBACK_ACTION = 'input.unknown';
    }

    /**
     * Handle any fulfillment requests,
     * passing the request to the appropriate conversation handler*/
    handleRequest(target, request, response) {
        // Create an instance of the DialogflowApp, passing the HTTP request and response
        const app = new DialogflowApp({request: request, response: response});

        console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
        console.log('Dialogflow Request body: ' + JSON.stringify(response.body));

        // Define the projects available on this api
        let projects = [
            'ewn-news',
            'recipes'];

        let newsAction = new NewsAction();
        let recipeAction = new RecipeAction(app);

        /*=======================================================================*/

        // Map action to handler
        let actionMap = new Map();
        actionMap.set(this.WELCOME_ACTION, newsAction.deliverEWNNews);
        actionMap.set('request.news', newsAction.deliverEWNNews);
        // Handle media status actions
        actionMap.set(app.StandardIntents.MEDIA_STATUS, () => {
            if (app.getMediaStatus() === app.Media.Status.FINISHED) {
                app.ask('The audio is finished playing.');
            } else { //"STATUS_UNSPECIFIED"
                app.ask('Something went wrong with the audio.');
            }
        });

        let welcomeText = 'Welcome to EWN News! Your source of local South African news.';

        // Create a new conversation using the above configuration, some parameters are optional
        let ewnNewsConversation = new Conversation(app, actionMap, welcomeText);

        /*=======================================================================*/

        // Map action to handler
        actionMap = new Map();

        // Handle all welcome intents - first intent when user requests action
        actionMap.set(this.WELCOME_ACTION, (app) => {recipeAction.recipeWelcomeAction(app)});

        // Handle all unknown inputs
        actionMap.set(this.FALLBACK_ACTION, (app) => {recipeAction.recipeFallbackAction(app)});

        // When the user has selected a meal category, confirm this selection
        actionMap.set('select.meal_category', (app) => {recipeAction.confirmRecipeSelection(app)});

        // Meal category selection response - if yes start recipe; else choose different meal
        actionMap.set('meal-category-selection.yes', (app) => {recipeAction.eventStartGuidelines(app)});
        actionMap.set('meal-category-selection.no', (app) => {recipeAction.eventChooseMealCategory(app)});

        // When the user chooses to finish recipe - check if they'd like another
        actionMap.set('finish-recipe.another', (app) => {recipeAction.eventChooseMealCategory(app)});
        actionMap.set('finish-recipe.finished', (app) => {recipeAction.eventAbortRecipe(app)});

        // Handle guidelines, ingredients, and steps navigation
        actionMap.set('recipe-guidelines', (app) => {recipeAction.continueWithRecipeGuidelines(app)});
        actionMap.set('recipe-guidelines.next', (app) => {recipeAction.continueWithRecipeGuidelines(app)});
        actionMap.set('recipe-guidelines.previous', (app) => {recipeAction.continueWithRecipeGuidelines(app)});
        actionMap.set('recipe-guidelines.repeat', (app) => {recipeAction.continueWithRecipeGuidelines(app)});

        actionMap.set('recipe-ingredients',  (app) => {recipeAction.continueWithRecipeIngredients(app)});
        actionMap.set('recipe-ingredients.next', (app) => {recipeAction.continueWithRecipeIngredients(app)});
        actionMap.set('recipe-ingredients.previous', (app) => {recipeAction.continueWithRecipeIngredients(app)});
        actionMap.set('recipe-ingredients.repeat', (app) => {recipeAction.continueWithRecipeIngredients(app)});

        actionMap.set('recipe-steps', () => {recipeAction.continueWithRecipeSteps()});
        actionMap.set('recipe-steps.next', () => {recipeAction.continueWithRecipeSteps()});
        actionMap.set('recipe-steps.previous', () => {recipeAction.continueWithRecipeSteps()});
        actionMap.set('recipe-steps.repeat', () => {recipeAction.continueWithRecipeSteps()});

        // When the meal is complete, congratulate the user!
        actionMap.set('meal-complete',  (app) => {recipeAction.mealComplete(app)});

        // Create a new conversation using the above configuration, some parameters are optional
        let recipesConversation = new Conversation(app, actionMap);

        /*=======================================================================*/

        // The target is defined as an API parameter matching the available projects
        switch (target) {
            case projects[0]:
                ewnNewsConversation.handleRequest();
                break;
            case projects[1]:
                recipesConversation.handleRequest();
                break;
            default:
                break;
        }
    }
}

module.exports = Fulfillment;