const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/login', (req, res) => {
  res.send(`
    <form action="/login" method="post">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username">
      <input type="submit" value="Submit">
    </form>
  `);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.redirect(`/?username=${encodeURIComponent(username)}`);
});

app.get('/', (req, res) => {
  const username = req.query.username || '';
  const messages = getMessages();

  res.send(`
    <h2>Chat App:</h2>
    <div>
      ${messages.map(({ username, message }) => `<p><strong>${username}:</strong> ${message}</p>`).join('')}
    </div>
    <form action="/" method="post">
      <label for="message">Message:</label>
      <input type="text" id="message" name="message">
      <input type="hidden" name="username" value="${username}">
      <input type="submit" value="Send">
    </form>
    <script>
      localStorage.setItem('username', '${username}');
    </script>
  `);
});

app.post('/', (req, res) => {
  const username = req.body.username || '';
  const message = req.body.message;

  if (username && message) {
    const data = {
      username: username,
      message: message
    };

    saveMessage(data);
  }

  res.redirect(`/?username=${encodeURIComponent(username)}`);
});

function getMessages() {
  try {
    const data = fs.readFileSync('messages.txt', 'utf8');
    return data.split('\n').filter(Boolean).map(JSON.parse);
  } catch (err) {
    console.error('Error reading messages:', err);
    return [];
  }
}

function saveMessage(message) {
  try {
    fs.appendFileSync('messages.txt', JSON.stringify(message) + '\n');
    console.log('Message saved:', message);
  } catch (err) {
    console.error('Error saving message:', err);
  }
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
