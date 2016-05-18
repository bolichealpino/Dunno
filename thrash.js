
// estilo funcional
function recover(player){
    return {hp: player.hp+12}
};
function Player(){
    return {hp: 12};
};


// estilo OOP que eu costumo usar
function Player(){
    var player = {};
    player.hp = 12;
    player.recover = function(){
        player.hp += 12;
    }
    return player;
};


// estilo OOP da primeira versão do javascript
// altamente criticada, mas tem alguns beneficios especificos
function Player(){
    this.hp = 12;
};
Player.prototype.recover = function(){
    this.hp += 12;
};



    //var many_hellos = [];
    //for (var i=0; i<10; ++i)
        //many_hellos[i] = a({
            //style: {"border":"2px solid black"},
            //href: "foo"},
            //"Hello World " + i);

    //var hellos = div({},many_hellos);

