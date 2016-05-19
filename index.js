//var React = require("react");
//var ReactDOM = require("react-dom");
for (var key in React.DOM) global[key] = React.DOM[key];

var Dunno = React.createClass({

    getInitialState: function(){
        return {
            id        : 0,
            ws        : null,
            page      : "home",
            question  : "",
            questions : [],
            answereds : [], // ids of the questions I don't know
            dunnos    : [], // ids of the questions I don't know
            points    : 0
        };
    },

    componentDidMount: function(){
        var ws = new WebSocket(SERVER_URL);
        ws.onopen = function(){
            console.log("connected");
        };
        ws.onmessage = function(msg){
            var actions = JSON.parse("["+msg.data+"]");
            var first_pass = false;
            if (this.state.id === 0){
                first_pass = true;
                ++this.state.id;
                for (var i=0, l=actions.length; i<l; ++i)
                    if (actions[i].type === "join")
                        ++this.state.id;
            };
            for (var i=0, l=actions.length; i<l; ++i){
                var action = actions[i];
                var question = this.state.questions[action.question_id];
                switch (action.type){
                    case "ask":
                    this.state.questions.push({
                        "id"          : this.state.questions.length,
                        "user_id"     : action.user_id,
                        "text"        : action.question,
                        "time"        : first_pass ? action.time : Date.now(),
                        "answer"      : "",
                        "answer_time" : 0,
                        "persons"     : 0,
                        "status"      : "routing"}); // routing, accepted, refused
                    break;

                    case "answer":
                    question.answer = action.answer;
                    // TODO: synchronize clocks globally
                    question.answer_time = first_pass ? action.time : Date.now();
                    if (action.user_id === this.state.id)
                        this.state.answereds[action.question_id] = true;
                    break;

                    case "dunno":
                    ++question.persons;
                    if (action.user_id === this.state.id)
                        this.state.dunnos[action.question_id] = true;
                    break;

                    case "accept":
                    if (question.answer !== "" 
                        && question.status === "routing" 
                        && action.user_id === question.user_id){
                        question.status = "accepted";
                        if (this.state.answereds[question.id])
                            ++this.state.points;
                    };
                    break;

                    case "refuse":
                    if (question.answer !== "" 
                        && question.status === "routing" 
                        && action.user_id === question.user_id){
                        question.status = "refused";
                        if (this.state.answereds[question.id])
                            --this.state.points;
                    };
                    break;
                }
            };
            console.log("Client id is: "+this.state.id)
            console.log("Questions: "+JSON.stringify(this.state.questions));

            this.state.act = function(action){
                return function(){
                    ws.send(JSON.stringify(action));
                };
            };

            this.forceUpdate();
        }.bind(this);
        setInterval(function(){
            this.forceUpdate();
        }.bind(this), 500);
    },

    render: function() {

        function centralize(body){
            return div({"className": "centralizer_outer"},
                div({"className": "centralizer_inner"},
                body));
        };

        var question = function(question){

            var question_title = div({
                "className": "question_title"}, [
                question.text]);

            var question_seconds = div({
                "className": "question_seconds"},
                Math.floor(((question.answer_time||Date.now())-question.time)/1000)+'"');

            var question_persons = div({
                "className": "question_persons"},
                question.persons+"웃"); // 👤

            var question_head_box = div({
                "className": "question_head_box"},[
                question_seconds,
                question_persons]);

            var question_accepted = div({
                "onClick": function(){
                    this.state.act({
                        "type":"accept",
                        "user_id": this.state.id,
                        "question_id":question.id})();
                }.bind(this),
                "className":"question_acception "+(question.status==="accepted"?"accepted":"")},
                "✓");

            var question_refused = div({
                "onClick": function(){
                    this.state.act({
                        "type":"refuse",
                        "user_id": this.state.id,
                        "question_id":question.id})();
                }.bind(this),
                "className":"question_acception "+(question.status==="refused"?"refused":"")},
                "✗");

            var question_acception_box = div({
                "className": "question_acception_box"},[
                question_accepted,
                question_refused]);


            var question_head = div({
                "className": "question_head"},[
                question_head_box,
                question_acception_box]);

            var question_answer = div({
                "className": "question_answer"},[
                question.answer !== ""
                    ? question.answer
                    : "Esperando resposta..."]);

            var question_body = div({
                "className": "question_body"},[
                question_title,
                question_answer]);
                
            var question_lamp = div({
                "className": "question_lamp"},
                //"X");
                img({"src": (question.status==="routing" ? (question.answer==="" ? "img/lampada_apagada.png" : "img/lampada_acesa.gif") :
                            (question.status==="accepted" ? "img/lampada_acesa.png" :
                            "img/lampada_apagada.png")),
                    "alt": "lampada",
                    "width":"100",
                    "height":"100"
                }));
                
            return div({
                "className": "question"},[
                question_head,
                question_body,
                question_lamp
                ]);
        }.bind(this);

        var st = this.state;



        // HOME PAGE

        var logo = div({
            "onClick": function(){ st.page = "home"; }.bind(this),
            "className": st.page === "home" ? "logo" : "logo_small"},
            "dunno");

        var question_field = div({"className": "question_field_box"}, input({
            "id": "question_field",
            "key": "question_field",
            "className": "question_field",
            "placeholder": "<inserir slogan aqui>",
            "onKeyPress": function(e){ if (e.which === 13) ask(); },
            "onChange": function(e){
                st.question = e.target.value;
                this.forceUpdate();
            }.bind(this),
            "type": "text"}));

        var ask = function(){
            if (st.question.length === 0) return;
            this.state.act({
                "type"     : "ask",
                "question" : st.question,
                "time"     : Date.now(),
                "user_id"  : st.id})();
            st.question = "";
            st.page = "wall";
            this.forceUpdate();
            document.getElementById("question_field").value = "";
        }.bind(this);

        var ask_button = div({
            "id": "ask_button",
            "key": "ask_button",
            "onClick": ask,
            "className": "button ask_button"},
            ["Fazer pergunta"]);

        var quick_button = div({
            "id": "quick_button",
            "key": "quick_button",
            "onClick": function(){
                st.page = "answering";
                this.forceUpdate();
            }.bind(this),
            "className": "button quick_button"},
            ["Prefiro responder"]);

        var buttons_container = div({
            "key": "buttons_container",
            "className": "button_container"},
            [ask_button, quick_button]);

        var home = div({
            "className": "home"},
            [logo, question_field, buttons_container]);


        // WALLS PAGE

        var wall_top = div({
            "className": "wall_top"},
            centralize(
                div({
                    "className": "wall_top_content"}, [
                    logo,
                    question_field,
                    ask_button])));

        var my_questions = st.questions.filter(function(question){
            return question.user_id === st.id;
        }.bind(this)).reverse();

        var wall_body = centralize(my_questions.map(question));

        var wall = div({
            "className": "wall"},
            [wall_top, wall_body]);



        // ANSWERING PAGE

        var answering_points = div({
            "className": "answering_points"},
            "("+this.state.points+" ponto"+(this.state.points===1?"":"s")+"!)");

        var answering_top = div({
            "className": "answering_top"},[
            logo,
            answering_points]);

        function rand(seed){
            return (seed * 1103515245 + 12345) & 0x7fffffff;
        };

        var question_to_answer = (function(){
            var question_to_answer = null;
            var question_to_answer_rnd = 0;
            var rnd = rand(st.id);
            for (var i=0, l=st.questions.length; i<l; ++i){
                var rnd = rand(rnd);
                if (rnd > question_to_answer_rnd
                    && st.questions[i]
                    && st.questions[i].answer === ""
                    && !st.dunnos[i])
                    question_to_answer = st.questions[i],
                    question_to_answer_rnd = rnd;
            };
            return question_to_answer;
        })();

        var answering_question = question_to_answer ? question(question_to_answer) : [];

        var answer = function(){
            var input = document.getElementById("answering_input")
            this.state.act({
                "type"        : "answer",
                "time"        : Date.now(),
                "user_id"     : st.id,
                "question_id" : question_to_answer.id,
                "answer"      : input.value})();
            input.value = "";
        }.bind(this);

        var dunno = function(){
            this.state.act({
                "type"        : "dunno",
                "user_id"     : st.id,
                "question_id" : question_to_answer.id})();
        }.bind(this)

        var answering_answer = div({
            "className": "answering_button",
            "onClick": answer},
            "Responder");

        var answering_dunno = div({
            "className": "answering_button",
            "onClick": dunno},
            "Dunno")

        var answering_menu = div({
            "className": "answer_menu"}, [
            div({}, input({
                "id": "answering_input",
                "className": "answering_input ",
                "onKeyDown": function(e){ if (e.which === 13) answer(); }})),
            div({}, [answering_answer, answering_dunno])]);

        var answering_body = div({
            className: "answering_body"},[
            answering_question,
            answering_menu]);

        //var answering_points = div({}, this.state.points+()" pontos!");

        var answering_done = div({
            className: "answering_done"}, [
            "Nada para responder! Esperando novas questões."]);

        var answering = question_to_answer 
            ? div({}, [answering_top, centralize(answering_body)])
            : div({}, [answering_top, centralize(answering_done)]);

        return ( st.page === "home" ? home 
               : st.page === "wall" ? wall
               : answering);
    }
});

window.onload = function(){
    ReactDOM.render(
        React.createElement(Dunno, null),
        document.getElementById('test'));
};
