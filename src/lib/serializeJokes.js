export function serializeJokesWithAuthorAndScore(jokes = []) {
  const plainJokes = JSON.parse(JSON.stringify(jokes));

  return plainJokes.map((joke) => {
    let authorObj = {
      username: "Anónimo",
      avatarConfig: null,
      image: "",
    };

    if (joke.author) {
      if (typeof joke.author === "object" && joke.author.username) {
        authorObj = {
          username: joke.author.username,
          avatarConfig: joke.author.avatarConfig || null,
          image: joke.author.image || "",
        };
      } else if (typeof joke.author === "string") {
        authorObj = {
          username: joke.author,
          avatarConfig: null,
          image: "",
        };
      }
    }

    return {
      ...joke,
      author: authorObj,
      score: joke.averageRating || joke.score || 0,
    };
  });
}
