const dbc = require('./deathbycaptcha.js');

const username = 'username';        // DBC account username
const password = 'password';        // DBC account password
const captcha_file = 'test.jpg';    // Image filename

const client = new dbc.SocketClient(username, password);
// const client = new dbc.HttpClient(username, password) for http client

// Get user balance
client.get_balance((balance) => {
  console.log(balance);
});

// Solve captcha with type 2 extra argument
client.decode({captcha: captcha_file, extra: {type: 2}}, (captcha) => {

  if (captcha) {
    console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);
    // Report an incorrectly solved CAPTCHA.
    // Make sure the CAPTCHA was in fact incorrectly solved!
    // client.report(captcha['captcha'], (result) => {
    //   console.log('Report status: ' + result);
    // });
  };

});
