var React = require("react");
var ReactDOM = require("react-dom");
for (var key in React.DOM) global[key] = React.DOM[key];

var Test = React.createClass({
    getInitialState: function(){
        return {counter: 0};
    },
    componentDidMount: function(){
        setInterval(() => {
            this.setState({counter: this.state.counter + 1});
        }, 100);
    },
    render: function() {
        return div({}, "test "+this.state.counter);
    }
});

window.onload = function(){
    ReactDOM.render(
        React.createElement(Test, null),
        document.getElementById('test'));
};






