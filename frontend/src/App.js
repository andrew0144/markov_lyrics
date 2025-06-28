import { useState } from "react";
import axios from "axios";
import "./App.css";
import * as React from "react";
import {
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Autocomplete,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Container,
  Fab,
  Box,
  Fade,
  Backdrop,
  Modal
} from "@mui/material";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from "@emotion/react";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import LinearProgress from '@mui/material/LinearProgress';
import HelpIcon from '@mui/icons-material/Help';

// localhost url
axios.defaults.baseURL = "http://localhost:8000"; 

// axios.defaults.baseURL = "http://34.227.157.72:8000/";
// sets up the material ui theme for the app
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7986cb',
    },
    secondary: {
      main: '#f50057',
    },
    text: {
      primary: '#7986cb',
    },
  },
  typography: {
    fontFamily: 'Montserrat',
    fontSize: 17,
  },
});

function App() {
  // some state hook setup
  const [songLyric, setSongLyric] = useState(null);
  const [length, setLength] = useState("one-line");
  const [checked, setChecked] = useState([]);
  const [text, setText] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isSearchingArtist, setIsSearchingArtist] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [isSearchingAlbum, setIsSearchingAlbum] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpenAlbum, setSuccessOpenAlbum] = useState(false);
  const [errorOpenAlbum, setErrorOpenAlbum] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const artists = [
    "adele",
    "al-green",
    "alicia-keys",
    "amy-winehouse",
    "beatles",
    "bieber",
    "bjork",
    "blink-182",
    "bob-dylan",
    "bob-marley",
    "britney-spears",
    "bruce-springsteen",
    "bruno-mars",
    "cake",
    "dickinson",
    "disney",
    "dj-khaled",
    "dolly-parton",
    "dr-seuss",
    "drake",
    "eminem",
    "janisjoplin",
    "jimi-hendrix",
    "johnny-cash",
    "joni-mitchell",
    "Kanye_West",
    "lady-gaga",
    "leonard-cohen",
    "Lil_Wayne",
    "lin-manuel-miranda",
    "lorde",
    "ludacris",
    "michael-jackson",
    "missy-elliott",
    "nickelback",
    "nicki-minaj",
    "nirvana",
    "notorious_big",
    "nursery_rhymes",
    "patti-smith",
    "paul-simon",
    "prince",
    "r-kelly",
    "radiohead",
    "rihanna",
  ];

  const fabStyle = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    border: '2px solid white',
    backgroundColor: '#7986cb',
    borderRadius: '10px',
    color: 'white',
    p: 4,
  };

  // gets the generated lyrics from the backend using an axios request
  function generateLyrics() {
    console.log(length);
    axios({
      method: "GET",
      url: "/generate",
      params: {
        length: length,
        artists: JSON.stringify(checked.map((name) => name + ".txt")),
        user_text: text,
      },
    })
      .then((response) => {
        const res = response.data;
        setSongLyric({
          artists: res.text_dataset,
          text: res.text,
        });
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  // loads the lyrics for the artist to the backend using an axios request
  function loadArtistLyrics() {
    setIsSearchingArtist(true);
    axios({
      method: "GET",
      url: "/loadartist",
      params: {
        artistName: artistName
      },
    })
      .then((response) => {
        setSuccessOpen(true);
        setIsSearchingArtist(false);
        const res = response.data;
        console.log(res);
      })
      .catch((error) => {
        if (error.response) {
          setErrorOpen(true);
          setIsSearchingArtist(false);
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  // loads the lyrics for the album to the backend using an axios request
  function loadAlbumLyrics() {
    console.log(length);
    setIsSearchingAlbum(true);
    axios({
      method: "GET",
      url: "/loadalbum",
      params: {
        albumName: albumName
      },
    })
      .then((response) => {
        setSuccessOpenAlbum(true);
        setIsSearchingAlbum(false);
        const res = response.data;
        console.log(res);
      })
      .catch((error) => {
        if (error.response) {
          setErrorOpenAlbum(true);
          setIsSearchingAlbum(false);
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  function reset() {
    setSongLyric(null);
    setLength("one-line");
    setChecked([]);
    setText("");
    setArtistName("");

    axios({
      method: "GET",
      url: "/reset"
    })
      .then((response) => {
        const res = response.data;
        console.log(res);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  // the app's JSX. did not break up into sub-components since the app is fairly simple and only one page
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
      <header className="App-header">
        <h1>Markov Chain Song Lyric Generator</h1>
              <FormControl>
        <Autocomplete
          id="autocomplete-checkboxes"
          sx={{ width: 675, marginBottom: 2}}
          value={checked}
          multiple
          options={artists}
          getOptionLabel={(option) => option}
          onChange={(event, newValue) => {setChecked(newValue) }}
          renderInput={(params) => (
            <TextField
             sx={{ paddingTop: 0.5 }}
              {...params}
              variant="standard"
              label="Artists Selected From Database"
              placeholder="Choose Artists.."
            />
          )}
        />
      </FormControl>

      <Container sx={{ maxWidth: '100%'}}>
      <FormControl sx={{ marginRight: 4, width: 400}}>
        <FormLabel sx={{ m: 1, textAlign: "left" }} id="demo-radio-buttons-group-label">Load Artist's Top 20 songs From Genius</FormLabel>
        <TextField value={artistName} id="outlined-basic" label="Artist Name" variant="outlined" placeholder="Enter Artist's Name" onChange={(event) => setArtistName(event.target.value)}/>
        <Button sx={{ m: 2}} variant="contained" onClick={loadArtistLyrics}>Load Artist's Lyrics</Button>
        {isSearchingArtist && (<LinearProgress />)}
      </FormControl>

      <FormControl sx={{ marginRight: 4, width: 400}}>
        <FormLabel sx={{ m: 1, textAlign: "left" }} id="demo-radio-buttons-group-label">Load Album's Lyrics From Genius</FormLabel>
        <TextField value={albumName} id="outlined-basic" label="Album Name" variant="outlined" placeholder="Enter a Search Term for an Album.." onChange={(event) => setAlbumName(event.target.value)}/>
        <Button sx={{ m: 2}} variant="contained" onClick={loadAlbumLyrics}>Load Album's Lyrics</Button>
        {isSearchingAlbum && (<LinearProgress />)}
      </FormControl>

      <FormControl>
      <FormLabel sx={{ m: 1, textAlign: "left" }} id="demo-radio-buttons-group-label">Length</FormLabel>
        <RadioGroup
        value={length}
          onChange={(event) => setLength(event.target.value)}
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="one-line"
          name="radio-buttons-group"
        >
          <FormControlLabel
            value="one-line"
            control={<Radio />}
            label="One Liner"
          />
          <FormControlLabel value="verse" control={<Radio />} label="Verse" />
          <FormControlLabel
            value="song"
            control={<Radio />}
            label="Full Song"
          />
        </RadioGroup>
      </FormControl>
      </Container>

      <FormControl>
        <FormLabel sx={{ m: 1, textAlign: "left" }} id="user-text-label">User Text</FormLabel>
      <TextareaAutosize
      value={text}
      aria-label="user_text"
      minRows={3}
      maxRows={8}
      placeholder="Enter your text here.."
      style={{ width: 500, minWidth: 500, m: 2, padding: 2 }}
      onChange={(event) => setText(event.target.value)}
    />
      </FormControl>
      

      <Container maxWidth="sm">
        <Button sx={{ m: 2}} variant="contained" onClick={generateLyrics}>Generate Song Lyric</Button>
        <Button sx={{ m: 2}} variant="contained" onClick={reset}>Reset</Button>
      </Container>
      
      <Typography sx={{justifyContent: 'center', width: 800}}>
      {songLyric && (
        <div>
            <Typography sx={{fontSize: 25, marginBottom: -2, fontWeight: "bold", textDecoration: "underline"}}>{songLyric.artists && <span>Generated Song Lyric using {songLyric.artists}</span>}</Typography><br></br>
            {songLyric.text}
        </div>
      )}
      </Typography>

      <Snackbar open={successOpen} autoHideDuration={6000} onClose={()=> setSuccessOpen(false)}>
        <Alert onClose={()=> setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Loaded Lyrics From the Top 20 Songs by {artistName}
        </Alert>
      </Snackbar>

      <Snackbar open={errorOpen} autoHideDuration={6000} onClose={() => setErrorOpen(false)}>
        <Alert onClose={()=> setErrorOpen(false)} severity="error" sx={{ width: '100%' }}>
          Failed to Load {artistName}'s Lyrics. Please try again or check spelling.
        </Alert>
      </Snackbar>

      <Snackbar open={successOpenAlbum} autoHideDuration={6000} onClose={()=> setSuccessOpenAlbum(false)}>
        <Alert onClose={()=> setSuccessOpenAlbum(false)} severity="success" sx={{ width: '100%' }}>
          Loaded Lyrics From the Album "{albumName}".
        </Alert>
      </Snackbar>

      <Snackbar open={errorOpenAlbum} autoHideDuration={6000} onClose={() => setErrorOpenAlbum(false)}>
        <Alert onClose={()=> setErrorOpenAlbum(false)} severity="error" sx={{ width: '100%' }}>
          Failed to Load Lyrics from the Album "{albumName}"". Please try again or check spelling.
        </Alert>
      </Snackbar>

        <Fab style={fabStyle} color="primary" aria-label="add" onClick={()=> setModalOpen(true)}>
          <HelpIcon />
        </Fab>

        <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={modalOpen}
        onClose={()=> setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={modalStyle}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              About this App
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              This app uses Markov Chains to generate song lyrics from a corpus of text.<br></br><br></br>
              You can select any number of artists from the database, and the app will generate lyrics based on the text from all of their songs.
              <br></br><br></br>
               If you don't see your favorite artist, type their name in the "Load Artist's Top 20 Songs From Genius" field and click the "Get Artist's Lyrics" button, and the app will use the lyrics from their top 20 songs."
               You can also get the lyrics for an album by typing in the "Album Name" field, and clicking the "Get Album's Lyrics" button. These options may include undesired text in the output, since they scrape the lyrics from the Genius website.
               <br></br><br></br>For extra customization, you can enter your own text into the "User Text" field, and the app will generate lyrics based on that text. 
               <br></br><br></br>Lastly, you can select the length of the generated output. To clear all inputs and unload any lyrics loaded from Genius, hit the "Reset" button."
            </Typography>
          </Box>
        </Fade>
      </Modal>
      </header>

      </ThemeProvider>
    </div>
  );
}

export default App;
