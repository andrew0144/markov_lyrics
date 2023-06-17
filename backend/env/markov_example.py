from lyricsgenius import Genius
import json
token = "P2dRqidPlTwD88gXBVWKUYTHcL9tMmugoVgEMwAcFF0idsw6E_9v9JTglUyn9CJ1"
genius = Genius(token)


genius.remove_section_headers = True
genius.skip_non_songs = True
genius.excluded_terms = ["(Remix)", "(Live)"]

# album = genius.search_albums('the dark side of the moon pink floyd', per_page=1)
album = genius.search_album('the dark side of the moon')
print(album.tracks[0].to_json())
tracks = []
for track in album.tracks:
        print(json.loads(track.to_json())['song']['title'])