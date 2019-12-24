const CONSTANTS = require("../constants/globalConstants");
class CaptchaV2 {

    /**
     * @private
     * @param page
     * @param pageKey
     */
    constructor(page, pageKey) {
        this.page = page;
        this.pageKey = pageKey;
    }

    createTaskIdApi() {
        const axios = require('axios');

        return axios.post('https://api.anti-captcha.com/createTask', {
            "clientKey": CONSTANTS.ANTICAPTCHA_KEY,
            "task": {
                "type": "NoCaptchaTaskProxyless",
                "websiteURL": this.page,
                "websiteKey": this.pageKey
            }
        })
            .then((res) => {
                // console.log(`statusCode: ${res.status}`)
                // console.log(res.data)
                return res.data.taskId
            })
            .catch((error) => {
                console.error(error)
            })
    }

    getKeyCaptchaResolved(taskId) {
        const axios = require('axios');

        return axios.post('https://api.anti-captcha.com/getTaskResult', {
            "clientKey": CONSTANTS.ANTICAPTCHA_KEY,
            "taskId": taskId
        })
            .then((res) => {
                return res.data
            })
            .catch((error) => {
                console.error(error)
            })
    }

}
module.exports = CaptchaV2