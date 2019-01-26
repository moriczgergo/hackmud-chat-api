# hackmud-chat-api
An easy-to-use hackmud Chat API module.

## Installation

Latest NPM release (**recommended**): `npm install hackmud-chat-api`
Latest GitHub version: `npm install moriczgergo/hackmud-chat-api`

## Usage

```js
var Hackmud = require('hackmud-chat-api');

var chat = new Hackmud("token or chat_pass");
console.log("Logged in! Token: " + chat.token);
console.log("Users: " + chat.user.join(", "));

chat.subscribe(messages => {
    messages.forEach(message => {
        console.log("From: " + message.from_user);
        console.log("To: " + message.to_user);

        if (message.channel) { // If sent in a channel
            console.log("Sent in " + message.channel);
            chat.send(message.to_user, message.channel, message.msg); // Reply with the same message in the same channel with the user that received the message.
        } else { // If sent in private
            chat.tell(message.to_user, message.from_user, message.msg) // Reply with the same message in private with the user that received that message.
            console.log("Sent in private");
        }

        console.log(message.msg);
    });
});
```

## Docs

### Message

#### id
Unique message ID provided by the API.

#### t
Unix timestamp in milliseconds.

#### from_user
The user who sent the message.

#### to_user
The user who received the message.

#### msg
The message's text. (with color codes)

#### channel
Optional, only present if the message was sent in a channel, if the message wasn't a tell.

### Client

#### new Client(auth)

Parameters:
 * `auth`: A token or a chat_pass.

Initializes the client.

Example:

```js
var chat = new Client("ghwef");
```

#### subscribe(handler, users)

Params:
 * `handler`: A callback that receives messages.
   * 1st param: Array of messages.
 * `users`: Array of users to listen with. Optional.

Returns: Index of listener. **You'll need this if you want to unsubscribe.**

Example:
```js
var handlerIndex = chat.subscribe(messages => {
    console.log("Messages received:");
    messages.forEach(message => {
        console.log(message.msg);
    });
});
```

#### unsubscribe(index)

Params:
 * `index`: Index of handler to unsubscribe.

Example:
```js
chat.unsubscribe(handlerIndex);
```

#### send(username, channel, msg)

Params:
 * `username`: Username to send message with.
 * `channel`: Channel to send message to.
 * `msg`: Message to send.

Returns: null or error, if there was one.

Example:
```js
var err = chat.send("my_bot", "0000", "my_bot.totally_not_a_scam is the best script ever.");
if (err) console.error("An error occurred: " + err);
```

#### tell(username, tell, msg)

Params:
 * `username`: Username to send message with.
 * `tell`˙: Username to send message to.
 * `msg`: Message to send.

Returns: null or error, if there was one.

Example:
```js
var err = chat.tell("my_bot", "me", "Started running.");
if (err) console.error("An error occurred: " + err);
```

#### users
Array of users.

#### channels
An object. The keys are usernames, and the values are arrays of channel names that the user has joined.

Example:
```js
{
    me: ["0000", "town", "CHOICE_EPSILON_2"],
    my_bot: ["0000"]
}
```

#### token
The token, either the one passed to the constructor, or the one generated from chat_pass.