
    let boeken = [];
    let huidigJaar;

// --- Huidig jaar instellen (W3S) ------------------------------------
    
    document.addEventListener("DOMContentLoaded", function() {
        huidigJaar = new Date().getFullYear();
        document.getElementById("huidigJaar").textContent = huidigJaar;
        berekenGoal();
        loadBoekenFromLocalStorage();

// --- Eventlisteners (W3S) ------------------------------------
        document.getElementById("boekForm").addEventListener("submit", function(event) {
            event.preventDefault(); 
            addBoek(event);
            berekenGoal();
        });

        document.getElementById("goal").addEventListener("input", berekenGoal);

        document.getElementById("annulerenKnop").addEventListener("click", function() {
            document.getElementById("boekForm").reset();
            document.getElementById("boekIndex").value = "";
        });
    });
    
// ---- de boeken op geheugen zetten, zodat de gebruiker niet steeds opnieuw al zijn boeken moet invullen ---
// ---- hulpbron: https://dev.to/anshuman_bhardwaj/the-right-way-to-use-localstorage-in-javascript-41a0 -----
document.addEventListener("DOMContentLoaded", function() {
    loadBoekenFromLocalStorage();
    let opgeslagenGoal = localStorage.getItem("boekenGoal"); // slaat het boekengoal op
    if (opgeslagenGoal) {
        document.getElementById("goal").value = opgeslagenGoal;
    }
    berekenGoal();
});

function loadBoekenFromLocalStorage() {
    let geheugenBoeken = localStorage.getItem("boeken");
    if (geheugenBoeken) { // als er boeken in het geheugen zitten, dan worden ze displayed en de boekengoal wordt dan berekend.
        boeken = JSON.parse(geheugenBoeken);
        displayBoeken();
    }
}

// --- Boekcovers vinden ------------------------------------
// --- Bron: https://github.com/w3slley/bookcover-api --------------------------------
//     Deze bron heb ik gebruikt omdat deze optie geen API key nodig had.
      
    async function vindBoekCover(titel, auteur) {
        const encodeerdeTitel = encodeURIComponent(titel); // geëncodeerd zodat de spaties naar 20% worden omgezet in de url
        const encodeerdeAuteur = encodeURIComponent(auteur);
        const url = `https://bookcover.longitood.com/bookcover?book_title=${encodeerdeTitel}&author_name=${encodeerdeAuteur}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data.url; 
        } else {
            return ''; // als er geen cover is te vinden, zorgt de functie ervoor dat er een lege string wordt gegeven, zodat er geen error komt. 
        }
        
    }


// --- Laden van gegevens bij het opstarten van de boekenplank
    
    loadBoekenFromLocalStorage();
    
// --- Boek toevoegen async voor de cover url ------------------------------------
// --- Hulpbron: https://codingnomads.com/javascript-event-method-preventdefault

    async function addBoek(event) {
      event.preventDefault(); // geen refresh
      let titel = document.getElementById("titel").value;
      let auteur = document.getElementById("auteur").value;
      let begonnen = document.getElementById("begonnen").value;
      let uitgelezen = document.getElementById("uitgelezen").value;
      let review = document.getElementById("review").value;
        
      let coverUrl = await vindBoekCover(titel, auteur)
        
      let boekIndex = document.getElementById("boekIndex").value; 
        // boekindex voor bewerken van boek
      if (boekIndex !== "") { 
        // als boekindex niet leeg is, dan wordt een boek bewerkt
          boeken[boekIndex] = { titel, auteur, begonnen, uitgelezen, review, coverUrl };
      } else { 
        // als boekenindex wel leeg is, wordt een boek toegevoegd, en dan in de array gepusht.
          let boek = { titel, auteur, begonnen, uitgelezen, review, coverUrl };
          boeken.push(boek);
      }
      // W3S
      localStorage.setItem("boeken", JSON.stringify(boeken));
      document.getElementById("boekForm").reset()
      document.getElementById("boekIndex").value = "";
      displayBoeken();
      berekenGoal();

   }
// --- Boeken laten zien op de boekenplank  -----------------------

  function displayBoeken() {
      let boekenlijst = document.getElementById("boekenlijst");
      boekenlijst.innerHTML = ""; 
    

      boeken.forEach(function(boek,index) { // w3s
        let listItem = document.createElement("li"); 
        let tekst = `${boek.titel} van ${boek.auteur}`; // Dit moet er sowiezo in staan, de begindatum, einddatum, en review zijn optioneel
        
        if (boek.begonnen) {
          tekst += `<br>Begonnen op: ${boek.begonnen}`;
        }
        if (boek.uitgelezen) {
          tekst += `<br>Uitgelezen op: ${boek.uitgelezen}`;
        }
        if (boek.review) {
          tekst += `<br>Review: ${boek.review}`;
        }
        listItem.innerHTML = tekst;

        if (boek.coverUrl) {
            let coverImage = document.createElement("img");
            coverImage.src = boek.coverUrl;
            coverImage.style.maxWidth = "100px"; 
            listItem.appendChild(coverImage);  // hulpbron: https://stackoverflow.com/questions/2735881/adding-images-to-an-html-document-with-javascript
        }

// --- Bewerkknop W3S ------------------------------------
        let knoppenDiv = document.createElement("div");
        knoppenDiv.classList.add("knoppen");
        
        let bewerkButton = document.createElement("button");
        bewerkButton.textContent = "Bewerk";
        bewerkButton.classList.add("bewerk-button");
        bewerkButton.addEventListener("click", function () {
          vulFormVoorBewerken(index); // als er wordt bewerkt, dan wordt de form ingevuld.
        });
    
// --- Verwijderknop 
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Verwijder";
        deleteButton.classList.add("verwijder-button");
    
        deleteButton.addEventListener("click", function () {
          verwijderBoek(index); // Verwijder het boek uit de array
         
        });
        knoppenDiv.appendChild(bewerkButton); // W3S
        knoppenDiv.appendChild(deleteButton); 
        listItem.appendChild(knoppenDiv);

        boekenlijst.appendChild(listItem);
    });
  }
    
// ----------------------------- Form vullen voor het bewerken  -----------------------

    function vulFormVoorBewerken(index) {
      let boek = boeken[index];
      document.getElementById("titel").value = boek.titel;
      document.getElementById("auteur").value = boek.auteur;
      document.getElementById("begonnen").value = boek.begonnen;
      document.getElementById("uitgelezen").value = boek.uitgelezen;
      document.getElementById("review").value = boek.review;

      document.getElementById("boekIndex").value = index; // het index van het bewerkte boek bijhouden
    }


// ----------------------------- Functie voor boek verwijderen  -----------------------
    
    function verwijderBoek(index) { 
      boeken.splice(index, 1); // Verwijder het boek uit de array W3S
      localStorage.setItem("boeken", JSON.stringify(boeken)); // Update geheugen na het verwijderen
      berekenGoal();
      displayBoeken();
    }
    
// ----------------------------- Functie voor boekengoal  -----------------------
    function berekenGoal() {
      let goal = parseInt(document.getElementById("goal").value); 
      let boekenGelezen = boeken.filter(boek => boek.uitgelezen && new Date(boek.uitgelezen).getFullYear() === huidigJaar).length; // hulpbron: https://stackoverflow.com/questions/60687575/filtering-objects-by-year-in-javascript, ik heb gekeken wat voor functies mensen gebruikten voor filters

      let boekenTelezen = goal - boekenGelezen;
      let percentage = (boekenGelezen / goal) * 100;
      
      let boekengoal = document.getElementById("boekengoal");
      if (boekenGelezen === 0) {
          boekengoal.innerHTML = `Je hebt nog geen boeken gelezen in ${huidigJaar}, begin snel!`;
      } else if (boekenGelezen === goal && goal === 1){
        boekengoal.innerHTML = `Gefeliciteerd! je hebt ${boekenGelezen} boek gelezen in ${huidigJaar}. Dat betekent je jouw boekengoal hebt bereikt!`; // toegevoegd zodat er niet staat "je hebt 1 boeken gelezen."
      } else if (boekenGelezen >= goal) {
        boekengoal.innerHTML = `Gefeliciteerd! je hebt al ${boekenGelezen} boeken gelezen in ${huidigJaar}. Dat betekent je jouw boekengoal hebt bereikt!`;
      } else if (boekenGelezen === 1) {
          boekengoal.innerHTML = `Je hebt 1 boek gelezen in ${huidigJaar}. Nog ${boekenTelezen} te gaan. Je bent op ${percentage.toFixed(2)}% van je boekengoal.`; // toegevoegd zodat er niet staat "je hebt 1 boeken gelezen."
      } else {
          boekengoal.innerHTML = `Je hebt ${boekenGelezen} boeken gelezen in ${huidigJaar}. Nog ${boekenTelezen} te gaan. Je bent op ${percentage.toFixed(2)}% van je boekengoal.`;
      }
      localStorage.setItem("boekenGoal", goal.toString()); // boekengoal opslaan in localstorage
    }

