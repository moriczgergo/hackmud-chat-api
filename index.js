var request = require('request');
var deasync = require('deasync');

/**
 * Event handler callback.
 * @callback eventHandler
 * @param {Message[]} messages Array of messages.
 */

/**
 * A message received from the API.
 * @typedef {Object} Message
 * @property {String} id Message ID.
 * @property {Number} t Unix timestamp (in milliseconds).
 * @property {String} from_user User who sent the message.
 * @property {String} msg Message.
 * @property {String} to_user User who received the message.
 * @property {String} [channel] Channel the message was sent to, if not a tell.
 */

class Client {
    /**
     * Creates a Client.
     * @param {string} auth A token or a password.
     * @constructor
     */
    constructor(auth) {
        this._poll = this._poll.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.getToken = this.getToken.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.send = this.send.bind(this);
        this.tell = this.tell.bind(this);

        this.token = auth;
        if (auth.length == 5) this.token = this.getToken(auth);

        var acctCall = this.getUsers();
        this.users = Object.keys(acctCall);
        this.channel = this.users.reduce((a,x) => {a[x] = Object.keys(acctCall[x]); return a}, {});

        this.last_poll = Date.now();
        this.interval_id = setInterval(this._poll, 1500);
        this.msgs_after = Date.now()/1000;
        this.poll_handlers = [];
    }

    /**
     * Message checker. DO NOT CALL THIS DIRECTLY.
     */
    _poll() {
        if (Date.now() - this.last_poll < 1000) return;
        if (this.poll_handlers.length == 0) return;

        var done = false;
        var chats;

        request.post("https://www.hackmud.com/mobile/chats.json", {json: {chat_token: this.token, after: this.msgs_after+0.1, usernames: this.users}}, function (err, response, body) {
            if (err) return; // Handle netowk errors faithfully.
            if (!body.ok) throw body.msg;

            done = true;
            chats = body.chats;
        });

        deasync.loopWhile(() => !done);

        var messages = Object.keys(chats).map(x=>chats[x].map(y=>{y.to_user = y.to_user ? y.to_user : x; y.t*=1000; return y;})).reduce((a,x)=>{a.push(...x);return a;}, []).filter((y,i,s)=>s.findIndex(z => z.id == y.id) == i).sort((a,b) => b.t - a.t);

        if (messages.length > 0) {
            this.msgs_after = messages[0].t/1000;
            this.poll_handlers.forEach(x=>x(messages));
        }

        this.last_poll = Date.now();
    }

    /**
     * Subscribes an event handler to new messages.
     * @param {eventHandler} handler Event handler.
     * @param {String[]} [users] User receivers to subscribe to.
     */
    subscribe(handler,users) {
        return this.poll_handlers.push(x=>handler(x.filter(y=>users?users.includes(y.to_user):true)))-1;
    }

    /**
     * Unsubscribes from new messages.
     * @param {Number} index Index to delete.
     */
    unsubscribe(index) {
        return this.poll_handlers.splice(index, 0);
    }

    /**
     * Retrieves a token from a password.
     * @param {string} pass A password from chat_pass.
     * @returns {string} The retrieved token from the password.
     */
    getToken(pass) {
        var done = false;
        var token = "";

        request.post("https://www.hackmud.com/mobile/get_token.json", {json: {pass}}, function (err, response, body) {
            if (err) throw err;
            if (!body.ok) throw body.msg;
            token = body.chat_token;
            done = true;
        })

        deasync.loopWhile(() => !done);
        return token;
    }

    /**
     * Retrieves users.
     */
    getUsers() {
        var done = false;
        var res = null;

        request.post("https://www.hackmud.com/mobile/account_data.json", {json: {chat_token: this.token}}, function (err, response, body) {
            if (err) throw err;
            if (!body.ok) throw body.msg;
            res = body.users;
            done = true;
        })

        deasync.loopWhile(() => !done);

        return res;
    }

    /**
     * Sends a message to a channel.
     * @param {string} username Username to send message from.
     * @param {string} channel Channel to send message to.
     * @param {string} msg Message to send.
     */
    send(username, channel, msg) {
        var done = false;
        var xerr = null;

        request.post("https://www.hackmud.com/mobile/create_chat.json", {json: {chat_token: this.token, username, channel, msg}}, function (err, response, body) {
            if (err) xerr = err;
            if (!body.ok) xerr = body.msg;
            done = true;
        })

        deasync.loopWhile(() => !done);

        return xerr;
    }

    /**
     * Sends a message to a user.
     * @param {string} username Username to send message from
     * @param {string} tell Username to send message to
     * @param {string} msg Message to send
     */
    tell(username, tell, msg) {
        var done = false;
        var xerr = null;

        request.post("https://www.hackmud.com/mobile/create_chat.json", {json: {chat_token: this.token, username, tell, msg}}, function (err, response, body) {
            if (err) xerr = err;
            if (!body.ok) xerr = body.msg;
            done = true;
        })

        deasync.loopWhile(() => !done);

        return xerr;
    }
}

module.exports = Client;