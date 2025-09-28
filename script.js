let currentsong = new Audio();
let songs;
let currentfolder;

// format duration of song into mm:ss
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  seconds = Math.floor(seconds);
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  if (minutes < 10) minutes = "0" + minutes;
  if (secs < 10) secs = "0" + secs;
  return `${minutes}:${secs}`;
}

// fetch songs from songs folder
async function getSongs(folder) {
  
  // Fetch the album's info.json
  const response = await fetch(`songs/${folder}/info.json`);
  const data = await response.json();

  // Return the list of songs from JSON
  return data.songs; 
}


//play music and pause music based on current state of track 
const playmusic = (track, element, currentfolder) => {
  const liplay = element.querySelector(".playnow img");
  const mainPlay = document.getElementById("play");
  document.querySelectorAll(".songList li").forEach(e => {
    e.querySelector(".playnow img").src = "/svgfolder/playerplay.svg";
  });
  if (currentsong.src.endsWith(track)) {
    if (currentsong.paused) {
      currentsong.play();
      liplay.src = "/svgfolder/pause.svg";
      mainPlay.src = "/svgfolder/pause.svg";
    }
    else {
      currentsong.pause();
      liplay.src = "/svgfolder/playerplay.svg";
      mainPlay.src = "/svgfolder/playerplay.svg";
    }
  }
  else {
    currentsong.src = `songs/${currentfolder}/${track}`;
    const circle = document.querySelector(".circle");
    circle.style.transition = `none`;
    circle.style.left = `0%`;
    circle.offsetHeight;
    circle.style.transition = "left 0.5s ease-in-out"
    currentsong.play();
    liplay.src = "/svgfolder/pause.svg";
    mainPlay.src = "/svgfolder/pause.svg";
    document.querySelector(".circle").style.left = `0%`;
  }
  let songname = element.querySelector(".info").firstElementChild.innerText.trim().split(".mp3")[0];
  document.querySelector(".songinfo").innerText = songname;
  document.querySelector(".volume").style.display = 'flex';
}

//fetch different songs folders from songs directory as cards
async function displayalbums() {
  const res = await fetch("songs/albums.json");
  const data = await res.json();
  const albums = data.albums;
  let html = '';
  for (let e of albums) {
      let folder = e;
      let a = await fetch(`songs/${folder}/info.json`)
      let response = await a.json();
      html += `
      <div class="card" data-folder="${folder}">
                    <div class="play">
                        <img src="svgfolder/play.svg" alt="playbutton" >
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="cover image" class="rounded" >
                    <h2>${response.title}</h2>
                    <p>${response.Description}</p>
                </div>
      `;
  }
  document.querySelector(".card-container").innerHTML = html;
}

async function main() {
  await displayalbums();
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      const folder = item.currentTarget.dataset.folder;
      if(folder===currentfolder)return;
      currentfolder=folder;
      songs = await getSongs(currentfolder);
      let songul = document.querySelector(".songList ul");
      songul.innerHTML = ``;
      for (let song of songs) {
        songul.innerHTML += `<li>
                <img src="svgfolder/music.svg" alt="music" />
                <div class="info">
                  <div class="nowrap">${song}</div>
                </div>
                <div class="playnow">
                  <img src="svgfolder/playerplay.svg" alt="play now">
                </div></li>`;
      }
      Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
          playmusic(e.querySelector(".info").firstElementChild.innerText.trim(), e, currentfolder);
        })
      });
    })
  });

  const play = document.getElementById("play");
  play.addEventListener("click", () => {
    if (!currentsong.src) return;
    if (currentsong.paused) {
      currentsong.play();
      play.src = "/svgfolder/pause.svg";
      document.querySelectorAll(".songList li").forEach(e => {
        let songname = e.querySelector(".info").firstElementChild.innerText.trim();
        let icon = e.querySelector(".playnow img");
        if (currentsong.src.endsWith(songname)) {
          icon.src = "/svgfolder/pause.svg";
        }
        else icon.src = "/svgfolder/playerplay.svg";
      });
    }
    else {
      currentsong.pause();
      play.src = "/svgfolder/playerplay.svg";
      document.querySelectorAll(".songList li").forEach(e => {
        let songname = e.querySelector(".info").firstElementChild.innerText.trim();
        let icon = e.querySelector(".playnow img");
        if (currentsong.src.endsWith(songname)) {
          icon.src = "/svgfolder/playerplay.svg";
        }
      });
    }

  });

  //update playbar time
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left = `${(currentsong.currentTime / currentsong.duration) * 100}%`;
  })

  //icons reset when song ends
  currentsong.addEventListener("ended", () => {
    play.src = "/svgfolder/playerplay.svg";
    document.querySelectorAll(".songList li").forEach(e => {
      let icon = e.querySelector(".playnow img");
      icon.src = "/svgfolder/playerplay.svg";
    });
  });

  //seekbar functionality
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.transition = `none`;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (percent * currentsong.duration) / 100;
    document.querySelector(".circle").offsetHeight;
    document.querySelector(".circle").style.transition = "left 0.5s ease-in-out";
  });

  //Hamburger menu open functionality in mobile
  document.querySelector(".hamburger-menu").addEventListener("click", () => {
    document.querySelector(".left").style.left = `0%`;
  });

  //Hamburger menu close functionality in mobile
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = `-120%`;
  });

  //previous song functionality
  document.getElementById("prev").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split(`/songs/${currentfolder}/`)[1]);
    if (index > 0) {
      let prevtrack = songs[index - 1];
      let prevelement = Array.from(document.querySelectorAll(".songList li")).find(li => li.querySelector(".info").firstElementChild.innerText.trim() === prevtrack);
      playmusic(prevtrack, prevelement, currentfolder);
    }
  });

  //next song functionality
  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split(`/songs/${currentfolder}/`)[1]);
    if ((index + 1) < songs.length) {
      let nexttrack = songs[index + 1];
      let nextelement = Array.from(document.querySelectorAll(".songList li")).find(li => li.querySelector(".info").firstElementChild.innerText.trim() === nexttrack);
      playmusic(nexttrack, nextelement, currentfolder);
    }
  });

  //volume increase and decrease
  document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
    const img = document.querySelector(".volume img");
    if (e.target.value == 0) {
      img.src = img.src.replace("volume-max-svgrepo-com.svg", "volume-mute-svgrepo-com.svg");
    }
    else {
      img.src = "/svgfolder/volume-max-svgrepo-com.svg";
    }
  })

  //volume icon change on click
  document.querySelector(".volume img").addEventListener("click", e => {
    if (e.target.src.includes("volume-max-svgrepo-com.svg")) {
      e.target.src = e.target.src.replace("volume-max-svgrepo-com.svg", "volume-mute-svgrepo-com.svg");
      currentsong.volume = 0;
      document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("volume-mute-svgrepo-com.svg", "volume-max-svgrepo-com.svg");
      currentsong.volume = 1;
      document.querySelector(".volume").getElementsByTagName("input")[0].value = 30;
    }
  })

}
main();
