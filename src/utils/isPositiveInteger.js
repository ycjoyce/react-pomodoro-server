const isPositiveInteger = (num) => {
  return num > 0 && Math.floor(num) === num;
};

module.exports = isPositiveInteger;