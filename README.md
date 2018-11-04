#### Create and setup project in Actions Console

1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing and click *Create Project*.
1. Click *Home Control*, then click *Smart Home*.
1. On the left navigation menu under *SETUP*, click on *Invocation*.
1. Add your App's name. Click *Save*.
1. On the left navigation menu under *DEPLOY*, click on *Directory Information*.
1. Add your App info, including images, a contact email and privacy policy. This information can all be edited before submitting for review.
1. Click *Save*.

#### Add Request Sync
The Request Sync feature allows a cloud integration to send a request to the Home Graph
to send a new SYNC request.

1. Navigate to the
[Google Cloud Console API Manager](https://console.developers.google.com/apis)
for your project id.
1. Enable the [HomeGraph API](https://console.cloud.google.com/apis/api/homegraph.googleapis.com/overview). This will be used to request a new sync and to report the state back to the HomeGraph.
1. Click Credentials
1. Click 'Create credentials'
1. Click 'API key'
1. Copy the API key to config.json token key
   Enable Request-Sync API using [these
   instructions](https://developers.google.com/actions/smarthome/create-app#request-sync).

#### Add Report State
The Report State feature allows a cloud integration to proactively provide the
current state of devices to the Home Graph without a `QUERY` request. This is
done securely through [JWT (JSON web tokens)](https://jwt.io/).

1. Navigate to the [Google Cloud Console API & Services page](https://console.cloud.google.com/apis/credentials)
1. Select **Create Credentials** and create a **Service account key**
1. Create the account and download a JSON file.
   jwt.json file

#### Notifier
This project allow you to send notifications to yours Google Home.

1. In the configuration file, you have to set your language ('en', 'fr', etc ...) and define your google home devices. Please, see the config.json.template file.
1. Your notification must be send by HTTP Call to `http://YOUR_SERVER:3000/speech`
1. Text and targeted devide, must be passed in query param. Eg : `http://YOUR_SERVER:3000/speech?device=YOUR_GOOGLEHOME_NAME&text=Hello`

#### Weather
This project allow you to get weather information from Netatmo Weather Station near of you.
You can find all station here : https://weathermap.netatmo.com/

1. In the configuration file, you have to set your Netatmo API Application information like clientId and clientSecret, your Netatmo credentials, and coordinate square around you
1. You can retrieve rain information by calling : `http://YOUR_SERVER:3000/weather`