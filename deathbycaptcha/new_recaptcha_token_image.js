const dbc = require('./deathbycaptcha.js');

const username = 'username';     // DBC account username
const password = 'password';     // DBC account password

// Proxy and Recaptcha token data
const token_params = JSON.stringify({
  'proxy': 'http://username:password@proxy.example:3128',
  'proxytype': 'HTTP',
  'googlekey': '6Lc2fhwTAAAAAGatXTzFYfvlQMI2T7B6ji8UVV_f',
  'pageurl': 'http://google.com'
});

// Death By Captcha Socket Client
const client = new dbc.SocketClient(username, password);
// const client = new dbc.HttpClient(username, password) for http client

// Get user balance
client.get_balance((balance) => {
  console.log(balance);
});

// Solve captcha with type 4 & token_params extra arguments
client.decode({extra: {type: 4, token_params: token_params}}, (captcha) => {

  if (captcha) {
    console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);
    // Report an incorrectly solved CAPTCHA.
    // Make sure the CAPTCHA was in fact incorrectly solved!
    // client.report(captcha['captcha'], (result) => {
    //   console.log('Report status: ' + result);
    // });
  }

});
