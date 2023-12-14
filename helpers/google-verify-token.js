const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const validarGoogleIdToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: [
                process.env.GOOGLE_CLIENT_ID,
                process.env.ANDROID_GOOGLE_CLIENT_ID
            ],  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        return {
            name: payload['name'],
            picture: payload['picture'],
            email: payload['email'],
            userid: userid
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = {
    validarGoogleIdToken
}