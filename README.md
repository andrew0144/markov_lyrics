# Markov Lyrics Documentation
# Check out the site at [markovlyrics.com](https://markovlyrics.com)
## Explanation
Markov Lyrics is a text generator dedicated to generating song lyrics based on a corpus of text that uses Markov chains. It was creating using a React/JavaScript front end, and a Flask/Python backend. 

## Frontend
The frontend consists of one file: `App.js`, and uses React in combination with Material UI. `App.js` is a functional component that houses all of the frontend JSX and all code responsible for making requests to the backend. The frontend has 4 functions responsible for making axios requests to the backend and updating its state accordingly:

#### `generateLyrics()` :
This function submits a GET request to the backend endpoint `/generate` for the lyric generation, passing all of the relevant selections that the user has made as `params`. This data includes the length of the response, the artists selected from the database, and the user text. It also updates the component's state depending on the response via `useState()` hooks.

#### `loadArtistLyrics()` and `loadAlbumLyrics()` :
These functions submit GET requests to the backend endpoints `/loadartist` and `/loadalbum` respectively, telling it to search for the passed artist and load their top 20 songs into the markovify model, or load the passed album into the markovify model. It passes the search term for the artist as a `param`. It updates the component's state depending on the response via `useState()` hooks, and shows a MUI Snackbar Alert informing the user of whether the loading was successful. 

#### `reset()`
This function clears all of the user input, and submits a GET request to the backend endpoint `/reset`, telling it to clear any loaded lyrics scraped from Genius.

## Backend
The backend consists of the main file `app.py`, and the database of artist lyrics, which is located in the folder `/backend/artists`. The backend is architected using Python, Flask, markovify, and lyricsgenius. Markovify is the library used for creating the markov model of the text, and generating the requested lyrics. Lyricsgenius is the library used to make requests to the Genius API for data about albums. Lyricsgenius also handles the scraping of any requested lyrics from Genius. The scraped lyrics may contain various artifacts, and the generated output may sometimes include these. The functions contained on the backend are as follows:

#### `my_generation()` :
This function is ran upon any requests to the `/generate` endpoint, and responds to them with lyrics generated using the markovify model. It loads markovify models with text for the artists selected from the database, and the user text, combines these models into one, and uses this model to generate lyrics using markovify's `make_sentence()` function. It calls this function N times, where N is the passed parameter `length`.

#### `load_artist()`, `load_album()` :
These are ran upon requests to the `/loadartist` and `/loadalbum` respectively, and run the helper functions `get_artist_lyrics()` and `get_album_lyrics()`, which submit requests to the lyricsgenius api with the passed parameters (artist name or album name) and return the response.

#### `reset()` :
This function runs upon requests to the `/reset` endpoint, and resets the global variables `genius_lyrics` and `genius_sources`. Thesee variables represent the string of lyrics loaded from genius, and the list of sources loaded from genius respectively.

### Backend Helper Functions

#### `load_file_markovify(fname)` :
Loads a text file with the passed filename into a `markovify` model and returns it

#### `load_string_markovify(string)` :
Loads the passed string into a `markovify` model and returns it.

### `get_length(length)` :
Returns the integer corresponding to the passed `length` string. This integer represents the number of sentences to generate with `markovify`.

#### `get_artist_lyrics(artist_name)`, `get_album_lyrics(album_name)` :
These submit requests to the lyricsgenius api with the passed parameters (artist name or album name) and return the response containing the lyrics scraped from Genius.

### How Markov Lyrics was set up on the AWS EC2 instance
First, the EC2 instance was set up with Ubuntu, and configured with python, flask, markovify, lyricsgenius, Nginx, npm, pip, Gunicorn, and any other dependency. The frontend was built using the command `npm run build`, and copied to the Nginx directory `/var/www/html`. The backend was copied and sent to the directory `~/markov_proj`. Finally, the backend was started with `gunicorn -b 0.0.0.0:8000 app:api`, and Nginx was started with `sudo service nginx start`. 
