class Conversation {

    constructor(dialogFlowApp,
                actionMap,
                welcomeResponse = ['Welcome!'],
                fallbackResponse = ['I didn\'t get that.', 'Please say that again.']) {

        const WELCOME_ACTION = 'input.welcome';
        const FALLBACK_ACTION = 'input.unknown';

        this.dialogFlowApp = dialogFlowApp;
        this.actionMap = actionMap;

        let welcome = this.setDefaultText(dialogFlowApp, welcomeResponse);
        let fallback = this.setDefaultText(dialogFlowApp, fallbackResponse);

        if(!actionMap.get(WELCOME_ACTION))
            actionMap.set(WELCOME_ACTION, welcome);
        if(!actionMap.get(FALLBACK_ACTION))
            actionMap.set(FALLBACK_ACTION, fallback);
    }

    setDefaultText(dialogFlowApp, textArray) {
        return function() {
            for(let text in textArray) {
                if(textArray.hasOwnProperty(text))
                    dialogFlowApp.ask(text);
            }
        };
    }

    handleRequest() {
        this.dialogFlowApp.handleRequest(this.actionMap);
    }
}

module.exports = Conversation;