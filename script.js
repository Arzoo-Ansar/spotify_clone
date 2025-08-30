
console.log("Welcome to Javascript")
let currentsong = new Audio();
let songs;
let currFolder;
function convertSecondsToMMSS(seconds) {
    if(isNaN(seconds) || seconds <0){
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2,'0');  
    const formattedSeconds =  String(remainingSeconds).padStart(2,'0');

    return `${formattedMinutes }:${formattedSeconds }`;
}

async function getsongs(folder) {
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let links = div.getElementsByTagName("a");
    songs = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(link.href.split(`/${folder}/`)[1]);   ///yha 1 isliye likhe taaki link ke baad jo song ka name hao wahi visible ho screen pe
        }
    }


    //Show all the songs in the playlist
     let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
     songUL.innerHTML = ""
     for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                        <img class="invert" src="music.svg" alt="">
                        <div class="info">
                             <div> ${song.replaceAll("%20"," ") .replace(/^\d+\s*-\s*/, " ").replace(/-?\s*PagalSongs.*?(\.com)?(.mp3)/, " ").replace(/\.mp3$/i, "")  }</div>
                            <div></div>
                        </div>
                        <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg" alt="">
                        </div></li>`;
     }
     //attach an event listener to each song
     Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
     })
     return songs;
}
  const playMusic=(track,pause=false) => { 
    // let audio = new Audio("/songs/" + track) //yha pe ek time pe bhut sare song play ho ja rhe the isliye
    currentsong.src = `/${currFolder}/` + track 
  //yeh use krenge isse ek time me ek he song play hoga
     if(!pause){
    currentsong.play()
    play.src = "pause.svg"
     }
    document.querySelector(".songinformation").innerHTML = decodeURI(track)
    document.querySelector(".songtiming").innerHTML = "00:00 / 00:00"

  }
    async function displayAlbums(){
        let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
      let array = Array.from(anchors)
      for (let index = 0; index < array.length; index++) {
        const e = array[index];

      if(e.href.includes("/songs")){
        let folder = e.href.split("/").slice(-1)[0]
        //Get the meta data of the folder
        try{
         let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
         let response = await a.json()
         console.log(response);
         cardContainer.innerHTML = cardContainer.innerHTML +   `<div data-folder="${folder}" class="card border">
                        <div class="icon-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                     <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke-width="1.5" stroke-linejoin="round"/>
                     </svg>
                     </div>
                  <img src="/songs/${folder}/cover.jpg" alt="">
                  <h3>${response.title}</h3>
                  <p>${response.descriptions}</p>
                  </div>`;
                  } catch (err) {
        console.error(`Error loading JSON for ${folder}:`, err.message);
      }
      }
      }
    //Load the PlayList whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            console.log(item,item.currentTarget.dataset)
            songs = await getsongs(`songs/${ item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
// this function await for the above function to complete


   async function main() {

    //get the list of all the songs
    await getsongs("songs/ncs")
    playMusic(songs[0],true)

    //Display all the albums on the page
    displayAlbums()

     //Attach an event listener to play,next and previous
     play.addEventListener ("click", () => {
        if(currentsong.paused){
            currentsong.play();
            play.src = "pause.svg"
        }else{
            currentsong.pause();
             play.src = "play.svg"
        }
     })
     //Listen for time update
     currentsong.addEventListener ("timeupdate",() => {
       console.log(currentsong.currentTime,currentsong.duration)
       document.querySelector(".songtiming").innerHTML= `${convertSecondsToMMSS(currentsong.currentTime)}/${convertSecondsToMMSS(currentsong.duration)}`
       document.querySelector(".circle").style.left = (currentsong.currentTime/ currentsong.duration) * 100 +"%";
    })

    //Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent =(e.offsetX/e.target.getBoundingClientRect().width) *100;
      document.querySelector(".circle").style.left = percent + "%";
      currentsong.currentTime = ((currentsong.duration) * percent) /100

    })
    //add an event listener to open hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0";
    })
     //add an event listener to close hamburger
     document.querySelector(".close-icon").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-130%";
    })
    //add an event listener to previos and next
    previous.addEventListener("click",()=>{
        ("previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1) >= 0)
            playMusic(songs[index-1])
    })
     next.addEventListener("click",()=>{
        ("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length)
            playMusic(songs[index+1])
    })
    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        ("Setting volume to",e.target.value,"/100")
        currentsong.volume = parseInt(e.target.value)/100 
        if(currentsong.volume>0){
            document.querySelector(".volume>img").src =  document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
        }
    })
    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
           e.target.src= e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume= 0;
             document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
           e.target.src =  e.target.src.replace("mute.svg","volume.svg");
            currentsong.volume = .10;
             document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    
    }

    //Play a song
//     var audio = new Audio(songs[0])
//     audio.play();

//     audio.addEventListener("loadeddata", () => {
//   // The duration variable now holds the duration (in seconds) of the audio clip
//     console.log(audio.duration, audio.currentSrc, audio.currentTime)
// });
// }

main();
