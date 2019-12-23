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

    createTaskIdApi () {

        return axios.post('https://api.anti-captcha.com/createTask', {
            "clientKey": "e2513609e3b73ad96181a9370e517bb6",
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

    getKeyCaptchaResolved (taskId) {
        return axios.post('https://api.anti-captcha.com/getTaskResult', {
            "clientKey":"e2513609e3b73ad96181a9370e517bb6",
            "taskId": taskId
        })
            .then((res) => {
                // console.log(`statusCode: ${res.status}`)
                // console.log(res.data)
                return res.data
            })
            .catch((error) => {
                console.error(error)
            })
    }

}
module.exports = CaptchaV2