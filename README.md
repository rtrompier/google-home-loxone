# GOOGLE HOME FOR LOXONE

## Requirements

To use this plugin, you have to create your own SmartHome project in google : https://developers.google.com/assistant/smarthome/develop/create

### Set up an OAuth 2.0 server

We suggest to use the free oauth 2.0 server : OAuth0

1. Create an account or login
1. Create a new application (Eg : Google Home)
1. In **Allowed Callback URLs** section, add https://oauth-redirect.googleusercontent.com/r/YOUR_GOOGLE_PROJECTNAME

### Create an Actions on Google developer project

1. Use your Oauth0 App ClientId et ClientSecret, created before, in the Account Linking Section
![Account Linking](readme/account-linking.png?raw=true "Account Linking")
1. In the Fulfillment section, use the **google-home-loxone** url (Eg : http://YOUR_IP:3000/smarthome). It must be accessible from the cloud.


### Request State Config
The Report State feature allows a cloud integration to proactively provide the
current state of devices to the Home Graph without a `QUERY` request. This is
done securely through [JWT (JSON web tokens)](https://jwt.io/).

1. Navigate to the [Google Cloud Console API Manager](https://console.developers.google.com/apis) for your project id.
1. Enable the [HomeGraph API](https://console.cloud.google.com/apis/api/homegraph.googleapis.com/overview). This will be used to request a new sync and to report the state back to the HomeGraph.
1. Click Credentials
1. Click 'Create credentials'
1. Click 'Service Account'
1. Create a new service account by folling steps (without specific role)
1. Edit the service account and add a new JSON key
1. Download the key and save it in your home directory ~/.google-home-loxone/jwt.json
   
## How to start

### Installation

Install the plugin through npm or download the files from here.

```sh
$ sudo npm install -g google-home-loxone
```
Or update to latest version when already installed:
```sh
$ sudo npm update -g google-home-loxone
```

### Configuration

Create a config.json file (usually in ~/.google-home-loxone) to allow the plugin to connect to your loxone server
```
{
  "loxone": {
    "url": "LOXONE_IP", // Your loxone IP or hostname
    "user": "LOXONE_USER, // Your loxone username
    "password": "LOXONE_PASSWORD" // Your loxone password
  },
  "oAuthUrl": "https://rtrompier.eu.auth0.com", // Your oAuthUrl provided by Oauth0
  "authorizedEmails": [
    "remy.trompier@gmail.com" // The emails of the users will be allowed to call your server
  ],
  "agentUserId": "loxone-12345", // The name of your app
  "log": true // Activate verbose mode
  
  // This section is used for vocals notifications
  "notifier": {
    "lang": "fr",
    "devices": [
      {
        "name": "Salon",
        "ip": "192.168.1.241"
      },
      {
        "name": "Chambre",
        "ip": "192.168.1.240"
      }
    ]
  },

  // This section is used for weather values
  "weather": {
    "clientId": "NETATMO_CLIENTID", // Your netatmo client id
    "clientSecret": "NETATMO_SECRET", // Your netatmo secret
    "username": "remy.trompier@gmail.com", // Your netatmo user 
    "password": "NETATMO_PASSWORD", // Your netatmo password
    
    // Used to scan around this position
    "lat_ne": "46.287387014741256",
    "lon_ne": "6.045639831542985",
    "lat_sw": "46.280040021426814",
    "lon_sw": "6.0173522720336905"
  }
}
```

### Start 

```sh
$ google-home-loxone
```

To see all options you can start with help arguments:
```sh
$ google-home-loxone --help
```

You can pass the following params : 
* **port** The port used by the google-home-loxone server
* **jwt** The path of your jwt.json file, created in Google Cloud Console
* **config** The path of your config.json file, to configure the application


### Notifier
This project allow you to send notifications to yours Google Home.

1. In the configuration file, you have to set your language ('en', 'fr', etc ...) and define your google home devices. Please, see the config.json.template file.
1. Your notification can be send by HTTP Call to `http://YOUR_SERVER:3000/speech`
1. Text and targeted devide, must be passed in query param. Eg : `http://YOUR_SERVER:3000/speech?device=YOUR_GOOGLEHOME_NAME&text=Hello`
1. You can now configure your loxone server, to send vocal notification to your google home (Eg : "Alarm will be armed in 60 seconds")

### Weather
This project allow you to get weather information from Netatmo Weather Station near of you.
You can find all station here : https://weathermap.netatmo.com/

1. In the configuration file, you have to set your Netatmo API Application information like clientId and clientSecret, your Netatmo credentials, and coordinate square around you (you can use https://developers.google.com/maps/documentation/javascript/examples/rectangle-event)
1. You can retrieve weather informations by calling : `http://YOUR_SERVER:3000/weather`
1. You can now configure your loxone server, to parse result and get weather informations for free.
