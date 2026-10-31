
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDU_32nBZGnsMOD_6ZHDsg-8ISDKxOSVj0",
    authDomain: "avibe-2c7cc.firebaseapp.com",
    projectId: "avibe-2c7cc",
    storageBucket: "avibe-2c7cc.firebasestorage.app",
    messagingSenderId: "837433492503",
    appId: "1:837433492503:web:245ce123c7bcc92611c852"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const placeData = {
    Cafe: [
        { name: "Beanbox Cafe", address: "St.Agustine Bldg. San Sebastian College, CM" },
        { name: "CHN Cafe", address: "1150 España Boulevard, cor. Padre Campa St., Sampaloc, Manila" },
        { name: "Somewhere Cafe", address: "2/F 1655 Piy Margal, cor Don Quijote St, Sampaloc, Manila" },
        { name: "TOMO Coffee", address: "Concepcion Villaroman Building, Padre Campa St, Sampaloc, Manila" }
    ],
    Museum: [
        { name: "National Museum of Natural History", address: "Teodoro F. Valencia Circle, Ermita, Manila" },
        { name: "National Museum of Fine Arts", address: "Padre Burgos Ave, Barangay 666, Ermita, Manila" },
        { name: "Casa Manila Museum", address: "Plaza San Luis Complex, General Luna St, Intramuros, Manila" },
        { name: "Ayala Museum", address: "Makati Avenue corner Dela Rosa Street, Ayala Center" },
        { name: "The Mind Museum", address: "JY Campos Park, 3rd Ave, Bonifacio Global City (BGC), Taguig" },
        { name: "Pintô Art Museum", address: "Sierra Madre St, Grand Heights Subdivision, Antipolo" }
    ],
    Picnic: [
        { name: "UP Diliman Sunken Garden", address: "University of the Philippines, Diliman, Quezon City" },
        { name: "Ayala Triangle Gardens", address: "Paseo de Roxas, Makati City" },
        { name: "Rizal Park Picnic Grounds", address: "Roxas Blvd, Ermita, Manila" },
        { name: "Quezon Memorial Circle", address: "Elliptical Road, Diliman, Quezon City" }
    ],
    Mall: [
        { name: "SM Megamall", address: "EDSA corner J. Vargas Ave, Mandaluyong City" },
        { name: "Trinoma", address: "EDSA corner North Avenue, Quezon City" },
        { name: "SM North EDSA", address: "EDSA corner North Avenue, Quezon City" },
        { name: "Glorietta", address: "Ayala Center, Makati City" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById("dateSelect");
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }

    const yesCompanion = document.getElementById("yesCompanion");
    const noCompanion = document.getElementById("noCompanion");
    const companionSection = document.getElementById("companionSection");
    const nameCom = document.getElementById("nameCom");
    const relationCom = document.getElementById("relationCom");

    function toggleCompanion() {
        if (yesCompanion.checked) {
            companionSection.style.display = "block";
            nameCom.setAttribute("required", "true");
            relationCom.setAttribute("required", "true");
        } else {
            companionSection.style.display = "none";
            nameCom.removeAttribute("required");
            relationCom.removeAttribute("required");
            nameCom.value = "";
            relationCom.value = "";
        }
    }

    yesCompanion.addEventListener("change", toggleCompanion);
    noCompanion.addEventListener("change", toggleCompanion);

    const startTime = document.getElementById("startTime");
    const endTime = document.getElementById("endTime");
    const durationDisplay = document.getElementById("durationDisplay");

    function calculateDuration() {
        const start = startTime.value;
        const end = endTime.value;

        if (start && end) {
            const [startHour, startMin] = start.split(':').map(Number);
            const [endHour, endMin] = end.split(':').map(Number);

            let startDate = new Date(0, 0, 0, startHour, startMin);
            let endDate = new Date(0, 0, 0, endHour, endMin);

            let diffMs = endDate - startDate;
            if (diffMs < 0) {
                diffMs += 24 * 60 * 60 * 1000;
            }

            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            let durationText = "";
            if (diffHrs > 0) durationText += `${diffHrs} hr${diffHrs > 1 ? 's' : ''} `;
            if (diffMins > 0) durationText += `${diffMins} min${diffMins > 1 ? 's' : ''}`;

            durationDisplay.textContent = `Duration: ${durationText.trim() || '0 mins'}`;
        } else {
            durationDisplay.textContent = "";
        }
    }

    startTime.addEventListener("change", calculateDuration);
    endTime.addEventListener("change", calculateDuration);

    const categorySelect = document.getElementById("categorySelect");
    const placeCardsContainer = document.getElementById("placeCardsContainer");
    const selectedPlaceInput = document.getElementById("selectedPlaceInput");
    const locationDetailsBox = document.getElementById("locationDetailsBox");
    const exactAddressText = document.getElementById("exactAddressText");
    
    const locationContainer = document.getElementById("locationContainer");
    const customLocationBox = document.getElementById("customLocationBox");
    const customPlaceName = document.getElementById("customPlaceName");
    const customPlaceAddress = document.getElementById("customPlaceAddress");

    categorySelect.addEventListener("change", function() {
        const selectedCategory = this.value;
        placeCardsContainer.innerHTML = "";
        
        locationDetailsBox.style.display = "none";
        selectedPlaceInput.value = "";
        customPlaceName.value = "";
        customPlaceAddress.value = "";

        if (selectedCategory === "Others") {
            locationContainer.style.display = "none";
            customLocationBox.style.display = "block";
            customPlaceName.setAttribute("required", "true");
            customPlaceAddress.setAttribute("required", "true");
            return;
        } else {
            locationContainer.style.display = "block";
            customLocationBox.style.display = "none";
            customPlaceName.removeAttribute("required");
            customPlaceAddress.removeAttribute("required");
        }

        if (!selectedCategory || !placeData[selectedCategory]) {
            placeCardsContainer.innerHTML = '<p class="placeholder-text">Please select a category above to view available locations.</p>';
            return;
        }

        placeData[selectedCategory].forEach(place => {
            const chip = document.createElement("div");
            chip.classList.add("place-chip");
            chip.textContent = place.name;

            chip.addEventListener("click", () => {
                document.querySelectorAll(".place-chip").forEach(c => c.classList.remove("selected"));
                chip.classList.add("selected");
                
                selectedPlaceInput.value = place.name;
                exactAddressText.textContent = place.address;
                locationDetailsBox.style.display = "block";
            });

            placeCardsContainer.appendChild(chip);
        });
    });

    const confirmCheckbox = document.getElementById("confirmCheckbox");
    const submitButton = document.getElementById("submitButton");

    confirmCheckbox.addEventListener("change", function() {
        if (this.checked) {
            submitButton.removeAttribute("disabled");
            submitButton.classList.add("active");
        } else {
            submitButton.setAttribute("disabled", "true");
            submitButton.classList.remove("active");
        }
    });


    const formMainContainer = document.getElementById("formMainContainer");
    const successScreen = document.getElementById("successScreen");
    const successMessage = document.getElementById("successMessage");
    const resetFormBtn = document.getElementById("resetFormBtn");

    submitButton.addEventListener("click", (e) => {
        e.preventDefault();

        const fullName = document.getElementById("nameInput").value.trim();
        const nickname = document.getElementById("nicknameInput").value.trim();
        const preferredDate = document.getElementById("dateSelect").value;
        const startTimeVal = startTime.value;
        const endTimeVal = endTime.value;
        const category = categorySelect.value;
        
        let finalPlace = selectedPlaceInput.value;
        let finalAddress = exactAddressText.textContent;

        if (category === "Others") {
            finalPlace = customPlaceName.value.trim();
            finalAddress = customPlaceAddress.value.trim();
        }

        if (!fullName || !nickname || !preferredDate || !finalPlace) {
            alert("Please fill out all required fields (Full Name, Nickname, Date, and Location).");
            return;
        }

        if (yesCompanion.checked && (!nameCom.value.trim() || !relationCom.value.trim())) {
            alert("Please provide your companion's full name and relationship.");
            return;
        }

        if (category === "Others" && !finalAddress) {
            alert("Please provide the exact address for your custom place.");
            return;
        }

        const selectedActivities = [];
        document.querySelectorAll('input[name="activities"]:checked').forEach((checkbox) => {
            selectedActivities.push(checkbox.value);
        });

        const hangoutData = {
            fullName: fullName,
            nickname: nickname,
            hasCompanion: yesCompanion.checked ? "Yes" : "No",
            companionName: yesCompanion.checked ? nameCom.value.trim() : "None",
            companionRelation: yesCompanion.checked ? relationCom.value.trim() : "None",
            date: preferredDate,
            timeSlot: `${startTimeVal} to ${endTimeVal}`,
            category: category,
            venueName: finalPlace,
            venueAddress: finalAddress,
            activities: selectedActivities
        };

        successMessage.textContent = `Thank you and see you, ${nickname}! 🌸`;
        formMainContainer.style.display = "none";
        successScreen.style.display = "flex";

        addDoc(collection(db, "hangoutResponses"), {
            ...hangoutData,
            timestamp: new Date()
        }).then((docRef) => {
            console.log("Successfully saved in background with ID: ", docRef.id);
        }).catch((err) => {
            console.error("Error saving to Firestore in background:", err);
        });
    });

    resetFormBtn.addEventListener("click", () => {
        location.reload();
    });
});