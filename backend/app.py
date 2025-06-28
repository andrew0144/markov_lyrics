from flask import Flask, request
from flask_cors import CORS
import json
import markovify
from lyricsgenius import Genius

# set up lyricsgenius and the Genius api
token = "P2dRqidPlTwD88gXBVWKUYTHcL9tMmugoVgEMwAcFF0idsw6E_9v9JTglUyn9CJ1"
genius = Genius(token)
genius.remove_section_headers = True
genius.skip_non_songs = True
genius.excluded_terms = ["(Remix)", "(Live)", "(Demo)"]
genius.timeout = 15
genius.retries = 3

# initialize some variables
genius_sources=[]
genius_lyrics = ''

# the generate endpoint for my api, runs when the user hits the "Generate Lyrics" button on the frontend 
api = Flask(__name__)
CORS(api)

@api.route("/")
def hello():
    return "Hello, World!"

@api.route('/generate')
def my_generation():
    print("USER TEXT: \n" + request.args['user_text'])
    print("LENGTH: \n" + request.args['length'])
    print("ARTISTS: \n" + request.args['artists'])

    # process passed arguments and check if valid
    artists = json.loads(request.args['artists'])
    user_text_exists = request.args['user_text'] != ""
    genius_lyrics_exists = genius_lyrics != ''
    if(artists == [] and user_text_exists == False and genius_lyrics_exists == False):
        return { 
            "text_dataset": "",
            "text": "No text entered or artists selected.  Please enter some text or select at least one artist." 
            }
    
    # load all the artists selected into a list of markovify models
    model_list = []
    for name in artists:
        model = load_file_markovify(name)
        model_list.append(model)

    # load the user text into a markovify model
    if user_text_exists:
        model_list.append(load_string_markovify(request.args['user_text']))
    
    # load any lyrics retrieved from the genius api into a markovify model
    if genius_lyrics_exists:
        model_list.append(load_string_markovify(genius_lyrics))

    # combine all models into one
    all_models = markovify.combine(model_list)

    # test_output determines whether the markovify model should check its output for similarity to the input text
    # for user text of small length, it will be too similar, so it is set to False
    test_output = False
    if artists != [] or len(request.args['user_text'].split()) > 25:
        test_output = True
    print(test_output)

    # try except is used here just as a failsafe
    text = ''
    try:
        for i in range(get_length(request.args['length'])):
            text = text + "\n" + all_models.make_sentence(test_output=test_output)
    except: # override test_output if input is too similar
         for i in range(get_length(request.args['length'])):
            text = text + "\n" + all_models.make_sentence(test_output=False)

    
    print(text)

    global genius_sources
    # return the text and the text dataset to the frontend
    response_body = {
        "text_dataset": ", ".join(artists + genius_sources),
        "text" : text
    }
    return response_body

@api.route('/loadartist')
def load_artist():
    name = request.args['artistName']
    print(name)

    lyrics = get_artist_lyrics(name)
    response_body = {
        lyrics: lyrics
    }
    return response_body

@api.route('/loadalbum')
def load_album():
    name = request.args['albumName']
    print(name)

    lyrics = get_album_lyrics(name)
    response_body = {
        lyrics: lyrics
    }
    return response_body

@api.route('/reset')
def reset():
    global genius_sources
    global genius_lyrics
    genius_sources = []
    genius_lyrics = ''
    return "Reset"

# loads the text from the passed file into a markovify model
def load_file_markovify(fname):
    fname = 'artists/' + fname
    with open(fname, 'r', encoding='utf-8-sig') as f:
        text = f.read()
    text_model = markovify.NewlineText(text)
    return text_model

# loads the passed string into a markovify model, user for user text or genius lyrics
def load_string_markovify(string):
    if(string != ""):
        return markovify.NewlineText(string)

# returns the number of lines of text to generate given the passed length string
def get_length(length):
    if length == "verse":
        return 2
    elif length == "song":
        return 4 
    else:
        return 1

# uses lyricsgenius and the Genius api to return a string of the lyrics for the artist's top 20 songs on Genius
def get_artist_lyrics(artist_name):
    artist = genius.search_artist(artist_name, sort="popularity", max_songs=20, get_full_info=False, include_features=False)
    print(artist.songs)
    lyrics = ''

    for song in artist.songs:
        lyrics += song.lyrics
    global genius_lyrics
    global genius_sources
    genius_sources.append(artist_name + '(Genius)')
    genius_lyrics += lyrics
    print(genius_lyrics)
    return lyrics

# uses lyricsgenius and the Genius api to return a string of the lyrics for the artist's top 20 songs on Genius
def get_album_lyrics(album_name):
    album = genius.search_album(album_name)

    for track in album.tracks:
        print(json.loads(track.to_json())['song']['title'])
    lyrics = ''

    for track in album.tracks:
        lyrics += track.to_text()
    global genius_lyrics
    global genius_sources
    genius_sources.append(album_name + '(Genius)')
    genius_lyrics += lyrics
    return lyrics

if __name__ == '__main__':
    api.run(host="0.0.0.0", port=8000)
