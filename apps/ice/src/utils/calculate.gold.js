export const calculateGoldByRank = (rank) => {
  switch (rank) {
    case 1:
      return 20;
    case 2:
      return 10;
    case 3:
      return 5;
    case 4:
      return 1;
  }
};
