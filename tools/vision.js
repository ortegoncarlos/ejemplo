class Vision {

    /**
     * @param image
     * @param mode
     * @private
     */
    constructor(image, mode = null) {
        this.image = image
        this.mode = mode
    }

    getText() {
        // Imports the Google Cloud client library
        const vision = require('@google-cloud/vision');

        // Creates a client
        const client = new vision.ImageAnnotatorClient({
            keyFilename: './tools/apiKey.json'
        });

        // Request image
        let request = this.image;

        switch (this.mode) {
            case 'url':
                request = {
                    image: {
                        source: { imageUri: this.image}
                    }
                }
                break;
            case 'buffer':
                let imageBuffer = Buffer.from(this.image, 'base64');
                request ={
                    image: { content: imageBuffer }
                };
                break;
        }

        return client
            .documentTextDetection(request)
            .then(response => {
                let res = response.shift();
                //return res;
                return res.fullTextAnnotation.text;
            })
            .catch(err => {
                console.error(err);
            });
    }

}
module.exports = Vision