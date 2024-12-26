# Makina Presence

Makina Presence is an app that allow a group of individual to organize the usage of their working space, by giving them a tool that enable each partner to book their future working station.

> [I. Installation](#installation)


## I. Installation

- **Clone the repository**

- **Get the dependencies**
```
npm ci
```

- **Add your token & table**

Create a `.env` file at the root of the projet, then complete the following lines with your private TOKEN and IDs :
```
VITE_BASEROW_TOKEN=YOUR_TOKEN_HERE
VITE_TABLE_ID_SPOTS=
VITE_TABLE_ID_PRESENCES=
VITE_TABLE_ID_PLANS=
VITE_TABLE_ID_ADDITIONALS=
```

- **Start Docker**

Create the docker image
```
docker build -t presences .
```

Start the container
```
docker compose up
```


- **Start the projet**

Run the following command at the root of your project to start your local app, then click the given link to access the website.
```
npm run dev
```