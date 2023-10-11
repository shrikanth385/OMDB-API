document.addEventListener("DOMContentLoaded", function () {
  const carouselTrack = document.querySelector(".carousel-track");
  const imageWidth = document.querySelector("img").clientWidth;
  let currentPosition = 0;

  function moveCarousel() {
    currentPosition -= imageWidth;
    carouselTrack.style.transition = "transform 1s ease-in-out";
    carouselTrack.style.transform = `translateX(${currentPosition}px)`;

    if (currentPosition <= -carouselTrack.clientWidth) {
      currentPosition = 0;
      carouselTrack.style.transition = "none";
      carouselTrack.style.transform = "translateX(0)";
      setTimeout(() => {
        carouselTrack.style.transition = "transform 1s ease-in-out";
      }, 0);
    }
  }

  setInterval(moveCarousel, 1000);

  // Function to fetch movie suggestions from OMDB API
  function fetchMovieSuggestions(query) {
    const apiKey = "21dbd1f3"; // Replace with your actual OMDB API key

    return fetch(
      `https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&type=movie`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.Search) {
          return data.Search.map((movie) => movie.Title);
        } else {
          return [];
        }
      })
      .catch((error) => {
        console.error("Error fetching movie suggestions:", error);
        return [];
      });
  }

  function fetchMovieData(movieTitle) {
    const apiKey = "21dbd1f3"; // Replace with your actual OMDB API key

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${movieTitle}`)
      .then((response) => response.json())
      .then((data) => {
        // Display movie information on the page
        document
          .querySelector(".carousel-container")
          .classList.add("slide-bottom");
        const movieInfoContainer =
          document.getElementById("movieInfoContainer");
        movieInfoContainer.classList.add("scale-up-center");
        const movieHeadingElements = document.createElement("div");
        const movieContext = document.createElement("div");
        const favoritesButton = document.createElement("button");
        const movieTitleElement = document.createElement("h2");
        const moviePoster = document.createElement("img");
        const moviePlotElement = document.createElement("p");
        const movieCastElement = document.createElement("p");

        movieInfoContainer.innerHTML = ""; // Clear previous content
        movieInfoContainer.style.display = "flex";
        movieInfoContainer.style.flexDirection = "column";
        movieInfoContainer.style.justifyContent = "space-between";
        movieInfoContainer.style.alignItems = "center";
        movieHeadingElements.style.display = "flex";
        movieHeadingElements.style.width = "100%";
        movieHeadingElements.style.justifyContent = "space-evenly";
        movieHeadingElements.style.marginBottom = "10px";
        movieContext.style.display = "flex";
        movieContext.style.justifyContent = "space-between";
        movieTitleElement.textContent = `${data.Title} (${data.Year})`;

        moviePoster.src = data.Poster;
        moviePoster.alt = data.Title;
        favoritesButton.textContent = "Add to favorites";
        favoritesButton.style.fontSize = "0.5rem";
        favoritesButton.classList.add("button-style");
        moviePlotElement.textContent = data.Plot;
        movieCastElement.textContent = `Cast: ${data.Actors}`;

        // Retrieve favorites from local storage
        const favorites = getFavorites() || [];
        console.log(favorites);
        // Check if the current movie is already in favorites
        const isFavorite = favorites.includes(`${data.Title}|${data.Poster}`);

        if (isFavorite) {
          favoritesButton.textContent = "Remove from favorites";
        }

        favoritesButton.addEventListener("click", function () {
          // Toggle between adding and removing from favorites
          if (isFavorite) {
            // Remove from favorites
            const updatedFavorites = favorites.filter(
              (fav) => fav !== `${data.Title}|${data.Poster}`
            );

            setFavorites(updatedFavorites);
            favoritesButton.textContent = "Add to favorites";
          } else {
            // Add to favorites
            const newFavorite = `${data.Title}|${data.Poster}`;
            favorites.push(newFavorite);
            setFavorites(favorites);
            favoritesButton.textContent = "Remove from favorites";
          }

          // Update the favorites list or perform other actions as needed
          updateFavoritesList();
        });

        movieHeadingElements.appendChild(movieTitleElement);
        movieHeadingElements.appendChild(favoritesButton);
        movieInfoContainer.appendChild(movieHeadingElements);
        movieInfoContainer.appendChild(movieContext);
        movieContext.appendChild(moviePoster);
        movieContext.appendChild(moviePlotElement);
        movieContext.appendChild(movieCastElement);
      })
      .catch((error) => console.error("Error fetching movie data:", error));
  }

  function getFavorites() {
    // Retrieve favorites from local storage
    localStorage.clear();
    return localStorage.getItem("favorites")
      ? localStorage.getItem("favorites").split(",")
      : [];
  }

  function setFavorites(favorites) {
    // Store favorites in local storage
    localStorage.setItem("favorites", favorites.join(","));
  }

  function updateFavoritesList() {
    const favoritesContainer = document.getElementById("favoritesContainer");
    favoritesContainer.style.display = "flex";
    // Clear previous favorites
    favoritesContainer.innerHTML = "";

    // Retrieve favorites from local storage
    const favorites = getFavorites();

    if (favorites.length > 0) {
      const favoritesTitle = document.createElement("h2");
      favoritesTitle.textContent = "Favorite Movies";
      favoritesContainer.appendChild(favoritesTitle);

      const favoritesList = document.createElement("ul");

      // Create list items for each favorite movie
      favorites.forEach((favorite) => {
        // Split the favorite string into title and poster using a delimiter (e.g., "|")
        const [title, poster] = favorite.split("|");

        const listItem = document.createElement("li");

        // Display the title
        const titleElement = document.createElement("h3");
        titleElement.textContent = title;
        listItem.appendChild(titleElement);

        // Display the poster
        const posterElement = document.createElement("img");
        posterElement.src = poster;
        posterElement.alt = title;
        listItem.appendChild(posterElement);

        favoritesList.appendChild(listItem);
      });

      favoritesContainer.appendChild(favoritesList);
    } else {
      const noFavoritesMessage = document.createElement("p");
      noFavoritesMessage.textContent = "No favorite movies yet.";
      favoritesContainer.appendChild(noFavoritesMessage);
    }
  }

  // Event listener for the search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();

    if (query !== "") {
      fetchMovieSuggestions(query).then((suggestions) => {
        console.log("Fetched Suggestions:", suggestions);

        // Display suggestions dynamically
        const suggestionsContainer = document.getElementById(
          "suggestionsContainer"
        );
        suggestionsContainer.innerHTML = ""; // Clear previous suggestions

        if (suggestions.length > 0) {
          suggestions.forEach((suggestion) => {
            const suggestionElement = document.createElement("div");
            suggestionElement.classList.add("suggestion");
            suggestionElement.textContent = suggestion;

            suggestionElement.addEventListener("click", function () {
              // Set the selected suggestion as the search input value
              searchInput.value = suggestion;
              // Clear suggestions
              suggestionsContainer.innerHTML = "";

              // Fetch movie data for the selected suggestion
              fetchMovieData(suggestion);
            });

            suggestionsContainer.appendChild(suggestionElement);
          });
        } else {
          // If no suggestions found, display a message
          const noSuggestionsMessage = document.createElement("div");
          noSuggestionsMessage.textContent = "No matching suggestions found.";
          noSuggestionsMessage.classList.add("no-suggestions");
          suggestionsContainer.appendChild(noSuggestionsMessage);
        }
      });
    } else {
      // Clear suggestions if the input is empty
      const suggestionsContainer = document.getElementById(
        "suggestionsContainer"
      );
      suggestionsContainer.innerHTML = "";
    }
  });

  // Event listener for the search button
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", function () {
    const query = searchInput.value.trim();
    if (query !== "") {
      // Perform search based on the selected suggestion or entered query
      fetchMovieData(query);
    }
    // Clear suggestions
    const suggestionsContainer = document.getElementById(
      "suggestionsContainer"
    );
    suggestionsContainer.innerHTML = "";
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
