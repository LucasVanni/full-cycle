import axios from "axios";
import { Request, Response, Router } from "express";

class DiscordAuth {
  router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/login", this.login.bind(this));
    this.router.get("/callback", this.callback.bind(this));
  }

  login(req: Request, res: Response) {
    const redirectUri = `https://discord.com/oauth2/authorize?client_id=${
      process.env.CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.REDIRECT_URI
    )}&response_type=code&scope=identify guilds.members.read`;
    res.redirect(redirectUri);
  }

  async callback(req: Request, res: Response) {
    const code = req.query.code as string;

    try {
      const accessToken = await this.getAccessToken(code);
      if (!accessToken) {
        return res.status(401).send("Unauthorized");
      }
      const inGuild = await this.isUserInGuild(
        accessToken,
        process.env.GUILD_ID
      );

      if (inGuild) {
        res.send("User is in the guild and authenticated!");
      } else {
        res.send("User is not in the guild.");
      }
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  }

  async getAccessToken(code: string) {
    if (!code) {
      return null;
    }

    try {
      const params = new URLSearchParams();
      params.append("client_id", process.env.CLIENT_ID);
      params.append("client_secret", process.env.CLIENT_SECRET);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", process.env.REDIRECT_URI);

      const response = await axios.post(
        "https://discord.com/api/oauth2/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.log("error in getAccessToken", error);
    }
  }

  async isUserInGuild(accessToken: string, guildId: string) {
    try {
      const response = await axios.get(
        `https://discord.com/api/users/@me/guilds/${guildId}/member`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data ? true : false;
    } catch (error) {
      console.log("error in isUserInGuild", error);
    }
  }
}

const discordAuth = new DiscordAuth();
export default discordAuth.router;
