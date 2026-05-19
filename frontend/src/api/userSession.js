export function getCurrentUserId() {
  const directUserId = localStorage.getItem("userId");

  if (directUserId) {
    return directUserId;
  }

  const possibleUserKeys = [
    "user",
    "currentUser",
    "loggedInUser",
    "smartMovieFinderUser",
  ];

  for (const key of possibleUserKeys) {
    const rawUser = localStorage.getItem(key);

    if (!rawUser) continue;

    try {
      const parsedUser = JSON.parse(rawUser);

      if (parsedUser?.id) return parsedUser.id;
      if (parsedUser?.userId) return parsedUser.userId;
    } catch {
      // Ignore invalid localStorage data
    }
  }

  return null;
}