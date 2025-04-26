import { OAuth2Client } from "google-auth-library";
import { env_var } from "../../config/env/env";
import axios from "axios";
import { Logger } from "../logger";

const googleClient = new OAuth2Client({
    clientId: env_var.GOOGLE_CLIENT_ID,
    clientSecret: env_var.GOOGLE_CLIENT_SECRET,
    redirectUri: env_var.GOOGLE_REDIRECT_URL
})

class GoogleAuth {
    private readonly logger = new Logger(GoogleAuth.name);

    async getAccessToken(code: string) {
        try {
            const res = await googleClient.getToken(code);
    
            return res.tokens.access_token;
        } catch (error) {
            this.logger.error(error);
        }
    }


    async getAuthenticatedUser(access_token:string) {
        try {
            const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
              });
          
              const userData = userResponse.data;

              return userData
        } catch (error) {
            this.logger.error(error);
        }
    }
}

export const googleAuth = new GoogleAuth();