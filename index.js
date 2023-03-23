import dotenv from "dotenv";

dotenv.config({});

import express from "express";
import { google } from "googleapis";
import dayjs from "dayjs";
import {v4 as uuid} from "uuid";

const PORT = 5050;
const CLIENT_ID = "47867944372-ul9k71p96a6vi41d1233528or65c2j9v.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URL = "http://localhost:5050/google/redirect";
const API_KEY = "AIzaSyD015LejcK1rzEblkyRuswQfJnfICZCsoQ";


const calendar = google.calendar({
  version: "v3",
  auth: API_KEY,
});

const app = express();

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar"];
const token="";

app.get("/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const code = req.query.code;
  const {tokens}  = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log("Code",code)
  res.send({
    msg: "You have Succesfully logged In!",
    data:[code,oauth2Client.credentials.access_token]
  });
});

app.get("/scheduleMeeting", async (req, res) => {
  console.log(oauth2Client.credentials.access_token,"Access Token");
  await calendar.events.insert({
    calendarId: "primary",
    auth: oauth2Client,
    conferenceDataVersion: 1,
    requestBody: {
      summary: "Meetibg for event",
      description: "The test event for both schedule event and create meeting",
      start: {
        dateTime: dayjs(new Date()).add(1, "day").toISOString(),
        timeZone: "Asia/Kolkata"
      },
      end: {
        dateTime: dayjs(new Date()).add(2, "day").add(1,"hour").toISOString(),
        timeZone: "Asia/Kolkata"
      },
      conferenceData:{
        createRequest: {
          requestId: uuid()
        }
      },
      attendees: [
        {email: "vineethvaddi069@gmail.com"},
        {email: "parvej.pohulabs@gmail.com"},
      ],
    },
  });

  res.send({
    msg: "Done",
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port `, PORT);
});