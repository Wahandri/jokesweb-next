export function serializeJokesWithAuthorAndScore(jokes = []) {
  const plainJokes = JSON.parse(JSON.stringify(jokes));

  return plainJokes.map((joke) => {
    let authorObj = {
      username: "Anónimo",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
    };

    if (joke.author) {
      if (typeof joke.author === "object" && joke.author.username) {
        authorObj = {
          username: joke.author.username,
          image:
            joke.author.image ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author.username}`,
        };
      } else if (typeof joke.author === "string") {
        authorObj = {
          username: joke.author,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${joke.author}`,
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
