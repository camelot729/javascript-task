'use strict';

const requestPromiseNative = require('request-promise-native');
module.exports.execute = execute;
module.exports.isStar = true;

const chalk = require('chalk');

const red = chalk.hex('#F00');
const green = chalk.hex('#0F0');

const settings = {
    baseUrl: 'http://localhost:8080/messages',
    uri: '/',
    json: true

};

const functions = {
    'list': list,
    'send': send
};

function toString(elem) {
    let result = '';

    if (elem.hasOwnProperty('_from')) {
        result += `${red('FROM')}: ${elem._from} \n`;
    }
    if (elem.hasOwnProperty('_to')) {
        result += `${red('TO')}: ${elem._to} \n`;
    }
    result += `${green('TEXT')}: ${elem._text} \n\n`;

    return result;
}


function send(args) {
    args = parse(args);
    
    return requestPromiseNative
        .defaults(settings)
        .post({
            body: { text: args.text},
            qs: { to: args.to, from: args.from }
        })
        .then(toString);
}

function list(args) {

    args = parse(args);
    
    return requestPromiseNative
    .defaults(settings)
    .get({
        body: { text: args.text},
        qs: { to: args.to, from: args.from }
    })
    .then(body => body
        .map(json => toString(json))
        .join('\n\n'));
}

//send --to=Лиля --text "Привет, Красавица" --from Камиль

function parse(params) {
    let result = {};
    let boolean = false;
    let param_name = '';
    params.forEach(function(param) {
        if (param.indexOf('=') === -1) {
            if (boolean === false){
                boolean = true;
                param_name = param.split('--')[1];
            } else {
                boolean = false;
                result[param_name] = param;
                param_name = '';
            }
        } else {
            let _arr = param.split('=');
            result[_arr[0].split('--')[1]] = _arr[1];
        }
    });

    return result;
}

function execute() {
    const args = process.argv.slice(2);
    return functions[args[0]](args.slice(1));
}