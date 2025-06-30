from flask import Flask, request, render_template, send_from_directory, make_response
from flask_cors import CORS
import json
import markovify

# initialize some variables
loaded_sources=[]
loaded_lyrics = ''

# the generate endpoint for my api, runs when the user hits the "Generate Lyrics" button on the frontend 
api = Flask(__name__, static_folder="../frontend/build/static", template_folder="../frontend/build")
CORS(api)

@api.route('/')
def home():
    return render_template("index.html");

@api.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(api.static_folder, filename)

@api.route('/favicon.ico')
def favicon():
    return send_from_directory(api.template_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Explicit route for manifest.json
@api.route('/logo192.png')
def logo():
    return send_from_directory(api.template_folder, 'logo192.png', mimetype='image/png')

# Explicit route for manifest.json
@api.route('/manifest.json')
def manifest():
    return send_from_directory(api.template_folder, 'manifest.json', mimetype='application/manifest+json')

@api.route('/generate')
def my_generation():
    print("USER TEXT: \n" + request.args['user_text'])
    print("LENGTH: \n" + request.args['length'])
    print("ARTISTS: \n" + request.args['artists'])

    # process passed arguments and check if valid
    artists = json.loads(request.args['artists'])
    user_text_exists = request.args['user_text'] != ""
    loaded_lyrics_exists = loaded_lyrics != ''
    if(artists == [] and user_text_exists == False and loaded_lyrics_exists == False):
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
    
    # load any lyrics retrieved from the lyrics api into a markovify model
    if loaded_lyrics_exists:
        model_list.append(load_string_markovify(loaded_lyrics))

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

    global loaded_sources
    # return the text and the text dataset to the frontend
    response_body = {
        "text_dataset": ", ".join(artists + loaded_sources),
        "text" : text
    }
    return response_body

@api.route('/loadlyrics')
def load_lyrics():
    lyrics = request.args['lyrics']
    artist_name = request.args['artistName']
    print(lyrics)

    global loaded_sources
    global loaded_lyrics
    if artist_name not in loaded_sources:
        loaded_sources.append(artist_name + '(Loaded)')
    loaded_lyrics += lyrics
    response = make_response("Lyrics loaded successfully")
    response.headers['Content-Type'] = 'text/plain'
    return response

@api.route('/reset')
def reset():
    global loaded_sources
    global loaded_lyrics
    loaded_sources = []
    loaded_lyrics = ''
    return "Reset"

# loads the text from the passed file into a markovify model
def load_file_markovify(fname):
    fname = 'artists/' + fname
    with open(fname, 'r', encoding='utf-8-sig') as f:
        text = f.read()
    text_model = markovify.NewlineText(text)
    return text_model

# loads the passed string into a markovify model
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

if __name__ == '__main__':
    api.run(host="0.0.0.0", port=8000)
